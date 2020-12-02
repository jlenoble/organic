import { task, watch } from "gulp";
import childProcessData from "child-process-data";
import { spawn } from "child_process";
import path from "path";

function execGulpTask(options) {
  const childProcess = spawn(
    "gulp",
    [options.task, "--gulpfile", path.join(options.dest, "gulpfile.babel.js")],
    { detached: true } // Make sure all test processes will be killed
  );

  return childProcessData(childProcess);
}

export const watchMonorepo = done => {
  done();
};

task("monorepo", watchMonorepo);
