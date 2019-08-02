import semver from "semver";
import PackageStatus, { PackageStatusOptions } from "./package-status";
import DepMesh, { DepMeshNode } from "./dep-mesh";
import Packages from "./packages";

export interface PackageMeshOptions {
  packages: Packages;
  dev?: boolean;
}

export default class PackageMesh extends DepMesh<PackageStatus> {
  protected _versions: Map<string, Set<string>> = new Map();
  protected _dependedUpon: Map<string, Set<string>> = new Map();
  protected _mustUpgrade: Map<string, Set<string>> = new Map();

  public get versions(): Map<string, string[]> {
    const map: Map<string, string[]> = new Map();

    for (const [key, value] of this._versions) {
      map.set(key, [...value]);
    }

    return map;
  }

  public get dependedUpon(): Map<string, string[]> {
    const map: Map<string, string[]> = new Map();

    for (const [key, value] of this._dependedUpon) {
      map.set(key, [...value]);
    }

    return map;
  }

  public get mustUpgrade(): Map<string, string[]> {
    const map: Map<string, string[]> = new Map();

    for (const [key, value] of this._mustUpgrade) {
      map.set(key, [...value]);
    }

    return map;
  }

  public constructor() {
    super({
      create(options: PackageStatusOptions): PackageStatus {
        return new PackageStatus(options);
      }
    });
  }

  public addDependencies({ packages, dev = false }: PackageMeshOptions): void {
    const method = dev ? "getDevDependencies" : "getProdDependencies";

    for (const dep of packages[method]()) {
      const name = dep.packageName;

      if (!this._mustUpgrade.has(name)) {
        this._mustUpgrade.set(name, new Set());
      }

      const configDeps = dep.getConfigDeps();
      const deps = Object.keys(configDeps)
        .filter((dep): boolean => {
          return packages.has(dep);
        })
        .map((dep): string => {
          const version = configDeps[dep];

          if (!this._versions.has(dep)) {
            this._versions.set(dep, new Set());
          }

          if (!this._dependedUpon.has(dep)) {
            this._dependedUpon.set(dep, new Set());
          }

          (this._dependedUpon.get(dep) as Set<string>).add(name);

          let _dep = dep;
          let _version: string;

          if (version.includes("file:../") || version.includes("link:../")) {
            _version = "local";
          } else {
            _version = configDeps[dep];
            _dep = dep + "@" + _version;
          }

          const versions = this._versions.get(dep) as Set<string>;

          versions.add(_version);

          if (versions.has("local")) {
            (this._mustUpgrade.get(name) as Set<string>).add(dep);
          } else if (versions.size > 1) {
            let max = semver.minVersion(_version).version;

            for (const vers of versions) {
              if (semver.ltr(max, vers)) {
                max = semver.minVersion(vers).version;
              }
            }

            if (max !== semver.minVersion(_version).version) {
              (this._mustUpgrade.get(name) as Set<string>).add(_dep);
            }
          }

          return _dep;
        });

      new DepMeshNode({ name, deps, mesh: this });
    }

    for (const dep of packages[method]()) {
      const name = dep.packageName;
      const node = this.get(name) as DepMeshNode<PackageStatus>;

      node.value.deps.forEach((dep): void => {
        this.addLink({ name }, { name: dep });
      });
    }
  }
}
