import semver from "semver";

const isLocal = (version: string): boolean =>
  version.includes("file:../") || version.includes("link:../");

export interface PackageStatusOptions {
  name: string;
  deps?: string[];
  dependants?: [string, string][];
}

export default class PackageStatus {
  public readonly name: string;

  protected _deps: Set<string>;
  protected _dependants: Map<string, string>;

  public get deps(): string[] {
    return Array.from(this._deps);
  }

  public get dependants(): string[] {
    return Array.from(this._dependants.keys());
  }

  public get upgradableDependants(): string[] {
    if (this.hasSingleVersion()) {
      return [];
    }

    const deps: string[] = [];

    if (this.isNeverLocal() && this._dependants.size) {
      const maxVersion = [...this._dependants.values()]
        .map((v): string => semver.minVersion(v).version)
        .reduce((v1, v2): string => {
          return semver.gt(v1, v2) ? v1 : v2;
        });

      for (const [name, version] of this._dependants) {
        if (semver.lt(semver.minVersion(version).version, maxVersion)) {
          deps.push(name);
        }
      }
    } else {
      for (const [name, version] of this._dependants) {
        if (!isLocal(version)) {
          deps.push(name);
        }
      }
    }

    return deps;
  }

  public constructor(options: PackageStatusOptions) {
    this.name = options.name;
    this._deps = new Set(options.deps);
    this._dependants = new Map(options.dependants);
  }

  public addDependency({
    name,
    version
  }: {
    name: string;
    version: string;
  }): string {
    if (!version.includes("file:../") && !version.includes("link:../")) {
      name = name + "@" + version;
    }

    this._deps.add(name);

    return name;
  }

  public addDependant({
    name,
    version
  }: {
    name: string;
    version: string;
  }): void {
    this._dependants.set(name, version);
  }

  public hasSingleVersion(): boolean {
    return new Set(this._dependants.values()).size === 1;
  }

  public isNeverLocal(): boolean {
    return ![...this._dependants.values()].some((version): boolean => {
      return isLocal(version);
    });
  }
}
