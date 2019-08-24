import Deps, { Options } from "./common";
import BabelConfig from "./babel";
import EslintConfig from "./eslint";
import GitConfig from "./git";
import GulpConfig from "./gulp";
import MochaConfig from "./mocha";
import NpmConfig from "./npm";
import TypescriptConfig from "./typescript";

const defaultOptions: Options = {
  babel: true,
  eslint: true,
  git: true,
  gulp: true,
  mocha: true,
  node: "current",
  npm: true,
  prettier: true,
  typescript: true
};

export default class Tools extends Deps {
  public readonly babel: BabelConfig;
  public readonly eslint: EslintConfig;
  public readonly git: GitConfig;
  public readonly gulp: GulpConfig;
  public readonly mocha: MochaConfig;
  public readonly npm: NpmConfig;
  public readonly typescript: MochaConfig;

  public constructor(options: Options = defaultOptions) {
    super();

    this.babel = new BabelConfig(options);
    this.eslint = new EslintConfig(options);
    this.git = new GitConfig(options);
    this.gulp = new GulpConfig(options);
    this.mocha = new MochaConfig(options);
    this.npm = new NpmConfig(options);
    this.typescript = new TypescriptConfig(options);

    this._addDeps(this.babel.deps);
    this._addDeps(this.eslint.deps);
    this._addDeps(this.git.deps);
    this._addDeps(this.gulp.deps);
    this._addDeps(this.mocha.deps);
    this._addDeps(this.npm.deps);
    this._addDeps(this.typescript.deps);
  }
}
