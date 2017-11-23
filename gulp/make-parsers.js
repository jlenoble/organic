import GulpTask from 'gulptask';
import antlr4 from 'gulp-antlr4';
import newer from 'gulp-antlr4-newer';
import debug from 'gulp-debug';

import {grammarGlob} from './helpers/source-globs';
import {parserDir} from './helpers/dirs';

const taskname = 'make:parsers';

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
