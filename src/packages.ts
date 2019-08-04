import fse from "fs-extra";
import path from "path";
import { error } from "explanation";
import Dependencies, {
  ProdDependencies,
  DevDependencies
} from "./dependencies";
import Globs from "./globs";

interface ErrorOptions {
  latestWup?: string;
}

export default class Packages {
  public readonly ready: Promise<boolean>;

  public static async create(packageDir: string): Promise<Packages> {
    const pckg = new Packages(packageDir);
    await pckg.ready;

    pckg._prodDeps = await Promise.all(
      Array.from(
        pckg._packages,
        (pkg): Promise<ProdDependencies> => {
          return ProdDependencies.create(
            pckg._globs.prodGlob,
            path.join(process.cwd(), "packages", pkg)
          );
        }
      )
    );

    pckg._devDeps = await Promise.all(
      Array.from(
        pckg._packages,
        (pkg): Promise<DevDependencies> => {
          return DevDependencies.create(
            pckg._globs.devGlob,
            path.join(process.cwd(), "packages", pkg)
          );
        }
      )
    );

    for (const dep of pckg._prodDeps) {
      if (dep.getLocalDeps().length > 0) {
        pckg._localProdDeps.push(dep);
      }
    }

    for (const dep of pckg._devDeps) {
      if (dep.getLocalDeps().length > 0) {
        pckg._localDevDeps.push(dep);
      }
    }

    return pckg;
  }

  protected _packageDir: string;
  protected _packages: Set<string>;

  protected _globs: Globs;
  protected _prodDeps: ProdDependencies[];
  protected _devDeps: DevDependencies[];

  protected _localProdDeps: ProdDependencies[];
  protected _localDevDeps: DevDependencies[];

  protected constructor(packageDir: string) {
    this._packageDir = path.resolve(packageDir);
    this._packages = new Set();

    this._globs = new Globs();
    this._prodDeps = [];
    this._devDeps = [];

    this._localProdDeps = [];
    this._localDevDeps = [];

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

  public has(name: string): boolean {
    return this._packages.has(name);
  }

  public getLocalDependencies(): Dependencies[] {
    return [...this._localProdDeps, ...this._localDevDeps];
  }

  public getLocalProdDependencies(): ProdDependencies[] {
    return [...this._localProdDeps];
  }

  public getLocalDevDependencies(): DevDependencies[] {
    return [...this._localDevDeps];
  }

  public getProdDependencies(): ProdDependencies[] {
    return [...this._prodDeps];
  }

  public getDevDependencies(): DevDependencies[] {
    return [...this._devDeps];
  }

  public getErrorMessage(
    keys: string | string[],
    options: ErrorOptions = {}
  ): string {
    const messages: string[] = ["The following errors were encountered:"];

    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    for (const key of keys) {
      let deps: Dependencies[] = [];
      let tag = "";

      switch (key) {
        case "prodMissingDeps":
          deps = this._prodDeps;
          tag = "missing";
          break;

        case "devMissingDeps":
          deps = this._devDeps;
          tag = "missing";
          break;

        case "prodExtraDeps":
          deps = this._prodDeps;
          tag = "extra";
          break;

        case "devExtraDeps":
          deps = this._devDeps;
          tag = "extra";
          break;

        case "localDeps":
          deps = this.getLocalDependencies();
          tag = "local";
          break;

        case "hasWup":
        case "latestWup":
        case "reports":
          deps = this._prodDeps;
          tag = key;
          break;

        default:
          error({
            message: "Unhandled key in getErrorMessage",
            explain: [["key was", key]]
          });
      }

      for (const dep of deps) {
        const message: string = dep.getErrorMessage({ ...options, key: tag });
        if (message) {
          messages.push(message);
        }
      }
    }

    return messages.length === 1 ? "" : messages.join("\n       - ");
  }
}
