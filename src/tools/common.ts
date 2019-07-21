export type Option = boolean | string;

export interface Options {
  babel?: Option;
  eslint?: Option;
  gulp?: Option;
  mocha?: Option;
  node?: Option;
  prettier?: Option;
  typescript?: Option;
}

export interface Semvers {
  [dep: string]: string;
}

export type DepsInput = string | string[] | Semvers;

export default class Deps {
  protected _deps: Map<string, string>;

  public get deps(): string[] {
    return [...this._deps.keys()].sort();
  }

  public constructor() {
    this._deps = new Map();

    Object.defineProperty(this, "_deps", { enumerable: false });
  }

  protected _addDeps(deps: DepsInput): void {
    if (typeof deps === "string") {
      this._deps.set(deps, "*");
    } else if (Array.isArray(deps)) {
      deps.forEach((dep): void => {
        this._deps.set(dep, "*");
      });
    } else {
      Object.entries(deps).forEach(([dep, semver]): void => {
        this._deps.set(dep, semver);
      });
    }
  }

  public has(dep: string): boolean {
    return this._deps.has(dep);
  }
}
