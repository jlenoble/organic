import GulpGlob from 'gulpglob';

// Gulpfile includes and helpers
const gulpGlob = new GulpGlob('gulp/**/*.js');

// Grammar files
const grammarGlob = new GulpGlob('grammars/**/*.g4');

// Custom translators files
const translatorGlob = new GulpGlob('translators/**/*.js');

// Export all
export {gulpGlob, grammarGlob, translatorGlob};
