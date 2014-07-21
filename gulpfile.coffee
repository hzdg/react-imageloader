gulp = require 'gulp'
chalk = require 'chalk'
gbump = require 'gulp-bump'
coffee = require 'gulp-coffee'
rename = require 'gulp-rename'
connect = require 'gulp-connect'
open = require 'open'
path = require 'path'
webpack = require 'webpack'
webpackConfig = require './webpack.config'

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
    .pipe coffee bare: true
    .on 'error', (error) ->
      log.error 'coffee', error
      @end()
    .pipe gulp.dest './lib'


gulp.task 'build:browser', (done) ->
  web = webpack webpackConfig
    .run (err, stats) ->
      if err then log.error('webpack', err) and throw err
      log 'webpack', line for line in stats
        .toString colors: true, chunks: false
        .split '\n'
      connect.reload()
      done()


gulp.task 'build:tests', ->
  gulp.src './test/**/*.?(lit)coffee'
    .pipe coffee()
    .on 'error', (error) ->
      log.error 'coffee', error
      @end()
    .pipe gulp.dest('./test/')
    .pipe connect.reload()


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


# A server for the test page
gulp.task 'testserver', ->
  connect.server opts =
    root: __dirname
    host: 'localhost'
    port: 1337
    livereload: true
  url = "http://#{opts.host}:#{opts.port}/test/index.html"
  browser = 'Google Chrome'
  open url, browser, (error) ->
    if error
      log.error 'open', error
    else
      log 'open', "Opened #{chalk.magenta url} in #{chalk.green browser}"
      file: 'index.html'


gulp.task 'test', ['build:browser', 'build:tests', 'testserver']


gulp.task 'watch', ->
  gulp.watch './src/**/*.?(lit)coffee', ['build']
  gulp.watch './test/**/*.?(lit)coffee', ['build:tests']


gulp.task 'dev', ['test', 'watch']
