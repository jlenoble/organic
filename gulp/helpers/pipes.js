import PolyPipe from 'polypipe';
import gulp from 'gulp';
import babel from 'gulp-babel';
import antlr4 from 'gulp-antlr4';

import {parserDir, listenerDir} from './dirs';

import {PluginError} from 'gulp-util';
import through from 'through2';
import path from 'path';

const PLUGIN_NAME = 'gulp-require-uncache';

function uncache () {
  return require && require.cache ? through.obj(function (
    file, encoding, done) {
    if (file.isNull()) {
      return done(null, file);
    }

    if (file.isStream()) {
      this.emit( // eslint-disable-line no-invalid-this
        'error', new PluginError(PLUGIN_NAME, 'Streams are not supported'));
      return done();
    }

    if (file.isBuffer()) {
      if (require.cache[file.path]) {
        delete require.cache[file.path];
      }

      return done(null, file);
    }
  }) : gutil.noop();
}

// Transpile pipeline
export const transpilePipe = new PolyPipe(babel);

// Require uncache pipeline
export const requireUncachePipe = new PolyPipe(uncache);

// Make parser pipeline
export const makeParserPipe = new PolyPipe([antlr4, parserDir]);

// Translate pipeline factory
export const translatePipe = ({grammar, listener, rule}) => new PolyPipe(
  [antlr4, {grammar, listener, rule, parserDir, listenerDir}]);
