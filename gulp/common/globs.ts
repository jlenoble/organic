import path from "path";
import {
  buildDocExamplesDir,
  buildTestDir,
  docExamplesDir,
  gulpDir,
  srcDir,
  testDir,
} from "./dirs";

export const docExamplesGlob = path.join(docExamplesDir, "**", "*.ts");
export const gulpGlob = path.join(gulpDir, "**", "*.ts");
export const srcGlob = path.join(srcDir, "**", "*.ts");
export const testGlob = path.join(testDir, "**", "*.ts");

export const execBuildGlob = srcGlob
  .concat(testGlob)
  .concat(docExamplesGlob)
  .concat(gulpGlob);

export const execTestGlob = path.join(buildTestDir, "**", "*.test.js");
export const execDistTestGlob = path.join(
  buildDocExamplesDir,
  "**",
  "*.test.js"
);
