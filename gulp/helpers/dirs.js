import path from 'path';

// Main build directory
const buildDir = 'build';

// Gulp includes and helpers directory
const gulpDir = 'gulp';

// Grammar directory
const grammarDir = 'grammars';

// Generated parser directory
const parserDir = path.join(buildDir, 'parsers');

// Translator directory
const translatorDir = 'translators';

// Transpiled translator directory (that is to say listener directory)
const listenerDir = path.join(buildDir, 'translators');

// Translation directory
const translationDir = path.join(buildDir, 'translations');

// Export all
export {buildDir, gulpDir, grammarDir, parserDir, translatorDir, listenerDir,
  translationDir};
