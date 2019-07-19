import Packages from "../src/packages";

describe("Testing dependency consistency of organized packages", (): void => {
  it("All packages are consistent with regard to prod deps", async function(): Promise<
    void
  > {
    this.timeout(20000); // eslint-disable-line no-invalid-this

    const packages = new Packages("packages");
    const message = await packages.getErrorMessage("prodInconsistentDeps");

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages are consistent with regard to dev deps", async function(): Promise<
    void
  > {
    this.timeout(20000); // eslint-disable-line no-invalid-this

    const packages = new Packages("packages");
    const message = await packages.getErrorMessage("devInconsistentDeps");

    if (message) {
      throw new Error(message);
    }
  });
});
