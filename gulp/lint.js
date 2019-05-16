import gulp from "gulp";
import eslint from "gulp-eslint";

const srcGlob = ["src/**/*.ts", "test/**/*.ts"];

export const handleLint = () => {
  return gulp
    .src(srcGlob)
    .pipe(eslint())
    .pipe(eslint.format());
};

gulp.task("lint", handleLint);
