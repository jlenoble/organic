import GulpTask from 'gulptask';

import {grammarGlob} from './helpers/source-globs';
import {parserDir} from './helpers/dirs';
import {makeParserPipe} from './helpers/pipes';

new GulpTask({
  name: 'make:parsers',
  glob: grammarGlob,
  dest: parserDir,
  pipe: makeParserPipe,
  debug: true,
});
