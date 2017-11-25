import GulpTask from 'gulptask';

import {translatePipe} from './helpers/pipes';
import {translationDir} from './helpers/dirs';

new GulpTask({
  name: 'number:lines',
  description: 'Inputs a file, outputs its lines numbered',
  glob: 'goals/goal8.TODO',
  pipe: translatePipe({
    grammar: 'Line',
    listener: 'LineCounter',
    rule: 'file',
  }),
  dest: translationDir,
});