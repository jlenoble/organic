import path from "path";
import {
  buildDocExamplesDir,
  buildTestDir,
  docExamplesDir,
  gulpDir,
  srcDir,
  testDir,
} from "./dirs";

type Glob = string[];

export const docExamplesGlob: Glob = [path.join(docExamplesDir, "**", "*.ts")];
export const gulpGlob: Glob = [path.join(gulpDir, "**", "*.ts")];
export const srcGlob: Glob = [path.join(srcDir, "**", "*.ts")];
export const testGlob: Glob = [path.join(testDir, "**", "*.ts")];

export const execBuildGlob: Glob = srcGlob
  .concat(testGlob)
  .concat(docExamplesGlob)
  .concat(gulpGlob);

export const execTestGlob: Glob = [path.join(buildTestDir, "**", "*.test.js")];
export const execDistTestGlob: Glob = [
  path.join(buildDocExamplesDir, "**", "*.test.js"),
];
