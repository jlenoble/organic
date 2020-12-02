import gulp from "gulp";
import ts from "gulp-typescript";
import path from "path";
import fse from "fs-extra";

const srcDir = "src";
const libDir = "lib";
const libGlob = ["src/**/*.ts", "src/**/*.js"];
const tsProject = ts.createProject("tsconfig.json");

function reporter() {
  const { error, finish } = ts.reporter.defaultReporter();
  const results = { messages: [] };

  const reportOptions = {
    error: (err, ts) => {
      error(err, ts);
      reportOptions.results.messages.push(err.message);
    },

    finish: results => {
      finish(results);
      Object.assign(reportOptions.results, results);
    },

    results
  };

  return reportOptions;
}

const handleTypes = () => {
  const reportOptions = reporter();

  const tsResult = gulp
    .src(libGlob, {
      base: srcDir,
      since: gulp.lastRun(handleTypes)
    })
    .pipe(tsProject(reportOptions));

  return new Promise((resolve, reject) => {
    tsResult.dts
      .pipe(gulp.dest(libDir))
      .on("end", () => {
        resolve(
          fse.outputJson(
            path.join("typescript-report", "report.json"),
            reportOptions.results,
            { spaces: 2 }
          )
        );
      })
      .on("error", err => {
        fse
          .outputJson(
            path.join("typescript-report", "report.json"),
            reportOptions.results,
            { spaces: 2 }
          )
          .then(
            () => reject(err),
            e =>
              reject(
                new Error(`
First error: ${err.message}
Second error: ${e.message}
`)
              )
          );
      });
  });
};

gulp.task("types", handleTypes);
