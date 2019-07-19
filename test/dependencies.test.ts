import { expect } from "chai";
import fse from "fs-extra";
import path from "path";
import { ProdDependencies, DevDependencies } from "../src/dependencies";
import Packages from "../src/packages";

describe("Testing Dependencies classes", (): void => {
  it("All packages are consistent with regard to prod deps", async function(): Promise<
    void
  > {
    this.timeout(20000); // eslint-disable-line no-invalid-this

    const packages = new Packages("packages");

    const allDeps = await packages.getProdDependencies();

    const consistencies = await Promise.all(
      allDeps.map((dep): Promise<boolean> => dep.isEventuallyConsistent())
    );

    try {
      expect(consistencies.every((consistency): boolean => consistency)).to.be
        .true;
    } catch (e) {
      const indices: number[] = [];
      const badPackages = allDeps.filter((dep, i): boolean => {
        if (!consistencies[i]) {
          indices.push(i);
          return true;
        }
        return false;
      });

      const msg: string = (await Promise.all(
        badPackages.map(
          async (dep, i): Promise<string> => {
            return `${JSON.stringify(
              packages[indices[i]]
            )} has inconsistent prod deps: ${JSON.stringify(
              await dep.getInconsistencies()
            )}`;
          }
        )
      )).join("\n");

      throw new Error(msg);
    }
  });

  it("All packages are consistent with regard to dev deps", async function(): Promise<
    void
  > {
    this.timeout(20000); // eslint-disable-line no-invalid-this

    const packages: string[] = await fse.readdir(
      path.join(process.cwd(), "packages")
    );

    const allDeps = packages
      .map((pckg): string => path.join(process.cwd(), "packages", pckg))
      .map((pckg): DevDependencies => new DevDependencies("src/**/*.ts", pckg));

    const consistencies = await Promise.all(
      allDeps.map((dep): Promise<boolean> => dep.isEventuallyConsistent())
    );

    try {
      expect(consistencies.every((consistency): boolean => consistency)).to.be
        .true;
    } catch (e) {
      const indices: number[] = [];
      const badPackages = allDeps.filter((dep, i): boolean => {
        if (!consistencies[i]) {
          indices.push(i);
          return true;
        }
        return false;
      });

      const msg: string = (await Promise.all(
        badPackages.map(
          async (dep, i): Promise<string> => {
            return `${JSON.stringify(
              packages[indices[i]]
            )} has inconsistent prod deps: ${JSON.stringify(
              await dep.getInconsistencies()
            )}`;
          }
        )
      )).join("\n");

      throw new Error(msg);
    }
  });
});
