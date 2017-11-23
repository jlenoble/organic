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

// Export all
export {buildDir, gulpDir, grammarDir, parserDir, translatorDir};
