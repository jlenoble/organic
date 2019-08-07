import path from "path";
import RegClient from "npm-registry-client";
import fse from "fs-extra";

export interface NpmReport {
  [packageName: string]: {
    devVersion: string;
    verdaccioVersion: string;
    npmVersion: string;
    changed: boolean;
  };
}

interface DistTags {
  latest: string;
}

function noop(): void {}

const config = {
  log: {
    error: noop,
    warn: noop,
    info: noop,
    verbose: noop,
    silly: noop,
    http: noop,
    pause: noop,
    resume: noop
  }
};

function getDistTags(uri: string): Promise<DistTags> {
  const client = new RegClient(config);
  const params = { timeout: 1000 };

  return new Promise((resolve, reject): void => {
    client.get(uri, params, (error: Error, data: DistTags): void => {
      if (error) {
        if (
          /Registry returned 404 for GET/.test(error.message) ||
          /no such package available/.test(error.message)
        ) {
          return resolve({ latest: "0.0.0" });
        }

        return reject(error);
      }

      resolve(data);
    });
  }) as Promise<DistTags>;
}

export default class NpmHandler {
  public readonly packageName: string;
  public readonly packageDir: string;
  protected _report?: NpmReport;

  public constructor(baseDir: string) {
    this.packageDir = baseDir;
    this.packageName = path.basename(baseDir);
  }

  public async devVersion(): Promise<string> {
    return require(path.join(this.packageDir, "package.json")).version;
  }

  public async verdaccioVersion(): Promise<string> {
    const uri = `http://localhost:4873/-/package/${this.packageName}/dist-tags`;
    const data = await getDistTags(uri);
    return data.latest;
  }

  public async npmVersion(): Promise<string> {
    const uri = `https://registry.npmjs.org/-/package/${this.packageName}/dist-tags`;
    const data = await getDistTags(uri);
    return data.latest;
  }

  public async report(): Promise<NpmReport> {
    if (!this._report) {
      const [devVersion, verdaccioVersion, npmVersion] = await Promise.all([
        this.devVersion(),
        this.verdaccioVersion(),
        this.npmVersion()
      ]);

      this._report = {
        [this.packageName]: {
          devVersion,
          verdaccioVersion,
          npmVersion,
          changed:
            devVersion !== verdaccioVersion || verdaccioVersion !== npmVersion
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
      const { devVersion, verdaccioVersion, npmVersion } = this._report[
        this.packageName
      ];

      if (verdaccioVersion === "0.0.0") {
        messages.push(`Package is unpublished on Verdaccio`);
      } else {
        if (devVersion !== verdaccioVersion) {
          messages.push(
            `Package version locally ${devVersion} differs from that on Verdaccio (${verdaccioVersion})`
          );
        }
      }

      if (npmVersion === "0.0.0") {
        messages.push(`Package is unpublished on Npm`);
      } else if (devVersion !== npmVersion) {
        messages.push(
          `Package version locally ${devVersion} differs from that on Npm (${npmVersion})`
        );
      }

      if (
        verdaccioVersion !== "0.0.0" &&
        npmVersion !== "0.0.0" &&
        npmVersion !== verdaccioVersion
      ) {
        messages.push(
          `Package version on Verdaccio ${verdaccioVersion} differs from that on Npm (${npmVersion})`
        );
      }
    }

    return messages;
  }
}
