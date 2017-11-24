'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var newer = require('gulp-newer');
var debug = require('gulp-debug');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var autoreload = require('autoreload-gulp');
var usePlumbedGulpSrc = require('plumb-gulp').usePlumbedGulpSrc;

var gulpDir = 'build/gulp';
var fixGulpDir = 'gulp';
var autoTask = 'tdd';

try {
  usePlumbedGulpSrc();

  // Attempt to load all include files from gulpDir
  fs.readdirSync(gulpDir).filter(function (filename) {
    return filename.match(/\.js$/);
  }).forEach(function (filename) {
    require(path.join(process.cwd(), gulpDir, filename));
  });

  // If success, start infinite dev process with autoreload
  gulp.task('default', autoreload(autoTask, gulpDir));
} catch (err) {
  // If error, try to regenerate include files
  gutil.log(chalk.red(err.stack));
  gutil.log(chalk.green('Attempting to regenerate gulp include files'));
  gutil.log(chalk.green(
    'If process returns, fix first the above error'));
  gutil.log(chalk.green('Then relaunch'));

  function transpileGulp () {
    return gulp.src('gulp/**/*.js', {
      base: '.'
    })
      .pipe(newer('build'))
      .pipe(debug())
      .pipe(babel())
      .pipe(gulp.dest('build'));
  };

  var autoReload = autoreload('default', fixGulpDir);
  Object.defineProperty(autoReload, 'name', {value: 'autoReload'});

  gulp.task(autoTask, gulp.series(transpileGulp, autoReload));

  gulp.task('default', transpileGulp);
}
