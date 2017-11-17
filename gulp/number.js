import gulp from 'gulp';
import {translate} from './helpers/translate';

const dataGlob = 'gulpfile.js';

const parserDir = 'build/parsers';
const listenerDir = 'build/translators';

const grammar = 'Line';
const listener = 'LineCounter';
const rule = 'file';
const dest = 'build/translations';

gulp.task('number', translate({
  dataGlob, grammar, parserDir, listener, listenerDir, rule, dest,
}));
