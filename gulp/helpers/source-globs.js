import GulpGlob from 'gulpglob';
import {gulpDir, grammarDir, translatorDir} from './dirs';

// Gulpfile includes and helpers
const gulpGlob = new GulpGlob(`${gulpDir}/**/*.js`);

// Grammar files
const grammarGlob = new GulpGlob(`${grammarDir}/**/*.g4`);

// Custom translators files
const translatorGlob = new GulpGlob(`${translatorDir}/**/*.js`);

// Export all
export {gulpGlob, grammarGlob, translatorGlob};
