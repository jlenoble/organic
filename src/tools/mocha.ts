import Deps, { Options } from "./common";

export default class MochaConfig extends Deps {
  public constructor({ mocha }: Options = {}) {
    super();

    if (mocha) {
      this._addDeps(["mocha", "chai", "mochawesome", "source-map-support"]);
    }
  }
}
