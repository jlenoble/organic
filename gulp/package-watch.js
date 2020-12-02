import { task, watch } from "gulp";
import { handleTest as test } from "./test";
import { resolveGlob } from "polypath";
import path from "path";

export const startWatchingPackages = async (done) => {
  try {
    const dirs = await resolveGlob("packages/*");
    const reportGlob = dirs
      .filter((dir) => !dir.includes("organon"))
      .reduce((glb, dir) => {
        return glb.concat([
          path.join(dir, "*.json"),
          path.join(dir, "*-report/*.json"),
        ]);
      }, [])
      .concat(
        dirs
          .filter((dir) => dir.includes("organon"))
          .reduce((glb, dir) => {
            return glb.concat([
              path.join(dir, "*.json"),
              path.join(dir, "eslint-report/*.json"),
              path.join(dir, "typescript-report/*.json"),
            ]);
          }, [])
      );

    watch(reportGlob, { events: ["add", "change"] }, test);

    done();
  } catch (e) {
    done(e);
  }
};

task("package-watch", startWatchingPackages);
