import { task, watch } from "gulp";
import { handleTest as test } from "./test";
import path from "path";
import { getDirs, getReportGlobForTodos } from "./todos";
import gulp from "gulp";

export const startWatchingPackages = async () => {
  try {
    const dirs = await getDirs();

    const reportGlob = dirs
      .filter((dir) => !dir.includes("organon"))
      .reduce((glb, dir) => {
        return glb.concat([
          path.join(dir, "*.json"),
          path.join(dir, "*-report/report.json"),
          path.join(dir, "mochawesome-report/*.json"),
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

    const reportGlobForTodos = await getReportGlobForTodos();

    watch(reportGlob, { events: ["add", "change"] }, test);
    watch(
      reportGlobForTodos,
      { events: ["add", "change"] },
      gulp.series("todos")
    );
  } catch (e) {
    console.error(e);
  }
};

task("package-watch", startWatchingPackages);
