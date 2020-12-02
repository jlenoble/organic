import gulp from "gulp";
import chalk from "chalk";
import { TodoHandler } from "organon";

export const todoGlob = "todo-report/todos.json";

export const todoCheck = async () => {
  try {
    const cwd = process.cwd();
    const todo = new TodoHandler(cwd);

    await Promise.all([todo.outputReport("todo-report/report.json")]);

    const warnMessages = [
      chalk.red("The following warnings were encountered during TODO check:"),
    ].concat(todo.getErrorMessages().map((msg) => chalk.yellow(msg)));

    if (warnMessages.length > 1) {
      console.warn(warnMessages.join("\n  - "));
    }
  } catch (e) {
    console.error(e);
  }
};

gulp.task("todo", todoCheck);
