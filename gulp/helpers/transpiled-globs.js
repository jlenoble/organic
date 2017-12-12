import GulpGlob from 'gulpglob';
import destglob from 'destglob';

import {gulpGlob, translatorGlob} from './source-globs';
import {buildDir} from './dirs';

// Transpiled Gulpfile includes and helpers
export const buildGulpGlob = new GulpGlob(
  destglob(gulpGlob.glob, buildDir));

// Transpiled custom translators files
export const buildTranslatorGlob = new GulpGlob(
  destglob(translatorGlob.glob, buildDir));
