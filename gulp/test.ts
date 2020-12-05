import { src, task, series } from "gulp";
import mocha from "gulp-mocha";
import { testReporter, testReportName, execTestGlob } from "./common";

import "./build";

export const handleTest = (): NodeJS.ReadWriteStream => {
  return src(execTestGlob, { read: false }).pipe(
    mocha({
      require: ["source-map-support/register"],
      reporter: testReporter,
      reporterOptions: {
        reportFilename: testReportName,
      },
    })
  );
};

task("test", series("build", handleTest));
