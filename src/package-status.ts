export interface PackageStatusOptions {
  name: string;
  deps: string[];
}

export default class PackageStatus {
  public readonly name: string;
  public readonly deps: string[];

  public constructor(options: PackageStatusOptions) {
    this.name = options.name;
    this.deps = options.deps;
  }
}
