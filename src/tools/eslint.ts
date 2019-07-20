import Deps, { Options } from "./common";

export default class EslintConfig extends Deps {
  public constructor({ eslint, prettier, typescript }: Options = {}) {
    super();

    if (eslint) {
      this._addDeps(["eslint", "eslint-config-google"]);

      if (prettier) {
        this._addDeps([
          "prettier",
          "eslint-config-prettier",
          "eslint-plugin-prettier"
        ]);
      }

      if (typescript) {
        this._addDeps([
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/parser",
          "@typescript-eslint/typescript-estree"
        ]);
      }
    }
  }
}
