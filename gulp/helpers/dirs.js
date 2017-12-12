import path from 'path';

// Main build directory
export const buildDir = 'build';

// Gulp includes and helpers directory
export const gulpDir = 'gulp';

// Grammar directory
export const grammarDir = 'grammars';

// Generated parser directory
export const parserDir = path.join(buildDir, 'parsers');

// Translator directory
export const translatorDir = 'translators';

// Transpiled translator directory (that is to say listener directory)
export const listenerDir = path.join(buildDir, 'translators');

// Translation directory
export const translationDir = path.join(buildDir, 'translations');
