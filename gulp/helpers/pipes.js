import PolyPipe from 'polypipe';
import gulp from 'gulp';
import babel from 'gulp-babel';
import antlr4 from 'gulp-antlr4';
import uncache from 'gulp-require-uncache';

import {parserDir, listenerDir} from './dirs';

// Transpile pipeline
export const transpilePipe = new PolyPipe(babel);

// Require uncache pipeline
export const requireUncachePipe = new PolyPipe(uncache);

// Make parser pipeline
export const makeParserPipe = new PolyPipe([antlr4, parserDir]);

// Translate pipeline factory
export const translatePipe = ({grammar, listener, rule}) => new PolyPipe(
  [antlr4, {grammar, listener, rule, parserDir, listenerDir}]);
