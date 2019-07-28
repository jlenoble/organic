import { resolveGlob, rebaseGlob } from "polypath";
import precinct from "precinct";
import path from "path";
import fse from "fs-extra";
import { Tools, natives } from "./tools";
import Relocator, { RelocatedDeps } from "./relocator";

export interface DependenciesOptions {
  glob: string | string[];
  deps: Deps;
  localDeps?: Deps;
  packageDir: string;
  organon: Organon;
}

const tools = new Tools();

interface Deps {
  [name: string]: string;
}

interface Organon {
  implicitDevDeps?: string[];
  relocatedDevDeps?: RelocatedDeps;
}

export default class Dependencies {
  public readonly ready: Promise<boolean>;

  public get packageName(): string {
    return this._packageName;
  }

  protected _packageName: string = "";
  public readonly packageDir: string;

  protected _fromConfig: Deps;
  protected _fromFiles: Set<string>;

  protected _localDeps: Set<string>;
  protected _resolvedFiles: Set<string>;

  protected _organon: Organon;
  protected _relocator?: Relocator;

  protected constructor({
    glob,
    deps,
    localDeps,
    packageDir,
    organon = {}
  }: DependenciesOptions) {
    this._fromConfig = { ...deps };
    this._fromFiles = new Set();
    this._localDeps = new Set(
      Object.keys(localDeps || deps).filter((key): boolean =>
        /^(?:file|link):\.\.?\//.test(deps[key])
      )
    );
    this._resolvedFiles = new Set();
    this.packageDir = packageDir;
    this._organon = organon;

    const { implicitDevDeps, relocatedDevDeps } = organon;

    if (relocatedDevDeps) {
      this._relocator = new Relocator(relocatedDevDeps, packageDir);
    }

    const isReady = async (): Promise<boolean> => {
      try {
        await this._addGlob(glob);

        if (implicitDevDeps) {
          await this._addDep(implicitDevDeps, packageDir);
        }
      } catch (e) {
        console.warn(e);
        return false;
      }

      return true;
    };

    this.ready = isReady();
  }

  protected async _addDep(deps: string | string[], dir: string): Promise<void> {
    if (!Array.isArray(deps)) {
      deps = [deps];
    }

    for (let dep of deps) {
      if (/^\.\.?\//.test(dep)) {
        dep = this.handleRelocatedDep(dep, dir);
        await this._addGlob(dep + ".*");
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
        console.warn(e.message);
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

  public handleRelocatedDep(dep: string, dir: string): string {
    if (this._relocator) {
      return this._relocator.relocate(dep, dir);
    }

    return path.join(dir, dep);
  }

  public getMissingDeps(): string[] {
    const deps: string[] = [];

    for (const dep of this._fromFiles) {
      if (this._fromConfig[dep] === undefined) {
        deps.push(dep);
      }
    }

    return deps;
  }

  public getExtraDeps(): string[] {
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

  public getLocalDeps(): string[] {
    return Array.from(this._localDeps);
  }

  protected _getErrorMessage({
    stem,
    key
  }: {
    stem: string;
    key?: string;
  }): string {
    switch (key) {
      case "missing":
        return this.getMissingErrorMessage(stem);

      case "extra":
        return this.getExtraErrorMessage(stem);

      case "local":
        return this.getLocalErrorMessage(stem);
    }

    return "";
  }

  public getErrorMessage(key: string): string {
    return key;
  }

  public getMissingErrorMessage(stem: string): string {
    const deps = this.getMissingDeps();

    return deps.length > 0
      ? `${JSON.stringify(
          this._packageName
        )} has missing ${stem} deps: ${JSON.stringify(deps)}`
      : "";
  }

  public getExtraErrorMessage(stem: string): string {
    const deps = this.getExtraDeps();

    return deps.length > 0
      ? `${JSON.stringify(
          this._packageName
        )} has extra ${stem} deps: ${JSON.stringify(deps)}`
      : "";
  }

  public getLocalErrorMessage(stem: string): string {
    const deps = this.getLocalDeps();

    return deps.length > 0
      ? `${JSON.stringify(
          this._packageName
        )} has local ${stem} deps: ${JSON.stringify(deps)}`
      : "";
  }
}

export class ProdDependencies extends Dependencies {
  public static async create(
    glob: string | string[],
    packageDir: string
  ): Promise<ProdDependencies> {
    const deps = new ProdDependencies(glob, packageDir);
    await deps.ready;
    return deps;
  }

  protected constructor(glob: string | string[], packageDir: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pckg = require(path.join(packageDir, "package.json"));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const yo = require(path.join(packageDir, ".yo-rc.json"));

    super({
      glob: rebaseGlob(glob, packageDir),
      deps: pckg.dependencies || {},
      packageDir,
      organon: yo.organon
    });

    this._packageName = pckg.name;
  }

  public getErrorMessage(key: string): string {
    return this._getErrorMessage({ stem: "prod", key });
  }
}

export class DevDependencies extends Dependencies {
  public static async create(
    glob: string | string[],
    packageDir: string
  ): Promise<ProdDependencies> {
    const deps = new DevDependencies(glob, packageDir);
    await deps.ready;
    return deps;
  }

  protected constructor(glob: string | string[], packageDir: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pckg = require(path.join(packageDir, "package.json"));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const yo = require(path.join(packageDir, ".yo-rc.json"));

    const dependencies = pckg.dependencies || {};
    const devDependencies = pckg.devDependencies || {};

    super({
      glob: rebaseGlob(glob, packageDir),
      deps: {
        ...dependencies,
        ...devDependencies
      },
      localDeps: devDependencies,
      packageDir,
      organon: yo.organon
    });

    this._packageName = pckg.name;
  }

  public getErrorMessage(key: string): string {
    return this._getErrorMessage({ stem: "dev", key });
  }
}
