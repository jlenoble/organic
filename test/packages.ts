import Packages from "../src/packages";

let packages: Packages | undefined;

export default async function getPackages(): Promise<Packages> {
  if (!packages) {
    packages = await Packages.create("packages");
  }

  return packages;
}
