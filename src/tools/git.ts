import Deps, { Options } from "./common";

export default class GitConfig extends Deps {
  public constructor({ git }: Options = {}) {
    super();

    if (git) {
      this._addDeps(["simple-git"]);
    }
  }
}
