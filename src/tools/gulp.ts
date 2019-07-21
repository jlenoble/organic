import Deps, { Options } from "./common";

export default class GulpConfig extends Deps {
  public constructor(options: Options = {}) {
    super();

    const { babel, eslint, gulp, mocha }: Options = options;

    if (gulp) {
      this._addDeps(["gulp"]);

      if (babel) {
        this._addDeps(["gulp-babel"]);
      }

      if (eslint) {
        this._addDeps(["gulp-eslint"]);
      }

      if (mocha) {
        this._addDeps([
          "gulp-mocha",
          "chai",
          "mochawesome",
          "source-map-support"
        ]);

        this._addDeps({ mocha: "<6" });
      }
    }
  }
}
