import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';
import newer from 'gulp-newer';
import debug from 'gulp-debug';

const makeTranslator = ({glob, dest}) => () => {
  return gulp.src(glob, {
    base: process.cwd(),
  })
    .pipe(newer(dest))
    .pipe(debug())
    .pipe(antlr4(dest));
};

const translate = ({
  glob, grammar, parserDir, listener, listenerDir, rule,
}) => () => {
  return gulp.src(glob, {
    base: process.cwd(),
  })
    .pipe(antlr4({
      grammar, parserDir, listener, listenerDir, rule,
    }))
};

export {makeTranslator, translate};
