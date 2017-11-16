import gulp from 'gulp';
import transpile from './helpers/transpile';

const glob = 'gulp/**/*.js';
const dest = 'build';

gulp.task('gulp', transpile({glob, dest}));
