import gulp from "gulp";
import chalk from "chalk";
import { GitHandler, NpmHandler } from "organon";

import "./test";
import "./lint";
import "./dist-clean";
import "./doc";
import "./dist-test";
import "./todo";
import "./types";

const sanityCheck = async () => {
  try {
    const cwd = process.cwd();
    const git = new GitHandler(cwd);
    const npm = new NpmHandler(cwd);

    await Promise.all([
      git.outputReport("git-report/report.json"),
      npm.outputReport("npm-report/report.json"),
    ]);

    const warnMessages = [
      chalk.red("The following warnings were encountered during sanity check:"),
    ].concat(git.getErrorMessages(), npm.getErrorMessages());

    if (warnMessages.length > 1) {
      console.warn(warnMessages.join("\n  - "));
    }
  } catch (e) {
    console.error(e);
  }
};

gulp.task("sanity-check", sanityCheck);

gulp.task(
  "prepublish",
  gulp.series(
    "test",
    gulp.parallel("lint", "dist-clean", "doc"),
    "dist-test",
    gulp.parallel("types", "todo", "sanity-check")
  )
);
