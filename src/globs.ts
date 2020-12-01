import path from "path";

export default class Globs {
  public readonly srcExts: string[];

  public readonly srcDir: string;
  public readonly testDir: string;
  public readonly gulpDir: string;

  public readonly srcGlob: string[];
  public readonly testGlob: string[];
  public readonly gulpGlob: string[];

  public readonly prodGlob: string[];
  public readonly devGlob: string[];

  public constructor() {
    this.srcExts = [".js", ".ts"];

    this.srcDir = "src";
    this.testDir = "test";
    this.gulpDir = "gulp";

    this.srcGlob = this._buildGlob(["src"], this.srcExts);
    this.testGlob = this._buildGlob(["test"], this.srcExts);
    this.gulpGlob = this._buildGlob(["gulp"], [".js"]).concat([
      "gulpfile.js",
      "gulpfile.babel.js",
    ]);

    this.devGlob = this.gulpGlob.concat(this.testGlob);
    this.prodGlob = this.srcGlob.concat();
  }

  protected _buildGlob(dirs: string[], exts: string[]): string[] {
    const globs: string[] = [];

    for (const dir of dirs) {
      for (const ext of exts) {
        globs.push(path.join(dir, "**/*" + ext));
      }
    }

    return globs;
  }
}
