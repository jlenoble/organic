import simplegit, { SimpleGit, DiffResult } from "simple-git/promise";
import path from "path";

export interface GitReport {
  [packageName: string]: {
    dev: DiffResult;
    origin: DiffResult;
    changed: boolean;
    onDev: boolean;
    hasDev: boolean;
  };
}

export default class GitHandler {
  public readonly packageName: string;
  protected _report?: GitReport;
  protected _hasDevBranch?: boolean;
  protected _git: SimpleGit;

  public constructor(baseDir: string) {
    this.packageName = path.basename(baseDir);
    this._git = simplegit(baseDir);
  }

  public async diffDev(): Promise<{
    onDev: boolean;
    hasDev: boolean;
    diffSummary: DiffResult;
  }> {
    const branchSummary = await this._git.branchLocal();

    const onDev = branchSummary.current === "dev";
    const hasDev = branchSummary.all.includes("dev");

    if (hasDev) {
      const diffSummary = await this._git.diffSummary(["dev", "master"]);
      return { onDev, hasDev, diffSummary };
    }

    return {
      onDev,
      hasDev,
      diffSummary: { files: [], insertions: 0, deletions: 0, changed: 0 }
    };
  }

  public async diffOrigin(): Promise<{ diffSummary: DiffResult }> {
    return {
      diffSummary: await this._git.diffSummary(["master", "origin/master"])
    };
  }

  public async report(): Promise<GitReport> {
    if (!this._report) {
      const [dev, origin] = await Promise.all([
        this.diffDev(),
        this.diffOrigin()
      ]);

      this._report = {
        [this.packageName]: {
          dev: dev.diffSummary,
          origin: origin.diffSummary,
          changed:
            (dev.diffSummary && dev.diffSummary.changed > 0) ||
            origin.diffSummary.changed > 0,
          onDev: dev.onDev,
          hasDev: dev.hasDev
        }
      };
    }

    return this._report;
  }

  public getErrorMessages(): string[] {
    const messages: string[] = [];

    if (this._report) {
      const report = this._report[this.packageName];

      if (!report.hasDev) {
        messages.push(`Git branch "dev" is not defined`);
      } else {
        if (!report.onDev) {
          messages.push(`Git branch "dev" is not the working branch`);
        }

        if (report.dev.changed) {
          messages.push(`Git branch "dev" differs from "master"`);
        }
      }

      if (report.origin.changed) {
        messages.push(`Git branch "master" differs from "origin/master"`);
      }
    }

    return messages;
  }
}
