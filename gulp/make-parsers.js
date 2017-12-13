import GulpTask from 'gulptask';

import {grammarGlob} from './helpers/source-globs';
import {buildTranslatorGlob} from './helpers/transpiled-globs';
import {parserDir} from './helpers/dirs';
import {requireUncachePipe, makeParserPipe} from './helpers/pipes';

new GulpTask({
  name: 'uncache:translators',
  glob: buildTranslatorGlob,
  pipe: requireUncachePipe,
});

new GulpTask({
  name: 'make:parsers',
  glob: grammarGlob,
  dest: parserDir,
  pipe: makeParserPipe,
  dependsOn: 'uncache:translators',
});
