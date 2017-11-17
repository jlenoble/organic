import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';
import newer from 'gulp-antlr4-newer';
import debug from 'gulp-debug';

const makeListeners = ({grammarGlob, parserDir}) => () => {
  return gulp.src(grammarGlob, {
    base: process.cwd(),
  })
    .pipe(newer(parserDir))
    .pipe(debug())
    .pipe(antlr4(parserDir));
};

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

export {makeListeners, translate};
