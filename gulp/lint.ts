import gulp, { series } from "gulp";
import fs from "fs";
import mkdirp from "mkdirp";
import eslint from "gulp-eslint";
import { execBuildGlob, lintReportDir, lintReportPath } from "./common";

const createReportDir = () => {
  const mkReportDirp = () => mkdirp(lintReportDir);
  return mkReportDirp;
};

export const handleLint = (): NodeJS.ReadWriteStream => {
  return gulp
    .src(execBuildGlob)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(
      eslint.format("json-with-metadata", fs.createWriteStream(lintReportPath))
    );
};

gulp.task("lint", series(createReportDir(), handleLint));
