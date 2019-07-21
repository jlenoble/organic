import Deps, { Options } from "./common";
import { Linter } from "eslint";

export default class EslintConfig extends Deps {
  public readonly parser?: string;
  public readonly parserOptions?: Linter.ParserOptions;
  public readonly plugins?: string[];
  public readonly extends?: string[];
  public readonly rules?: {
    [name: string]: Linter.RuleLevel | Linter.RuleLevelAndOptions;
  };

  public constructor({ eslint, prettier, typescript }: Options = {}) {
    super();

    if (eslint) {
      this.parserOptions = {
        ecmaVersion: 2019,
        sourceType: "module",
        ecmaFeatures: {}
      };

      this.plugins = [];
      this.extends = [];
      this.rules = {};

      this._addDeps(["eslint", "eslint-config-google"]);

      this.extends.push("google");

      Object.assign(this.rules, {
        "require-jsdoc": ["off"],
        "prefer-arrow-callback": ["error"]
      });

      if (prettier) {
        this._addDeps([
          "prettier",
          "eslint-config-prettier",
          "eslint-plugin-prettier"
        ]);

        this.extends.push("plugin:prettier/recommended");
      }

      if (typescript) {
        this.parser = "@typescript-eslint/parser";

        this._addDeps([
          this.parser,
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/typescript-estree"
        ]);

        this.extends.push("plugin:@typescript-eslint/recommended");

        if (prettier) {
          this.extends.push("prettier/@typescript-eslint");
        }
      }
    }
  }
}
