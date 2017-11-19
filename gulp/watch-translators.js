import gulp from 'gulp';
import './build-translators';

const glob = 'translators/**/*.js';

gulp.task('watch:translators', gulp.series('build:translators', done => {
  gulp.watch(glob, gulp.series('build:translators'));
  done();
}));
