import path from "path";
import stripAnsi from "strip-ansi";
import { Wup } from "./dependencies";
import { Todo } from "./todo-handler";
import fse from "fs-extra";

interface RawReport {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface EslintMessage {
  ruleId: string;
  message: string;
  line: number;
  column: number;
}

interface MochaTest {
  title: string;
  fullTitle: string;
  timedOut: boolean;
  duration: number;
  state: "failed" | null;
  speed: null;
  pass: boolean;
  fail: boolean;
  pending: boolean;
  context: null;
  code: string;
  err: {
    message: string;
    estack: string;
    diff: null;
  };
  uuid: string;
  parentUUID: string;
  isHook: boolean;
  skipped: boolean;
}

interface MochaSuite {
  uuid: string;
  title: string;
  fullFile: string;
  file: string;
  beforeHooks: MochaTest[];
  afterHooks: MochaTest[];
  tests: MochaTest[];
  suites: MochaSuite[];
  passes: string[];
  failures: string[];
  pending: string[];
  skipped: string[];
  duration: number;
  root: boolean;
  rootEmpty: boolean;
  _timeout: number;
}

function getErrors(suites: MochaSuite[]): string[] {
  let errors: string[] = [];

  for (const suite of suites) {
    if (suite.failures && suite.failures.length) {
      const tests = suite.tests
        .concat(suite.beforeHooks)
        .concat(suite.afterHooks);

      for (const test of tests) {
        if (test.fail) {
          const stack = test.err.estack.split("\n");

          if (stack.length >= 2) {
            const match = stack[1].match(/\s+\S+\s+\((.+):(\d+):(\d+)\)/);

            if (match) {
              errors.push(
                `${match[1]}(${match[2]},${match[3]}): ${test.fullTitle}: ${test.err.message}`
              );
              continue;
            }
          }

          errors.push(`${suite.file}: ${test.fullTitle}: ${test.err.message}`);
        }
      }
    }

    if (suite.suites && suite.suites.length) {
      errors = errors.concat(getErrors(suite.suites));
    }
  }

  return errors;
}

class Report {
  public readonly packageName: string;
  public readonly reportName: string;
  protected readonly _report: RawReport;

  public get report(): RawReport {
    return { ...this._report };
  }

  protected constructor({
    packageDir,
    reportDir,
    reportName,
  }: {
    packageDir: string;
    reportDir: string;
    reportName: string;
  }) {
    this.packageName = path.basename(packageDir);
    this.reportName = path.join(reportDir, reportName);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this._report = fse.readJSONSync(
        path.join(packageDir, reportDir, reportName)
      );
    } catch (e) {
      this._report = {};
    }
  }

  public getErrorMessages(): string[] {
    const keys = Object.keys(this._report);

    if (!keys.length) {
      return [`Report ${this.reportName} could not be found`];
    }

    return this._getErrorMessages();
  }

  public getTodo(): Todo | null {
    const messages = this.getErrorMessages();

    if (messages.length) {
      return new Todo({
        todo: `Fix ${messages.length} error(s) in ${this.reportName}`,
        evaluation: messages.length * 5,
      });
    }

    return null;
  }

  protected _getErrorMessages(): string[] {
    return [];
  }
}

export class BuildReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "mochawesome-report",
      reportName: "mochawesome-dev.json",
    });
  }

  protected _getErrorMessages(): string[] {
    return getErrors(this._report.results);
  }
}

export class DistReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "mochawesome-report",
      reportName: "mochawesome.json",
    });
  }

  public getErrorMessages(): string[] {
    const keys = Object.keys(this._report);

    if (!keys.length) {
      return [];
    }

    return getErrors(this._report.results);
  }
}

export class LintReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "eslint-report",
      reportName: "report.json",
    });
  }

  protected _getErrorMessages(): string[] {
    return this._report.results.reduce(
      (
        messages: string[],
        R: { filePath: string; messages: EslintMessage[] }
      ): string[] => {
        const msgs: string[] = R.messages.map(
          ({ ruleId, message, line, column }: EslintMessage): string => {
            return `${path.relative(
              path.join(path.dirname(process.cwd()), this.packageName),
              R.filePath
            )}(${line},${column}): ${ruleId}: ${message}`;
          }
        );

        return messages.concat(msgs);
      },
      []
    );
  }
}

export class TypesReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "typescript-report",
      reportName: "report.json",
    });
  }

  protected _getErrorMessages(): string[] {
    return this._report.messages.filter((msg: string): boolean => {
      // Could not find a declaration file error
      return !msg.includes("error TS7016");
    });
  }
}

export class GitReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "git-report",
      reportName: "report.json",
    });
  }

  protected _getErrorMessages(): string[] {
    return this._report.messages;
  }
}

export class NpmReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "npm-report",
      reportName: "report.json",
    });
  }

  protected _getErrorMessages(): string[] {
    return this._report.messages;
  }
}

export class TodoReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "todo-report",
      reportName: "report.json",
    });
  }

  protected _getErrorMessages(): string[] {
    return this._report.messages;
  }
}

export default class Reports {
  public readonly buildReport: BuildReport;
  public readonly distReport: DistReport;
  public readonly lintReport: LintReport;
  public readonly typesReport?: TypesReport;
  public readonly gitReport: GitReport;
  public readonly npmReport: NpmReport;
  public readonly todoReport: TodoReport;

  public get reports(): Report[] {
    return this.getReports();
  }

  public constructor(packageDir: string, options: Partial<Wup>) {
    this.buildReport = new BuildReport(packageDir);
    this.distReport = new DistReport(packageDir);
    this.lintReport = new LintReport(packageDir);
    this.gitReport = new GitReport(packageDir);
    this.npmReport = new NpmReport(packageDir);
    this.todoReport = new TodoReport(packageDir);

    if (options.typescript) {
      this.typesReport = new TypesReport(packageDir);
    }
  }

  public getReports(includeTodoReport = true): Report[] {
    const reports = [this.buildReport, this.distReport, this.lintReport];

    if (this.typesReport !== undefined) {
      reports.push(this.typesReport);
    }

    reports.push(this.gitReport, this.npmReport);

    if (includeTodoReport) {
      reports.push(this.todoReport);
    }

    return reports;
  }

  public getErrorMessages(): string[] {
    let messages: string[] = [];

    this.getReports(false).forEach((report): void => {
      messages = messages.concat(report.getErrorMessages());
    });

    return messages.map((msg): string => stripAnsi(msg));
  }

  public getAutoTodos(): Todo[] {
    return this.getReports(false)
      .map((report) => report.getTodo())
      .filter((todo): todo is Todo => todo !== null);
  }

  public getTodoMessages(): string[] {
    const messages: string[] = this.todoReport.getErrorMessages();
    return messages.map((msg): string => stripAnsi(msg));
  }
}
