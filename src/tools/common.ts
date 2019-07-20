export interface Options {
  babel?: boolean;
  eslint?: boolean;
  gulp?: boolean;
  mocha?: boolean;
  prettier?: boolean;
  typescript?: boolean;
}

export default class Deps {
  protected _deps: Set<string>;

  public get deps(): string[] {
    return [...this._deps];
  }

  public constructor() {
    this._deps = new Set();
  }

  protected _addDeps(deps: string[]): void {
    deps.forEach((dep): void => {
      this._deps.add(dep);
    });
  }

  public has(dep: string): boolean {
    return this._deps.has(dep);
  }
}
