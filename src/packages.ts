import fse from "fs-extra";
import path from "path";
import { error } from "explanation";
import { ProdDependencies, DevDependencies } from "./dependencies";

export default class Packages {
  public readonly ready: Promise<boolean>;

  protected _packageDir: string;
  protected _packages: Set<string>;

  protected _prodDeps: ProdDependencies[];
  protected _devDeps: DevDependencies[];
  protected _localDeps: DevDependencies[];

  public constructor(packageDir: string) {
    this._packageDir = path.resolve(packageDir);
    this._packages = new Set();

    this._prodDeps = [];
    this._devDeps = [];
    this._localDeps = [];

    this.ready = this._addPackages().then((): true => true, (): false => false);
  }

  protected async _addPackages({
    packageDir,
    scope
  }: { packageDir?: string; scope?: string } = {}): Promise<void> {
    if (packageDir) {
      packageDir = path.resolve(packageDir);
    } else {
      packageDir = this._packageDir;
    }

    if (scope) {
      packageDir = path.join(packageDir, scope);
    }

    const packages: string[] = await fse.readdir(packageDir);

    for (const pckg of packages) {
      if (/^@/.test(pckg)) {
        await this._addPackages({ packageDir, scope: pckg });
      } else {
        this._packages.add(scope ? path.join(scope, pckg) : pckg);
      }
    }
  }

  public async getLocalDependencies(): Promise<DevDependencies[]> {
    if (this._localDeps.length === 0) {
      for (const dep of await this.getDevDependencies()) {
        if ((await dep.getLocalDeps()).length > 0) {
          this._localDeps.push(dep);
        }
      }
    }

    return [...this._localDeps];
  }

  public async getProdDependencies(): Promise<ProdDependencies[]> {
    if (!(await this.ready)) {
      return [];
    }

    if (this._prodDeps.length === 0) {
      this._prodDeps = Array.from(
        this._packages,
        (pckg): ProdDependencies => {
          return new ProdDependencies(
            "src/**/*.ts",
            path.join(process.cwd(), "packages", pckg)
          );
        }
      );
    }

    return [...this._prodDeps];
  }

  public async getConsistentProdDependencies(): Promise<ProdDependencies[]> {
    const deps: ProdDependencies[] = [];

    for (const dep of await this.getProdDependencies()) {
      if (await dep.isEventuallyConsistent()) {
        deps.push(dep);
      }
    }

    return Promise.all(deps);
  }

  public async getInconsistentProdDependencies(): Promise<ProdDependencies[]> {
    const deps: ProdDependencies[] = [];

    for (const dep of await this.getProdDependencies()) {
      if (!(await dep.isEventuallyConsistent())) {
        deps.push(dep);
      }
    }

    return Promise.all(deps);
  }

  public async getDevDependencies(): Promise<DevDependencies[]> {
    if (!(await this.ready)) {
      return [];
    }

    if (this._devDeps.length === 0) {
      this._devDeps = Array.from(
        this._packages,
        (pckg): DevDependencies => {
          return new DevDependencies(
            ["gulpfile.babel.js", "test/**/*.ts"],
            path.join(process.cwd(), "packages", pckg)
          );
        }
      );
    }

    return [...this._devDeps];
  }

  public async getConsistentDevDependencies(): Promise<DevDependencies[]> {
    const deps: DevDependencies[] = [];

    for (const dep of await this.getDevDependencies()) {
      if (await dep.isEventuallyConsistent()) {
        deps.push(dep);
      }
    }

    return Promise.all(deps);
  }

  public async getInconsistentDevDependencies(): Promise<DevDependencies[]> {
    const deps: DevDependencies[] = [];

    for (const dep of await this.getDevDependencies()) {
      if (!(await dep.isEventuallyConsistent())) {
        deps.push(dep);
      }
    }

    return Promise.all(deps);
  }

  public async getErrorMessage(keys: string | string[]): Promise<string> {
    const messages: string[] = ["The following errors were encountered:"];

    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    for (const key of keys) {
      switch (key) {
        case "prodInconsistentDeps":
          for (const dep of await this.getInconsistentProdDependencies()) {
            const message: string = await dep.getErrorMessage();
            if (message) {
              messages.push(message);
            }
          }
          break;

        case "devInconsistentDeps":
          for (const dep of await this.getInconsistentDevDependencies()) {
            const message: string = await dep.getErrorMessage();
            if (message) {
              messages.push(message);
            }
          }
          break;

        case "haveLocalDeps":
          for (const dep of await this.getLocalDependencies()) {
            const message: string = await dep.getErrorMessage("local");
            if (message) {
              messages.push(message);
            }
          }
          break;

        default:
          error({
            message: "Unhandled key in getErrorMessage",
            explain: [["key was", key]]
          });
      }
    }

    return messages.length === 1 ? "" : messages.join("\n       - ");
  }
}
