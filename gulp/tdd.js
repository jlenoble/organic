import gulp from 'gulp';

import './make-parsers';
import './translate-all';
import './transpile-all';

gulp.task('tdd', gulp.series(
  gulp.parallel(
    'tdd:make:parsers',
    'tdd:transpile:gulp',
    'tdd:transpile:translators',
    'watch:number:lines'
  ),
));
