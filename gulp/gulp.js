import gulp from 'gulp';
import babel from 'gulp-babel';
import newer from 'gulp-newer';
import debug from 'gulp-debug';

gulp.task('gulp', () => {
  return gulp.src('gulp/**/*.js', {base: '.'})
    .pipe(newer('build'))
    .pipe(debug())
    .pipe(babel())
    .pipe(gulp.dest('build'));
});
