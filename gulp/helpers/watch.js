import gulp from 'gulp';

const watch = (taskstem, glob) => {
  gulp.task(`watch:${taskstem}`, gulp.series(`build:${taskstem}`, done => {
    gulp.watch(glob, gulp.series(`build:${taskstem}`));
    done();
  }));
};

export default watch;
