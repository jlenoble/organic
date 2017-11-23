import GulpTask from 'gulptask';
import antlr4 from 'gulp-antlr4';
import newer from 'gulp-antlr4-newer';
import debug from 'gulp-debug';

const taskname = 'make:parsers';
const grammarGlob = 'grammars/**/*.g4';
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
