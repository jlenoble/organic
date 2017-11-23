import GulpTask from 'gulptask';
import gulp from 'gulp';
import babel from 'gulp-babel';
import newer from 'gulp-newer';
import debug from 'gulp-debug';

import './helpers/transpiled-globs'; // Predefine transpiled globs

import {gulpGlob, translatorGlob} from './helpers/source-globs';
import {buildDir} from './helpers/dirs';

new GulpTask({
  name: 'transpile:gulp',
  glob: gulpGlob,
  dest: buildDir,
  pipe: [
    [newer, buildDir],
    debug,
    babel,
  ],
});

new GulpTask({
  name: 'transpile:translators',
  glob: translatorGlob,
  dest: buildDir,
  pipe: [
    [newer, buildDir],
    debug,
    babel,
  ],
});
