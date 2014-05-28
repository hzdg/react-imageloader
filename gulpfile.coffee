gulp = require 'gulp'
mocha = require 'gulp-mocha'
chalk = require 'chalk'
gbump = require 'gulp-bump'
coffee = require 'gulp-coffee'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'

yargs = require 'yargs'
  .wrap 80
  .alias 'h', 'help'
  .describe 'help', 'Show this help information.'
  .check (argv) -> if argv.help then throw new Error 'Help!'


log = (plugin, msg) -> console.log chalk.reset("[#{chalk.green plugin}]"), msg
log.warn = (plugin, msg) -> console.warn chalk.reset("[#{chalk.yellow plugin}]"), msg
log.error = (plugin, error) ->
  prefix = chalk.reset "[#{chalk.red plugin}]"
  if error.stack
    console.error prefix, line for line in error.stack.split '\n'
  else console.error prefix, error.message or error


gulp.task 'build:node', ->
  gulp.src './src/*.?(lit)coffee'
    .pipe coffee(bare: true).on 'error', (error) ->
      log.error 'coffee', error
    .pipe gulp.dest './lib'


gulp.task 'build:browser', ->
  gulp.src './src/index.coffee'
    .pipe coffee(bare: true).on 'error', (error) ->
      log.error 'coffee', error
    .pipe browserify
      standalone: 'ReactLoaderComponents'
      transform: ['browserify-shim']
    .pipe rename('react-loadercomponents.js')
    .pipe gulp.dest('./standalone/')


gulp.task 'build', ['build:node', 'build:browser']


gulp.task 'bump', ->
  argv = yargs
    .usage '''

           Bump the package version.

           With no options, bumps to the next patch version.

           Usage: gulp bump [--major|--minor|--patch|--to x.x.x]
           '''
    .options
      major:
        describe: 'Bump the package to the next major version (1.x.x to 2.0.0)'
      minor:
        describe: 'Bump the package to the next minor version (1.0.x to 1.1.0)'
      patch:
        describe: 'Bump the package to the next patch version (1.0.0 to 1.0.1)'
      to:
        describe: 'Bump the package to the specified version'
    .check (argv) ->
      if argv.major and argv.minor
        throw new Error 'Cannot specify both major and minor'
      else if argv.major and argv.patch
        throw new Error 'Cannot specify both major and patch'
      else if argv.major and argv.to
        throw new Error 'Cannot specify both major and version'
      else if argv.minor and argv.patch
        throw new Error 'Cannot specify both minor and patch'
      else if argv.minor and argv.to
        throw new Error 'Cannot specify both minor and version'
      else if argv.patch and argv.to
        throw new Error 'Cannot specify both patch and version'
    .argv

  opts =
    if argv.to
      version: argv.to
    else if argv.major
      type: 'major'
    else if argv.minor
      type: 'minor'
    else
      type: 'patch'

  gulp.src ['./bower.json', './package.json']
    .pipe gbump opts
    .pipe gulp.dest './'


gulp.task 'test', ['build'], ->
  argv = yargs
    .usage '''

           Run the test suite.

           Usage: gulp test [--grep 'some string']
           '''
    .options
      grep:
        alias: 'g'
        describe: '''
                  Run only the tests that pass a grep-like match against the
                  provided string. This is a very thin wrapper around the mocha
                  'grep' option.
                  '''
    .argv

  gulp.src ['./test/**/*.coffee'], read: false
    .pipe mocha(reporter: 'spec', grep: argv.grep).on 'error', (error) ->
      log.error 'mocha', error


gulp.task 'watch', ->
  gulp.watch ['./src/**/*', './test/**/*'], ['test']


gulp.task 'dev', ['test', 'watch']
