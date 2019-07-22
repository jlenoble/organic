import fse from "fs-extra";
import path from "path";
import { error } from "explanation";
import Dependencies, {
  ProdDependencies,
  DevDependencies
} from "./dependencies";
import Globs from "./globs";

export default class Packages {
  public readonly ready: Promise<boolean>;

  protected _packageDir: string;
  protected _packages: Set<string>;

  protected _globs: Globs;
  protected _prodDeps: ProdDependencies[];
  protected _devDeps: DevDependencies[];
  protected _localDeps: DevDependencies[];

  public constructor(packageDir: string) {
    this._packageDir = path.resolve(packageDir);
    this._packages = new Set();

    this._globs = new Globs();
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
            this._globs.prodGlob,
            path.join(process.cwd(), "packages", pckg)
          );
        }
      );
    }

    return [...this._prodDeps];
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
            this._globs.devGlob,
            path.join(process.cwd(), "packages", pckg)
          );
        }
      );
    }

    return [...this._devDeps];
  }

  public async getErrorMessage(keys: string | string[]): Promise<string> {
    const messages: string[] = ["The following errors were encountered:"];

    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    for (const key of keys) {
      let deps: Promise<Dependencies[]> = Promise.resolve([]);
      let tag = "";

      switch (key) {
        case "prodMissingDeps":
          deps = this.getProdDependencies();
          tag = "missing";
          break;

        case "devMissingDeps":
          deps = this.getDevDependencies();
          tag = "missing";
          break;

        case "prodExtraDeps":
          deps = this.getProdDependencies();
          tag = "extra";
          break;

        case "devExtraDeps":
          deps = this.getDevDependencies();
          tag = "extra";
          break;

        case "localDeps":
          deps = this.getLocalDependencies();
          tag = "local";
          break;

        default:
          error({
            message: "Unhandled key in getErrorMessage",
            explain: [["key was", key]]
          });
      }

      for (const dep of await deps) {
        const message: string = await dep.getErrorMessage(tag);
        if (message) {
          messages.push(message);
        }
      }
    }

    return messages.length === 1 ? "" : messages.join("\n       - ");
  }
}
