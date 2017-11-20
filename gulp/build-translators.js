import gulp from 'gulp';
import transpile from './helpers/transpile';
import './build-listeners';

const translatorGlob = 'translators/**/*.js';
const dest = 'build';

gulp.task('transpile:translators', transpile({glob: translatorGlob, dest}));

gulp.task('build:translators', gulp.series('build:listeners',
  'transpile:translators'));
