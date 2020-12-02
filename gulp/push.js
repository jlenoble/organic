import gulp, { series } from "gulp";
import childProcessData from "child-process-data";
import "./prepublish";

class GitHandler {
  async getActiveBranch() {
    if (!this.activeBranch) {
      const result = await childProcessData(["git", ["branch"]], {
        silent: true,
      });

      this.lines = result.out().split("\n");
      const filteredLines = this.lines.filter((line) => /^\* \w+/.test(line));

      if (filteredLines.length === 1) {
        this.activeBranch = filteredLines[0].substring(2);
      } else {
        throw new Error("Failed to get active branch");
      }
    }

    return this.activeBranch;
  }

  async getDevBranch() {
    if (!this.devBranch) {
      const activeBranch = await this.getActiveBranch();
      this.devBranch = activeBranch;

      if (activeBranch === "master") {
        if (this.lines.length === 2) {
          this.devBranch = this.lines
            .filter((line) => !/^\* \w+/.test(line))[0]
            .substring(2);
        } else {
          throw new Error(
            "Already on branch master; Cannot determine dev branch"
          );
        }
      }
    }

    return this.devBranch;
  }

  async checkoutMaster() {
    const activeBranch = await this.getActiveBranch();

    if (activeBranch === "master") {
      return;
    }

    const devBranch = await this.getDevBranch();

    if (typeof devBranch === "string" && devBranch !== "master") {
      await childProcessData(["git", ["checkout", "master"]]);
      this.activeBranch = "master";
    } else {
      throw new Error("Won't checkout master: dev branch is undetermined");
    }
  }

  async mergeIntoMaster() {
    const devBranch = await this.getDevBranch();

    await this.checkoutMaster();

    if (typeof devBranch === "string" && devBranch !== "master") {
      await childProcessData(["git", ["merge", "master", devBranch]]);
    } else {
      throw new Error("Won't merge into master: dev branch is undetermined");
    }
  }

  async pushToOrigin() {
    const activeBranch = await this.getActiveBranch();

    if (activeBranch === "master") {
      await childProcessData(["git", ["push"]]);
    } else {
      throw new Error("Not on master branch; Won't push to origin");
    }
  }

  async checkoutDevBranch() {
    const devBranch = await this.getDevBranch();

    if (this.activeBranch === devBranch) {
      return;
    }

    if (typeof devBranch === "string" && devBranch !== "master") {
      await childProcessData(["git", ["checkout", devBranch]]);
      this.activeBranch = devBranch;
    } else {
      throw new Error("Dev branch is undetermined; Cannot check it out");
    }
  }
}

const push = async () => {
  const handler = new GitHandler();

  await handler.mergeIntoMaster();
  await handler.pushToOrigin();
  await handler.checkoutDevBranch();
};

gulp.task(
  "push",
  series(
    "test",
    gulp.parallel("lint", "dist-clean", "doc"),
    "dist-test",
    "types",
    push,
    "sanity-check"
  )
);
