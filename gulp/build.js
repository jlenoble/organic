import gulp from 'gulp';
import transpile from './helpers/transpile';

const glob = '*.js';
const dest = 'build';

gulp.task('build', transpile({glob, dest}));
