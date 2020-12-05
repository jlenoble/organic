import path from "path";

export const buildDir = "build";
export const docDir = "doc";
export const gulpDir = "gulp";
export const libDir = "lib";
export const srcDir = "src";
export const testDir = "test";

export const docExamplesDir = path.join(docDir, "examples");

export const buildTestDir = path.join(buildDir, testDir);
export const buildDocExamplesDir = path.join(buildDir, docExamplesDir);

export const lintReportDir = "eslint-report";
export const typesReportDir = "typescript-report";
