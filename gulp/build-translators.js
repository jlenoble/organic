import gulp from 'gulp';
import {makeListeners} from './helpers/translate';
import transpile from './helpers/transpile';

const grammarGlob = 'grammars/**/*.g4';
const translatorGlob = 'translators/**/*.js';

const dest = 'build';
const parserDir = 'build/parsers';

gulp.task('make:listeners', makeListeners({grammarGlob, parserDir}));

gulp.task('transpile:translators', transpile({glob: translatorGlob, dest}));

gulp.task('build:translators', gulp.series('make:listeners',
  'transpile:translators'));
