import PolyPipe from 'polypipe';
import gulp from 'gulp';
import babel from 'gulp-babel';
import newer from 'gulp-newer';
import debug from 'gulp-debug';
import antlr4 from 'gulp-antlr4';
import antlr4Newer from 'gulp-antlr4-newer';

import {buildDir, parserDir} from './dirs';

// Transpile pipeline
const transpilePipe = new PolyPipe(
  [newer, buildDir],
  debug,
  babel
);

// Make parser pipeline
const makeParserPipe = new PolyPipe(
  [antlr4Newer, parserDir],
  debug,
  [antlr4, parserDir]
);

// Export all
export {transpilePipe, makeParserPipe};
