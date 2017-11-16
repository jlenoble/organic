import gulp from 'gulp';
import babel from 'gulp-babel';
import newer from 'gulp-newer';
import debug from 'gulp-debug';

const transpile = ({glob, dest}) => () => {
  return gulp.src(glob, {
    base: process.cwd(),
  })
    .pipe(newer(dest))
    .pipe(debug())
    .pipe(babel())
    .pipe(gulp.dest(dest));
};

export default transpile;
