import {src, dest, lastRun, task} from "gulp";
import babel from "gulp-babel";
import sourcemaps from "gulp-sourcemaps";
import cached from "gulp-cached";
import newer from "gulp-newer";

const buildDir = "build";
const srcGlob = [
  "src/**/*.ts",
  "test/**/*.ts"
];

export const build = () => {
  return src(srcGlob, {
    base: process.cwd(),
    since: lastRun(build)
  })
    .pipe(newer(buildDir))
    .pipe(cached())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write(".", {
      sourceRoot: file => file.cwd
    }))
    .pipe(dest(buildDir));
};

task("build", build);
