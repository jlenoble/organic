'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var newer = require('gulp-newer');
var debug = require('gulp-debug');
var fs = require('fs');
var path = require('path');

try {
  var gulpDir = 'build/gulp';

  fs.readdirSync(gulpDir).filter(function (filename) {
    return filename.match(/\.js$/);
  }).forEach(function (filename) {
    require(path.join(process.cwd(), gulpDir, filename));
  });

  gulp.task('default', gulp.parallel('tdd:make:parsers', 'tdd:transpile:gulp',
    'tdd:transpile:translators'));
} catch (err) {
  // Always try to regenerate gulp includes on error so that this gulp process
  // has new deps to work with on restart (otherwise if the error were
  // traced back to a gulp include, then its transpiled version couldn't ever
  // be generated).

  gulp.task('default', function () {
    return gulp.src('gulp/**/*.js', {
      base: '.'
    })
      .pipe(newer('build'))
      .pipe(debug())
      .pipe(babel())
      .pipe(gulp.dest('build'));
  });

  console.error(err);
}
