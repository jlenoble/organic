import Packages from "../src/packages";
import path from "path";

let packages: Packages;
let latestWup: string;

describe("Testing dev environment for packages", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  before(
    async (): Promise<void> => {
      packages = await Packages.create("packages");
      latestWup = require(path.join(
        process.cwd(),
        "packages",
        "generator-wupjs",
        "package.json"
      )).version;
    }
  );

  it("All packages are managed by Wup", async (): Promise<void> => {
    const message = packages.getErrorMessage(["hasWup"]);

    if (message) {
      throw new Error(message);
    }
  });

  it("All packages are managed by latest Wup", async (): Promise<void> => {
    const message = packages.getErrorMessage(["latestWup"], { latestWup });

    if (message) {
      throw new Error(message);
    }
  });
});
