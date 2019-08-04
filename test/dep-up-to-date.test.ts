import PackageMesh from "../src/package-mesh";
import Packages from "../src/packages";

let packages: Packages;

describe("Testing that all dependencies are up to date", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  before(
    async (): Promise<void> => {
      packages = await Packages.create("packages");
    }
  );

  it("All prod dependencies are fully upgraded", async (): Promise<void> => {
    const mesh = new PackageMesh();
    mesh.addDependencies({ packages });

    const message = mesh.getErrorMessage();

    if (message) {
      throw new Error(message);
    }
  });

  it("All dev dependencies are fully upgraded", async (): Promise<void> => {
    const mesh = new PackageMesh();

    mesh.addDependencies({ packages, dev: true });

    const message = mesh.getErrorMessage();

    if (message) {
      throw new Error(message);
    }
  });
});
