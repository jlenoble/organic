import PackageMesh from "../src/package-mesh";
import getPackages from "./packages";

describe("Testing that all dependencies are up to date", function (): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  it("All prod dependencies are fully upgraded", async (): Promise<void> => {
    const packages = await getPackages();

    const mesh = new PackageMesh();
    mesh.addDependencies({ packages });

    const message = mesh.getErrorMessage();

    if (message) {
      throw new Error(message);
    }
  });

  it("All dev dependencies are fully upgraded", async (): Promise<void> => {
    const packages = await getPackages();

    const mesh = new PackageMesh();

    mesh.addDependencies({ packages, dev: true });

    const message = mesh.getErrorMessage();

    if (message) {
      throw new Error(message);
    }
  });
});
