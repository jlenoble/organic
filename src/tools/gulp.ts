import Deps, { Options } from "./common";

export default class GulpConfig extends Deps {
  public constructor(options: Options = {}) {
    super();

    const { babel, eslint, gulp, mocha, typescript }: Options = options;

    if (gulp) {
      this._addDeps([
        "gulp",
        "plumb-gulp",
        "autoreload-gulp",
        "gulp-sourcemaps",
        "gulp-cached",
        "gulp-newer",
        "del",
        "gulp-rename",
        "gulp-replace",
        "gulp-wrap",
        "ejs", // required by consolidate used by gulp-wrap
        "markdown-include",
        "polypath",
        "stream-to-promise",
        "chalk",
        "organon",
        "child-process-data"
      ]);

      if (babel) {
        this._addDeps("gulp-babel");
      }

      if (eslint) {
        this._addDeps(["gulp-eslint", "mkdirp"]);
      }

      if (mocha) {
        this._addDeps([
          "mocha",
          "gulp-mocha",
          "chai",
          "mochawesome",
          "source-map-support"
        ]);
      }

      if (typescript) {
        this._addDeps(["gulp-typescript", "fs-extra"]);
      }
    }
  }
}
