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
var useOriginalGulpSrc = require('plumb-gulp').useOriginalGulpSrc;

var gulpSrc = 'gulp/**/*.js';
var buildDir = 'build';
var gulpDir = path.join(`${buildDir}`, 'gulp');
var autoTask = 'tdd';

usePlumbedGulpSrc();

try {
  // Attempt to load all include files from gulpDir
  fs.readdirSync(gulpDir).filter(function (filename) {
    return filename.match(/\.js$/);
  }).forEach(function (filename) {
    require(path.join(process.cwd(), gulpDir, filename));
  });

  gulp.task(autoTask, gulp.series('tdd:transpile:gulp', 'tdd:number:lines'));

  // If success, start infinite dev process with autoreload
  gulp.task('default', autoreload(autoTask, gulpDir));
} catch (err) {
  // If error, try to regenerate include files

  // First make sure to abort on first subsequent error
  useOriginalGulpSrc();

  // define regeneration functions
  function transpileGulp () {
    return gulp.src(gulpSrc, {
      base: '.'
    })
      .pipe(newer(buildDir))
      .pipe(debug())
      .pipe(babel())
      .on('error', function (err) {
        gutil.log(chalk.red(err.stack));
      })
      .pipe(gulp.dest(buildDir));
  }

  function watchGulp (done) {
    gulp.watch(gulpSrc, transpileGulp);
    done();
  }

  // Distinguish between missing gulpDir ...
  if (err.message.match(new RegExp(`no such file or directory, scandir '${
    gulpDir}'`)) || err.message.match(/Task never defined/) ||
    err.message.match(/Cannot find module '\.\.?\//)) {
    gutil.log(chalk.red(err.message));
    gutil.log(chalk.yellow(`'${gulpDir}/**/*.js' incomplete; Regenerating`));

    // ... And errors due to corrupted files
  } else {
    gutil.log(chalk.red(err.stack));
  }

  gulp.task(autoTask, watchGulp);

  gulp.task('default', gulp.series(transpileGulp, autoreload(
    autoTask, gulpDir)));
}
