import gulp from "gulp";
import chalk from "chalk";
import path from "path";
import { resolveGlob } from "polypath";
import { TodoHandler, Reports } from "organon";
import cached from "gulp-cached";
import debug from "gulp-debug";
import changed from "gulp-changed";
import through2 from "through2";

let dirs: string[];
let reportGlobForTodos: string[];

export const getDirs = async (): Promise<string[]> => {
  if (dirs === undefined) {
    dirs = (await resolveGlob("packages/*")).map((dir) =>
      dir.replace(process.cwd(), ".")
    );
  }

  return dirs;
};

export const getReportGlobForTodos = async (): Promise<string[]> => {
  if (reportGlobForTodos === undefined) {
    reportGlobForTodos = (await getDirs()).reduce((glb, dir) => {
      return glb.concat([
        path.join(dir, "git-report/report.json"),
        path.join(dir, "npm-report/report.json"),
        path.join(dir, "eslint-report/report.json"),
        path.join(dir, "typescript-report/report.json"),
        path.join(dir, "mochawesome-report/*.json"),
      ]);
    }, []);
  }

  return reportGlobForTodos;
};

export const generateAutoTodos = (): NodeJS.ReadWriteStream => {
  const cwd = process.cwd();

  return gulp
    .src(reportGlobForTodos, {
      since: gulp.lastRun(generateAutoTodos),
      base: process.cwd(),
    })
    .pipe(cached("TODOS"))
    .pipe(
      through2.obj((file, encoding, done) => {
        if (file.isNull()) {
          return done(null, file);
        }

        if (file.isBuffer()) {
          try {
            const packageDir = path.dirname(path.dirname(file.path));

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const typescript = require(path.join(packageDir, ".yo-rc.json"))[
              "generator-wupjs"
            ].typescript as boolean;

            const reports = new Reports(packageDir, { typescript });
            const todo = new TodoHandler(packageDir);

            todo.report(reports.getAutoTodos()).then(
              (report) => {
                const messages = todo.getErrorMessages();

                file.contents = Buffer.from(
                  JSON.stringify({ messages, ...report }, null, 2),
                  encoding
                );

                file.path = path.join(packageDir, "todo-report/report.json");

                done(null, file);
              },
              (err) => done(err)
            );
          } catch (e) {
            done(e);
          }
        }
      })
    )
    .pipe(cached("TODOS"))
    .pipe(
      changed(cwd, {
        hasChanged: changed.compareContents,
      })
    )
    .pipe(debug({ title: "Updated TODO report(s):" }))
    .pipe(gulp.dest(cwd));
};

export const printTodos = async (): Promise<void> => {
  const cache: Record<string, string> = cached.caches["TODOS"];
  const packages = process.cwd() + "/packages/";

  Object.entries(cache).forEach(([key, value]) => {
    if (key.includes("/todo-report/")) {
      const warnMessages = [
        chalk.red(
          `The following warnings were encountered in ${path.dirname(
            path.dirname(key).replace(packages, "")
          )}:`
        ),
      ].concat(
        JSON.parse(value).messages.map((msg: string) => chalk.yellow(msg))
      );

      if (warnMessages.length > 1) {
        console.warn(warnMessages.join("\n  - "));
      }
    }
  });
};

gulp.task(
  "todos",
  gulp.series(getReportGlobForTodos, generateAutoTodos, printTodos)
);
