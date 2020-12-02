import { src, task, series } from "gulp";
import mocha from "gulp-mocha";
import { resolveGlob } from "polypath";
import streamToPromise from "stream-to-promise";

import "./dist-build";

const testGlob = ["build/doc/examples/**/*.test.js"];

export const handleDistTest = async () => {
  const files = await resolveGlob(testGlob);

  if (!files.length) {
    // Prevent Mocha from looking around if no example test file are found
    return;
  }

  await streamToPromise(
    src(files, { read: false }).pipe(
      mocha({
        reporter: "mochawesome"
      })
    )
  );
};

task("dist-test", series("dist-build", handleDistTest));
