import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('build', () => {
  return gulp.src('*.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});
