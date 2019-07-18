import { expect } from "chai";
import { ProdDependencies, DevDependencies } from "../src/dependencies";

describe("Testing Dependencies classes", (): void => {
  it("ProdDependencies applied to src files is consistent", async (): Promise<
    void
  > => {
    const deps = new ProdDependencies("src/**/*.ts", process.cwd());

    expect(await deps.isEventuallyConsistent()).to.be.true;
  });

  it("ProdDependencies applied to test files is inconsistent", async (): Promise<
    void
  > => {
    const deps = new ProdDependencies("test/**/*.ts", process.cwd());

    expect(await deps.isEventuallyConsistent()).to.be.false;
  });

  it("ProdDependencies applied to gulp files is inconsistent", async (): Promise<
    void
  > => {
    const deps = new ProdDependencies("gulp/**/*.js", process.cwd());

    expect(await deps.isEventuallyConsistent()).to.be.false;
  });

  it("DevDependencies applied to src files is consistent", async (): Promise<
    void
  > => {
    const deps = new DevDependencies("src/**/*.ts", process.cwd());

    expect(await deps.isEventuallyConsistent()).to.be.true;
  });

  it("DevDependencies applied to test files is consistent", async (): Promise<
    void
  > => {
    const deps = new DevDependencies("test/**/*.ts", process.cwd());

    expect(await deps.isEventuallyConsistent()).to.be.true;
  });

  it("DevDependencies applied to gulp files is consistent", async (): Promise<
    void
  > => {
    const deps = new DevDependencies("gulpfile.babel.js", process.cwd());

    expect(await deps.isEventuallyConsistent()).to.be.true;
  });
});
