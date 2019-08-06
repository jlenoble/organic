import getPackages from "./packages";
import path from "path";

let latestWup: string;

describe("Testing dev environment for packages", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  before(
    async (): Promise<void> => {
      latestWup = require(path.join(
        process.cwd(),
        "packages",
        "generator-wupjs",
        "package.json"
      )).version;
    }
  );

  it("All packages are managed by Wup", async (): Promise<void> => {
    const packages = await getPackages();

    const message = packages.getErrorMessage(["hasWup"]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages are managed by latest Wup", async (): Promise<void> => {
    const packages = await getPackages();

    const message = packages.getErrorMessage(["latestWup"], { latestWup });

    if (message) {
      throw new Error(message);
    }
  });

  it("All reports were generated for packages", async (): Promise<void> => {
    const packages = await getPackages();

    const message = packages.getErrorMessage(["reports"]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages have an active dev branch and are in sync with GitHub", async (): Promise<
    void
  > => {
    const packages = await getPackages();

    const message = packages.getErrorMessage(["git"]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages have consistent versions locally, in Verdaccio registry and on Npm registry", async (): Promise<
    void
  > => {
    const packages = await getPackages();

    const message = packages.getErrorMessage(["npm"]);

    if (message) {
      throw new Error(message);
    }
  });
});
