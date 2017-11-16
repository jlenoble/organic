const gulp = require('gulp');
const babel = require('gulp-babel');
const fs = require('fs');
const path = require('path');

try {
  const gulpDir = 'build/gulp';

  fs.readdirSync(gulpDir)
    .filter(filename => {
      return filename.match(/\.js$/);
    })
    .forEach(filename => {
      require(path.join(process.cwd(), gulpDir, filename));
    });

  gulp.task('default', gulp.series('gulp', 'build'));
} catch (err) {
  gulp.task('default', () => {
    return gulp.src('gulp/**/*.js', {base: '.'})
      .pipe(babel())
      .pipe(gulp.dest('build'));
  });
}
