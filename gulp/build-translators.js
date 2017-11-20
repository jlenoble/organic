import gulp from 'gulp';
import transpile from './helpers/transpile';
import './make-listeners';

const translatorGlob = 'translators/**/*.js';
const dest = 'build';

gulp.task('transpile:translators', transpile({glob: translatorGlob, dest}));

gulp.task('build:translators', gulp.series('make:listeners',
  'transpile:translators'));
