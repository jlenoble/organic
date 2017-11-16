import gulp from 'gulp';
import {makeTranslator, translate} from './helpers/translate';

const grammarGlob = 'grammars/Line.g4';
const dataGlob = 'gulpfile.js';

const parserDir = 'build/parsers';
const listenerDir = 'build/translators';

const grammar = 'Line';
const listener = 'LineCounter';
const rule = 'file';

gulp.task('number', gulp.series(
  makeTranslator({
    glob: grammarGlob, dest: parserDir
  }),
  translate({
    glob: dataGlob,
    grammar, parserDir, listener, listenerDir, rule
  })
));
