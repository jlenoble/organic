import getPackages from "./packages";

describe("Testing dependency consistency of organized packages", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  it("All packages are consistent with regard to prod deps", async (): Promise<
    void
  > => {
    const packages = await getPackages();

    const message = packages.getErrorMessage([
      "prodMissingDeps",
      "prodExtraDeps"
    ]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages are consistent with regard to dev deps", async (): Promise<
    void
  > => {
    const packages = await getPackages();

    const message = packages.getErrorMessage([
      "devMissingDeps",
      "devExtraDeps"
    ]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages have no local deps", async (): Promise<void> => {
    const packages = await getPackages();

    const message = packages.getErrorMessage("localDeps");

    if (message) {
      throw new Error(message);
    }
  });
});
