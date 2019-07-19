import { resolveGlob, rebaseGlob } from "polypath";
import precinct from "precinct";
import path from "path";

interface Deps {
  [name: string]: string;
}

export default class Dependencies {
  public readonly ready: Promise<boolean>;

  public get packageName(): string {
    return this._packageName;
  }

  protected _packageName: string = "";

  protected _fromConfig: Deps;
  protected _fromFiles: Set<string>;

  protected _localDeps: Set<string>;
  protected _resolvedFiles: Set<string>;

  public constructor(glob: string | string[], deps: Deps) {
    this._fromConfig = { ...deps };
    this._fromFiles = new Set();
    this._localDeps = new Set(
      Object.keys(deps).filter((key): boolean => /^\.\.?\//.test(deps[key]))
    );
    this._resolvedFiles = new Set();

    this.ready = this._addGlob(glob).then((): true => true, (): false => false);
  }

  protected async _addDep(deps: string | string[], dir: string): Promise<void> {
    if (!Array.isArray(deps)) {
      deps = [deps];
    }

    for (const dep of deps) {
      if (/^\.\.?\//.test(dep)) {
        const glob = path.join(dir, dep + ".*");

        await this._addGlob(glob);
      } else {
        this._fromFiles.add(dep);
      }
    }
  }

  protected async _addGlob(glob: string | string[]): Promise<void> {
    const files = await resolveGlob(glob);

    for (const file of files) {
      if (this._resolvedFiles.has(file)) {
        continue;
      }

      this._resolvedFiles.add(file);

      const deps = precinct.paperwork(file, {
        includeCore: false
      });

      await this._addDep(deps, path.dirname(file));
    }
  }

  public async isEventuallyConsistent(): Promise<boolean> {
    let consistent = await this.ready;

    for (const dep of this._fromFiles) {
      if (this._fromConfig[dep] === undefined) {
        consistent = false;
      }
    }

    return consistent;
  }

  public async getInconsistencies(): Promise<string[]> {
    if (!(await this.ready)) {
      return [];
    }

    const deps: string[] = [];

    for (const dep of this._fromFiles) {
      if (this._fromConfig[dep] === undefined) {
        deps.push(dep);
      }
    }

    return deps;
  }
}

export class ProdDependencies extends Dependencies {
  public constructor(glob: string | string[], packageDir: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pckg = require(path.join(packageDir, "package.json"));

    super(rebaseGlob(glob, packageDir), pckg.dependencies);

    this._packageName = pckg.name;
  }
}

export class DevDependencies extends Dependencies {
  public constructor(glob: string | string[], packageDir: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pckg = require(path.join(packageDir, "package.json"));

    super(rebaseGlob(glob, packageDir), {
      ...pckg.dependencies,
      ...pckg.devDependencies
    });

    this._packageName = pckg.name;
  }
}
