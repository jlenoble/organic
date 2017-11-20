import gulp from 'gulp';
import {buildListeners} from './helpers/translate';

const grammarGlob = 'grammars/**/*.g4';
const parserDir = 'build/parsers';

gulp.task('build:listeners', buildListeners({grammarGlob, parserDir}));
