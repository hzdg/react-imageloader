import gulp from 'gulp';
import chalk from 'chalk';
import gbump from 'gulp-bump';
import connect from 'gulp-connect';
import open from 'open';
import webpack from 'webpack';
import webpackConfig from './webpack.config';
import yargs from 'yargs';

yargs
  .wrap(80)
  .alias('h', 'help')
  .describe('help', 'Show this help information.')
  .check(argv => { if (argv.help) throw new Error('Help!'); });


function log(plugin, msg) {
  console.log(chalk.reset(`[${chalk.green(plugin)}]`), msg);
}

Object.assign(log, {
  warn(plugin, msg) {
    console.warn(chalk.reset(`[${chalk.yellow(plugin)}]`), msg);
  },
  error(plugin, error) {
    const prefix = chalk.reset(`[${chalk.red(plugin)}]`);
    if (error.stack) {
      error.stack.split('\n').forEach(line => { console.error(prefix, line); });
    } else {
      console.error(prefix, error.message || error);
    }
  },
});

gulp.task('build:node', () => {
  gulp.src('./src/*.?(lit)coffee')
    .pipe(coffee, {bare: true})
    .on('error', error => {
      log.error('coffee', error);
      this.end();
    })
    .pipe(gulp.dest('./lib'));
});

gulp.task('build:browser', done => {
  webpack(webpackConfig)
    .run((err, stats) => {
      if (err) {
        log.err('webpack', err);
        throw err;
      }

      stats
        .toString({colors: true, chunks: false})
        .split('\n')
        .forEach(line => { log('webpack', line); });

      connect.reload();
      done();
    });
});

gulp.task('build:tests', () => {
  gulp.src('./test/**/*.?(lit)coffee')
    .pipe(coffee())
    .on('error', error => {
      log.error('coffee', error);
      this.end();
    })
    .pipe(gulp.dest('./test/'))
    .pipe(connect.reload());
});


gulp.task('build', ['build:node', 'build:browser']);


gulp.task('bump', () => {
  const argv = yargs
    .usage(
```

Bump the package version.

With no options, bumps to the next patch version.

Usage: gulp bump [--major|--minor|--patch|--to x.x.x]
```
    )
    .options({
      major: {describe: 'Bump the package to the next major version (1.x.x to 2.0.0)'},
      minor: {describe: 'Bump the package to the next minor version (1.0.x to 1.1.0)'},
      patch: {describe: 'Bump the package to the next patch version (1.0.0 to 1.0.1)'},
      to: {describe: 'Bump the package to the specified version'},
    })
    .check(({major, minor, patch, to}) => {
      if (major && minor) {
        throw new Error('Cannot specify both major and minor');
      } else if (major && patch) {
        throw new Error('Cannot specify both major and patch');
      } else if (major && to) {
        throw new Error('Cannot specify both major and version');
      } else if (minor && patch) {
        throw new Error('Cannot specify both minor and patch');
      } else if (minor && to) {
        throw new Error('Cannot specify both minor and version');
      } else if (patch && to) {
        throw new Error('Cannot specify both patch and version');
      }
    })
    .argv;

  let opts = {};
  if (argv.to) opts.version = argv.to;
  else if (argv.major) opts.type = 'major';
  else if (argv.minor) opts.type = 'minor';
  else opts.type = 'patch';

  gulp.src(['./bower.json', './package.json'])
    .pipe(gbump(opts))
    .pipe(gulp.dest('./'));
});


// A server for the test page
gulp.task('testserver', () => {
  const opts = {
    root: __dirname,
    host: 'localhost',
    port: 1337,
    livereload: true,
  };

  connect.server(opts);

  const url = `http://${opts.host}:${opts.port}/test/index.html`;
  const browser = 'Google Chrome';

  open(url, browser, error => {
    if (error) log.error('open', error);
    else log('open', `Opened ${chalk.magenta(url)} in ${chalk.green(browser)}`);
    return {file: 'index.html'};
  });
});


gulp.task('test', ['build:browser', 'build:tests', 'testserver']);


gulp.task('watch', () => {
  gulp.watch('./src/**/*.?(lit)coffee', ['build']);
  gulp.watch('./test/**/*.?(lit)coffee', ['build:tests']);
});


gulp.task('dev', ['test', 'watch']);
