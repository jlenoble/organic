import Packages from "../src/packages";

describe("Testing dependency consistency of organized packages", (): void => {
  const packages = new Packages("packages");

  it("All packages are consistent with regard to prod deps", async function(): Promise<
    void
  > {
    this.timeout(20000); // eslint-disable-line no-invalid-this

    const message = await packages.getErrorMessage([
      "prodMissingDeps",
      "prodExtraDeps"
    ]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages are consistent with regard to dev deps", async function(): Promise<
    void
  > {
    this.timeout(20000); // eslint-disable-line no-invalid-this

    const message = await packages.getErrorMessage([
      "devMissingDeps",
      "devExtraDeps"
    ]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages have no local deps", async function(): Promise<void> {
    this.timeout(20000); // eslint-disable-line no-invalid-this

    const message = await packages.getErrorMessage("localDeps");

    if (message) {
      throw new Error(message);
    }
  });
});
