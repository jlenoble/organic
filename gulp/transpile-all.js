import GulpTask from 'gulptask';

import {gulpGlob, translatorGlob} from './helpers/source-globs';
import {buildDir} from './helpers/dirs';
import {transpilePipe} from './helpers/pipes';

new GulpTask({
  name: 'transpile:gulp',
  glob: gulpGlob,
  dest: buildDir,
  pipe: transpilePipe,
  debug: true,
});

new GulpTask({
  name: 'transpile:translators',
  glob: translatorGlob,
  dest: buildDir,
  pipe: transpilePipe,
  debug: true,
});
