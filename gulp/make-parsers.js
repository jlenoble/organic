import GulpTask from 'gulptask';
import antlr4 from 'gulp-antlr4';
import newer from 'gulp-antlr4-newer';
import debug from 'gulp-debug';

import {grammarGlob} from './helpers/source-globs';

const taskname = 'make:parsers';
const parserDir = 'build/parsers';

new GulpTask({
  name: taskname,
  glob: grammarGlob,
  dest: parserDir,
  pipe: [
    [newer, parserDir],
    debug,
    [antlr4, parserDir],
  ],
});
