import runTest from "./run-test";
import path from "path";

describe("Testing dev environment for packages", function (): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  it("All packages are managed by Wup", runTest("hasWup"));

  it("All packages are managed by latest Wup", (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const latestWup = require(path.join(
      process.cwd(),
      "packages",
      "generator-wupjs",
      "package.json"
    )).version;

    return runTest("latestWup", { latestWup })();
  });

  it("All reports were generated for packages", runTest("reports"));
});
