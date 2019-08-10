import path from "path";
import { chDir } from "cleanup-wrapper";
import childProcessData from "child-process-data";
import { spawn } from "child_process";

enum Actions {
  "yo wupjs",
  "gulp test",
  "gulp lint",
  "gulp dist-test",
  "gulp types",
  "gulp sanity-check"
}

function compare(a1: Actions, a2: Actions): 1 | 0 | -1 {
  if (a1 > a2) {
    return 1;
  } else if (a1 < a2) {
    return -1;
  } else {
    return 0;
  }
}

export class Fixes {
  protected _fixes: Map<string, Set<Actions>> = new Map();

  public add(pckg: string, action: Actions): void {
    if (!this._fixes.has(pckg)) {
      this._fixes.set(pckg, new Set([action]));
    } else {
      (this._fixes.get(pckg) as Set<Actions>).add(action);
    }
  }

  public get(pckg: string): string[] {
    if (!this._fixes.has(pckg)) {
      return [];
    }

    return [...(this._fixes.get(pckg) as Set<Actions>)]
      .sort(compare)
      .map((action): string => Actions[action]);
  }

  public getFixes(): [string, string[]][] {
    return Array.from(this._fixes.keys()).map((pckg): [string, string[]] => {
      return [pckg, this.get(pckg)];
    });
  }
}

export default class Fixer {
  protected _fixes: Fixes;
  protected _packageDir: string;

  public constructor(packageDir: string) {
    this._packageDir = packageDir;
    this._fixes = new Fixes();
  }

  public addFix(message: string): boolean {
    let match = message.match(
      /"(.+)" is not managed by latest Wup@\d+\.\d+\.\d+(?:-\d+)?/
    );

    if (match) {
      this._fixes.add(match[1], Actions["yo wupjs"]);
      return true;
    }

    match = message.match(
      /"(.+)": Report (.+)-report\/(.+).json could not be found/
    );

    if (match) {
      switch (match[2]) {
        case "git":
        case "npm":
          this._fixes.add(match[1], Actions["gulp sanity-check"]);
          return true;

        case "eslint":
          this._fixes.add(match[1], Actions["gulp lint"]);
          return true;

        case "mochawesome":
          if (match[3] === "mochawesome-dev") {
            this._fixes.add(match[1], Actions["gulp test"]);
          } else {
            this._fixes.add(match[1], Actions["gulp dist-test"]);
          }
          return true;

        case "typescript":
          this._fixes.add(match[1], Actions["gulp types"]);
          return true;
      }
    }

    return false;
  }

  public addFixes(messages: string): string {
    if (
      !messages ||
      /The following errors were not considered for fixing/.test(messages)
    ) {
      return "";
    }

    let pckg = "";
    const fixed = messages.split("\n");
    const notFixed = messages.split("\n");
    let hasUnfixed = false;

    messages.split(/\n\s+-/).forEach((msg, i): void => {
      if (/The following errors were encountered/.test(msg)) {
        return;
      }

      const match = msg.match(/^ (".+":)$/);

      if (match) {
        pckg = match[1];
        return;
      }

      if (this.addFix(pckg + msg)) {
        notFixed[i] = "";
      } else {
        fixed[i] = "";
        hasUnfixed = true;
      }

      return;
    });

    if (hasUnfixed) {
      let prevPckg = -1;
      let pckg = -1;
      let onlyEmpty: boolean | undefined;

      fixed[0] = "     The following errors are considered for fixing:";
      notFixed[0] = "     The following errors are not considered for fixing:";

      const handleEmpty = (msg: string, i: number, arr: string[]): void => {
        const next = /^       - ".+":$/.test(msg);

        if (next) {
          prevPckg = pckg;
          pckg = i;

          if (onlyEmpty && prevPckg > 0) {
            arr[prevPckg] = "";
          }

          onlyEmpty = undefined;
        } else {
          if (onlyEmpty === undefined || onlyEmpty) {
            onlyEmpty = msg === "";
          }
        }

        if (onlyEmpty && i === arr.length - 1) {
          arr[pckg] = "";
        }
      };

      notFixed.forEach(handleEmpty);

      prevPckg = -1;
      pckg = -1;
      onlyEmpty = undefined;

      fixed.forEach(handleEmpty);

      return fixed
        .concat(notFixed)
        .filter((msg): boolean => msg !== "")
        .join("\n");
    } else {
      return messages.replace(
        "The following errors were encountered:",
        "     The following errors are considered for fixing:"
      );
    }
  }

  public async fix(pckg: string, action: string): Promise<void> {
    pckg = path.join(this._packageDir, pckg);

    const [cmd, ...args] = action.split(/\s+/);

    await chDir(
      pckg,
      async (): Promise<void> => {
        await childProcessData(spawn(cmd, args, { stdio: "pipe" }));
      }
    )();
  }

  public getFixes(): [string, string[]][] {
    return this._fixes.getFixes();
  }

  public async fixAll(): Promise<void> {
    for (const [pckg, actions] of this.getFixes()) {
      for (const action of actions) {
        await this.fix(pckg, action);
        break;
      }
      break;
    }
  }
}
