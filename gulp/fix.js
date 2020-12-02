import { task, series } from "gulp";
import path from "path";
import Fixer from "../src/fixer";

const packageDir = path.join(process.cwd(), "packages");
const reportPath = path.join(process.cwd(), "fix-report", "report.json");

async function fix() {
  const fixer = new Fixer(packageDir);

  await fixer.readFixes(reportPath);
  await fixer.fixAll();
}

task("fix", fix);
