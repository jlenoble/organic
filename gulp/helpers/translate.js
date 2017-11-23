import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

const translate = ({
  dataGlob, grammar, parserDir, listener, listenerDir, rule, dest
}) => () => {
  return gulp.src(dataGlob, {
    base: process.cwd(),
  })
    .pipe(antlr4({
      grammar, parserDir, listener, listenerDir, rule,
    }))
    .pipe(gulp.dest(dest));
};

export {translate};
