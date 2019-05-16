import { src, task, series } from "gulp";
import mocha from "gulp-mocha";

import "./build";

const testGlob = ["build/test/**/*.test.js"];

export const handleTest = () => {
  return src(testGlob, { read: false }).pipe(
    mocha({
      require: ["source-map-support/register"]
    })
  );
};

task("test", series("build", handleTest));
