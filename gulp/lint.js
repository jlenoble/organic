import gulp, { series } from "gulp";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import eslint from "gulp-eslint";

const reportDir = "eslint-report";
const srcGlob = ["src/**/*.ts", "test/**/*.ts", "src/**/*.js", "test/**/*.js"];

const createReportDir = (path) => {
  const mkReportDirp = () => mkdirp(path);
  return mkReportDirp;
};

export const handleLint = () => {
  return gulp
    .src(srcGlob)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(
      eslint.format(
        "html",
        fs.createWriteStream(path.join(reportDir, "report.html"))
      )
    )
    .pipe(
      eslint.format(
        "json-with-metadata",
        fs.createWriteStream(path.join(reportDir, "report.json"))
      )
    );
};

gulp.task("lint", series(createReportDir(reportDir), handleLint));
