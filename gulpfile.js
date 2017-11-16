const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () => {
  return gulp.src('*.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});
