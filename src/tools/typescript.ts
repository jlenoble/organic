import Deps, { Options } from "./common";
import BabelConfig from "./babel";
import EslintConfig from "./eslint";

export default class TypescriptConfig extends Deps {
  public constructor(options: Options = {}) {
    super();

    const { babel, eslint, typescript }: Options = options;

    if (typescript) {
      this._addDeps(["typescript", "@types/node"]);

      if (babel) {
        this._addDeps(
          new BabelConfig(options).deps.filter((dep): boolean =>
            /typescript/.test(dep)
          )
        );
      }

      if (eslint) {
        this._addDeps(
          new EslintConfig(options).deps.filter((dep): boolean =>
            /typescript/.test(dep)
          )
        );
      }
    }
  }
}
