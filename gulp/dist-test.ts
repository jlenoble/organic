import { src, task, series } from "gulp";
import mocha from "gulp-mocha";
import { resolveGlob } from "polypath";
import streamToPromise from "stream-to-promise";
import {
  distTestReporter,
  distTestReportName,
  execDistTestGlob,
} from "./common";

import "./dist-build";

export const handleDistTest = async (): Promise<void> => {
  const files = await resolveGlob(execDistTestGlob);

  if (!files.length) {
    // Prevent Mocha from looking around if no example test file are found
    return;
  }

  await streamToPromise(
    src(files, { read: false }).pipe(
      mocha({
        reporter: distTestReporter,
        reporterOptions: {
          reportFilename: distTestReportName,
        },
      })
    )
  );
};

task("dist-test", series("dist-build", handleDistTest));
