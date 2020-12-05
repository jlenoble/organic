import { src, dest, lastRun, task } from "gulp";
import babel from "gulp-babel";
import sourcemaps from "gulp-sourcemaps";
import cached from "gulp-cached";
import newer from "gulp-newer";
import debug from "gulp-debug";

import { buildDir, cacheName, execBuildGlob } from "./common";

export const handleBuild = (): NodeJS.ReadWriteStream => {
  return src(execBuildGlob, {
    base: process.cwd(),
    since: lastRun(handleBuild),
  })
    .pipe(newer({ dest: buildDir, ext: ".js" }))
    .pipe(cached(cacheName))
    .pipe(debug({ title: "Transpiling:" }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(
      sourcemaps.write(".", {
        sourceRoot: (file) => file.cwd,
      })
    )
    .pipe(dest(buildDir));
};

const build = handleBuild;

task("build", build);
