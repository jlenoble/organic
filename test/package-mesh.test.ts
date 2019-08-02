import PackageMesh from "../src/package-mesh";
import Packages from "../src/packages";

let packages: Packages;

describe("Testing PackageMesh", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  before(
    async (): Promise<void> => {
      packages = await Packages.create("packages");
    }
  );

  it("Prod DepMesh", async (): Promise<void> => {
    const mesh = new PackageMesh();

    mesh.addDependencies({ packages });
    console.log(mesh.versions);
    console.log(mesh.dependedUpon);
    console.log(mesh.mustUpgrade);
  });

  it("Dev DepMesh", async (): Promise<void> => {
    const mesh = new PackageMesh();

    mesh.addDependencies({ packages, dev: true });
    console.log(mesh.versions);
    console.log(mesh.dependedUpon);
    console.log(mesh.mustUpgrade);
  });
});
