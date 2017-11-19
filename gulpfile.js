'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var fs = require('fs');
var path = require('path');

try {
  var gulpDir = 'build/gulp';

  fs.readdirSync(gulpDir).filter(function (filename) {
    return filename.match(/\.js$/);
  }).forEach(function (filename) {
    require(path.join(process.cwd(), gulpDir, filename));
  });

  gulp.task('default', gulp.series('gulp', 'watch:translators', 'number'));
} catch (err) {
  if (err.message.match(/ENOENT/ || err.message.match(/cannot find/i))) {
    gulp.task('default', function () {
      return gulp.src('gulp/**/*.js', {
        base: '.'
      })
        .pipe(babel())
        .pipe(gulp.dest('build'));
    });
  } else {
    throw err;
  }
}
