import gulp from 'gulp';
import {makeListeners} from './helpers/translate';

const grammarGlob = 'grammars/**/*.g4';
const parserDir = 'build/parsers';

gulp.task('make:listeners', makeListeners({grammarGlob, parserDir}));
