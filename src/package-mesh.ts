import PackageStatus, { PackageStatusOptions } from "./package-status";
import DepMesh, { DepMeshNode } from "./dep-mesh";
import Packages from "./packages";

export interface PackageMeshOptions {
  packages: Packages;
  dev?: boolean;
}

export default class PackageMesh extends DepMesh<PackageStatus> {
  public constructor() {
    super({
      create(options: PackageStatusOptions): PackageStatus {
        return new PackageStatus(options);
      },
    });
  }

  public addDependencies({ packages, dev = false }: PackageMeshOptions): void {
    const method = dev ? "getDevDependencies" : "getProdDependencies";

    for (const dep of packages[method]()) {
      const childName = dep.packageName;
      const childNode = new DepMeshNode({ name: childName, mesh: this });
      const childStatus = childNode.value;
      const childDeps = dep.getConfigDeps();

      for (const depName of Object.keys(childDeps)) {
        if (!packages.has(depName)) {
          continue;
        }

        const depVersion = childDeps[depName];

        const parentName = childStatus.addDependency({
          name: depName,
          version: depVersion,
        });

        const depNode = new DepMeshNode({ name: depName, mesh: this });
        const depStatus = depNode.value;

        new DepMeshNode({ name: parentName, value: depStatus, mesh: this });

        depStatus.addDependant({
          name: childName,
          version: depVersion,
        });

        this.addLink({ name: childName }, { name: parentName });
      }
    }
  }

  public getAllDeps(): Map<string, string[]> {
    const map: Map<string, string[]> = new Map();

    for (const dep of this.values()) {
      const status = dep.value;
      const name = status.name;

      if (!map.has(name)) {
        const deps = status.deps;

        if (deps.length) {
          map.set(name, deps);
        }
      }
    }

    return map;
  }

  public getAllDependants(): Map<string, string[]> {
    const map: Map<string, string[]> = new Map();

    for (const dep of this.values()) {
      const status = dep.value;
      const name = status.name;

      if (!map.has(name)) {
        const deps = status.dependants;

        if (deps.length) {
          map.set(name, deps);
        }
      }
    }

    return map;
  }

  public getAllUpgradableDependants(): Map<string, string[]> {
    const map: Map<string, string[]> = new Map();

    for (const dep of this.values()) {
      const status = dep.value;
      const name = status.name;

      if (!map.has(name)) {
        const deps = status.upgradableDependants;

        if (deps.length) {
          map.set(name, deps);
        }
      }
    }

    return map;
  }

  public getDeps(name: string): string[] {
    if (!this.has(name)) {
      return [];
    }

    const status = (this.get(name) as DepMeshNode<PackageStatus>).value;

    return status.deps;
  }

  public getDependants(name: string): string[] {
    if (!this.has(name)) {
      return [];
    }

    const status = (this.get(name) as DepMeshNode<PackageStatus>).value;

    return status.dependants;
  }

  public getUpgradableDependants(name: string): string[] {
    if (!this.has(name)) {
      return [];
    }

    const status = (this.get(name) as DepMeshNode<PackageStatus>).value;

    return status.upgradableDependants;
  }

  public getErrorMessage(): string {
    const deps: Set<string> = new Set();
    const messages: string[] = ["The following errors were encountered:"];

    for (const dep of this.values()) {
      const status = dep.value;
      const name = status.name;

      if (!deps.has(name)) {
        deps.add(name);

        const message = status.getErrorMessage();

        if (message) {
          messages.push(status.getErrorMessage());
        }
      }
    }

    return messages.length === 1 ? "" : messages.join("\n       - ");
  }
}
