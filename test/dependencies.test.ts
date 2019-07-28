import Packages from "../src/packages";

let packages: Packages;

describe("Testing dependency consistency of organized packages", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  before(
    async (): Promise<void> => {
      packages = await Packages.create("packages");
    }
  );

  it("All packages are consistent with regard to prod deps", (): void => {
    const message = packages.getErrorMessage([
      "prodMissingDeps",
      "prodExtraDeps"
    ]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages are consistent with regard to dev deps", (): void => {
    const message = packages.getErrorMessage([
      "devMissingDeps",
      "devExtraDeps"
    ]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages have no local deps", (): void => {
    const message = packages.getErrorMessage("localDeps");

    if (message) {
      throw new Error(message);
    }
  });
});
