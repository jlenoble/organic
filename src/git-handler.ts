import simplegit, {
  SimpleGit,
  DiffResult,
  StatusResult
} from "simple-git/promise";
import path from "path";
import fse from "fs-extra";

export interface GitReport {
  [packageName: string]: {
    status: StatusResult;
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

  public async status(): Promise<StatusResult> {
    return this._git.status();
  }

  public async report(): Promise<GitReport> {
    if (!this._report) {
      const dev = await this.diffDev();
      const origin = await this.diffOrigin();
      const status = await this.status();

      this._report = {
        [this.packageName]: {
          status,
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

  public async outputReport(path: string): Promise<void> {
    const report = await this.report();
    const messages = this.getErrorMessages();

    await fse.outputJson(
      path,
      { messages, ...report[this.packageName] },
      { spaces: 2 }
    );
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

        report.status.files.forEach((file): void => {
          messages.push(`Modification in "${file.path}" is not committed`);
        });

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
