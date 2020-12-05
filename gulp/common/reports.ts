import path from "path";
import { lintReportDir, typesReportDir } from "./dirs";

export const testReporter = "mochawesome";
export const testReportName = testReporter + "-dev";

export const distTestReporter = testReporter;
export const distTestReportName = testReporter;

export const reportName = "report.json";

export const lintReportPath = path.join(lintReportDir, reportName);
export const typesReportPath = path.join(typesReportDir, reportName);
