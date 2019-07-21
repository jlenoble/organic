import { resolveGlob, rebaseGlob } from "polypath";
import precinct from "precinct";
import path from "path";
import fse from "fs-extra";
import { Tools, natives } from "./tools";

const tools = new Tools();

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
      Object.keys(deps).filter((key): boolean =>
        /^(?:file|link):\.\.?\//.test(deps[key])
      )
    );
    this._resolvedFiles = new Set();

    this.ready = this._addGlob(glob).then(
      (): true => true,
      (e): false => {
        console.warn(e);
        return false;
      }
    );
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
    let files = await resolveGlob(glob);

    if (!files.length && typeof glob === "string" && /\.\*$/.test(glob)) {
      glob = glob.substring(0, glob.length - 2);

      try {
        if ((await fse.stat(glob)).isDirectory()) {
          files = await resolveGlob(glob + "/**/*");
        }
      } catch (e) {
        console.warn(e);
      }
    }

    for (const file of files) {
      if (this._resolvedFiles.has(file)) {
        continue;
      }

      this._resolvedFiles.add(file);

      const deps: string[] = precinct.paperwork(file);

      await this._addDep(
        deps
          .filter((dep): boolean => !natives.has(dep))
          .map((dep): string => {
            if (dep.includes("/") && !/^\.\.?\//.test(dep)) {
              const chunks = dep.split("/");
              return /^@/.test(dep) ? chunks[0] + "/" + chunks[1] : chunks[0];
            }
            return dep;
          }),
        path.dirname(file)
      );
    }
  }

  public async getMissingDeps(): Promise<string[]> {
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

  public async getExtraDeps(): Promise<string[]> {
    if (!(await this.ready)) {
      return [];
    }

    const deps: string[] = [];

    for (const dep of Object.keys(this._fromConfig)) {
      if (!this._fromFiles.has(dep) && !tools.has(dep)) {
        const match = dep.match(/^@types\/(.*)$/);

        if (match && (this._fromFiles.has(match[1]) || tools.has(match[1]))) {
          // not extra because source package is actual dep
          continue;
        }

        deps.push(dep);
      }
    }

    return deps;
  }

  public async getLocalDeps(): Promise<string[]> {
    await this.ready;
    return Array.from(this._localDeps);
  }

  protected async _getErrorMessage({
    stem,
    key
  }: {
    stem: string;
    key?: string;
  }): Promise<string> {
    switch (key) {
      case "missing":
        return this.getMissingErrorMessage(stem);

      case "extra":
        return this.getExtraErrorMessage(stem);

      case "local":
        return this.getLocalErrorMessage();
    }

    return "";
  }

  public async getErrorMessage(key: string): Promise<string> {
    return key;
  }

  public async getMissingErrorMessage(stem: string): Promise<string> {
    const deps = await this.getMissingDeps();

    return deps.length > 0
      ? `${JSON.stringify(
          this._packageName
        )} has missing ${stem} deps: ${JSON.stringify(deps)}`
      : "";
  }

  public async getExtraErrorMessage(stem: string): Promise<string> {
    const deps = await this.getExtraDeps();

    return deps.length > 0
      ? `${JSON.stringify(
          this._packageName
        )} has extra ${stem} deps: ${JSON.stringify(deps)}`
      : "";
  }

  public async getLocalErrorMessage(): Promise<string> {
    const deps = await this.getLocalDeps();

    return deps.length > 0
      ? `${JSON.stringify(this._packageName)} has local deps: ${JSON.stringify(
          deps
        )}`
      : "";
  }
}

export class ProdDependencies extends Dependencies {
  public constructor(glob: string | string[], packageDir: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pckg = require(path.join(packageDir, "package.json"));

    super(rebaseGlob(glob, packageDir), pckg.dependencies);

    this._packageName = pckg.name;
  }

  public async getErrorMessage(key: string): Promise<string> {
    return this._getErrorMessage({ stem: "prod", key });
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

  public async getErrorMessage(key: string): Promise<string> {
    return this._getErrorMessage({ stem: "dev", key });
  }
}
