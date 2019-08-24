import Deps, { Options } from "./common";

export default class NpmConfig extends Deps {
  public constructor({ npm }: Options = {}) {
    super();

    if (npm) {
      this._addDeps(["npm-registry-client"]);
    }
  }
}
