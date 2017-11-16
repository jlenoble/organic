import gulp from 'gulp';
import transpile from './helpers/transpile';

const glob = 'translators/*.js';
const dest = 'build';

gulp.task('build', transpile({glob, dest}));
