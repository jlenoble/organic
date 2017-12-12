import GulpGlob from 'gulpglob';
import {gulpDir, grammarDir, translatorDir} from './dirs';

// Gulpfile includes and helpers
export const gulpGlob = new GulpGlob(`${gulpDir}/**/*.js`);

// Grammar files
export const grammarGlob = new GulpGlob(`${grammarDir}/**/*.g4`);

// Custom translators files
export const translatorGlob = new GulpGlob(`${translatorDir}/**/*.js`);
