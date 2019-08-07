import GitHandler from "../src/git-handler";
import NpmHandler from "../src/npm-handler";
import { expect } from "chai";
import path from "path";

describe("Testing version handlers", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  it("GitHandler indicates that Organon is synched", async (): Promise<
    void
  > => {
    const git = new GitHandler(process.cwd());
    const report = await git.report();
    expect(report[path.basename(process.cwd())].changed).to.be.false;
  });

  it("NpmHandler indicates that Organon is synched", async (): Promise<
    void
  > => {
    const npm = new NpmHandler(process.cwd());
    const report = await npm.report();
    expect(report[path.basename(process.cwd())].changed).to.be.false;
  });
});
