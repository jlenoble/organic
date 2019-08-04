import path from "path";
import stripAnsi from "strip-ansi";

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
    reportName
  }: {
    packageDir: string;
    reportDir: string;
    reportName: string;
  }) {
    this.packageName = path.basename(packageDir);
    this.reportName = path.join(reportDir, reportName);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this._report = require(path.join(packageDir, reportDir, reportName));
    } catch (e) {
      this._report = {};
    }
  }

  public getErrorMessages(key: string): string[] {
    const keys = Object.keys(this._report);

    if (!keys.length) {
      return [`Report ${this.reportName} could not be found`];
    }

    return this._getErrorMessages(key);
  }

  protected _getErrorMessages(key: string): string[] {
    return [];
  }
}

export class BuildReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "mochawesome-report",
      reportName: "mochawesome-dev.json"
    });
  }

  protected _getErrorMessages(key: string): string[] {
    return getErrors(this._report.results);
  }
}

export class DistReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "mochawesome-report",
      reportName: "mochawesome.json"
    });
  }

  protected _getErrorMessages(key: string): string[] {
    return getErrors(this._report.results);
  }
}

export class LintReport extends Report {
  public constructor(packageDir: string) {
    super({
      packageDir,
      reportDir: "eslint-report",
      reportName: "report.json"
    });
  }

  protected _getErrorMessages(key: string): string[] {
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
      reportName: "report.json"
    });
  }

  protected _getErrorMessages(key: string): string[] {
    return this._report.messages;
  }
}

export default class Reports {
  public readonly buildReport: BuildReport;
  public readonly distReport: DistReport;
  public readonly lintReport: LintReport;
  public readonly typesReport: TypesReport;

  public get reports(): Report[] {
    return [
      this.buildReport,
      this.distReport,
      this.lintReport,
      this.typesReport
    ];
  }

  public constructor(packageDir: string) {
    this.buildReport = new BuildReport(packageDir);
    this.distReport = new DistReport(packageDir);
    this.lintReport = new LintReport(packageDir);
    this.typesReport = new TypesReport(packageDir);
  }

  public getErrorMessages(key: string): string[] {
    let messages: string[] = [];

    switch (key) {
      case "reports":
        this.reports.forEach((report): void => {
          messages = messages.concat(report.getErrorMessages(key));
        });
        break;
    }

    return messages.map((msg): string => stripAnsi(msg));
  }
}