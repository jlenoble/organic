import gulp from 'gulp';

import {translate} from './helpers/translate';
import {parserDir, listenerDir, translationDir} from './helpers/dirs';

const dataGlob = 'gulpfile.js';

const grammar = 'Line';
const listener = 'LineCounter';
const rule = 'file';
const dest = translationDir;

gulp.task('number', translate({
  dataGlob, grammar, parserDir, listener, listenerDir, rule, dest,
}));
