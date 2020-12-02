/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const gulp = require("gulp");
const babel = require("gulp-babel");
const newer = require("gulp-newer");
const debug = require("gulp-debug");
const log = require("fancy-log");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const execa = require("execa");
const autoreload = require("autoreload-gulp");
const usePlumbedGulpSrc = require("plumb-gulp").usePlumbedGulpSrc;
const useOriginalGulpSrc = require("plumb-gulp").useOriginalGulpSrc;

const gulpSrc = "gulp/**/*.js";
const buildDir = "build";
const gulpDir = path.join(`${buildDir}`, "gulp");
const autoTask = "tdd";
const privateAutoTask = "private:tdd";

usePlumbedGulpSrc();

// define regeneration functions
function transpileGulp() {
  return gulp
    .src(gulpSrc, {
      base: ".",
    })
    .pipe(newer(buildDir))
    .pipe(debug({ title: "Build gulp include:" }))
    .pipe(babel())
    .on("error", (err) => {
      log(chalk.red(err.stack));
    })
    .pipe(gulp.dest(buildDir));
}

function watchGulp(done) {
  gulp.watch(gulpSrc, transpileGulp);
  done();
}

try {
  // Attempt to load all include files from gulpDir
  fs.readdirSync(gulpDir)
    .filter((filename) => {
      return filename.match(/\.js$/);
    })
    .forEach((filename) => {
      require(path.join(process.cwd(), gulpDir, filename));
    });

  gulp.task(privateAutoTask, gulp.parallel(watchGulp, autoTask));

  // If success, start infinite dev process with autoreload
  gulp.task("default", autoreload(privateAutoTask, gulpDir));
} catch (err) {
  // If error, try to regenerate include files

  // First make sure to abort on first subsequent error
  useOriginalGulpSrc();

  // Distinguish between missing gulpDir ...
  if (
    err.message.match(
      new RegExp(`no such file or directory, scandir '${gulpDir}'`)
    ) ||
    err.message.match(/Task never defined/) ||
    err.message.match(/Cannot find module '\.\.?\//)
  ) {
    log(chalk.red(err.message));
    log(chalk.yellow(`'${gulpDir}/**/*.js' incomplete; Regenerating`));

    // ... And errors due to corrupted files
  } else {
    log(chalk.red(err.stack));
  }

  const calledTask = process.argv[2];

  gulp.task(autoTask, watchGulp);

  if (calledTask && calledTask !== autoTask) {
    const redoCalledTask = "redo-" + calledTask;

    gulp.task(redoCalledTask, () =>
      execa("gulp", [calledTask], {
        stdio: "inherit",
      })
    );

    gulp.task(calledTask, gulp.series(transpileGulp, redoCalledTask));
  }

  gulp.task(
    "default",
    gulp.series(transpileGulp, autoreload(autoTask, gulpDir))
  );
}
