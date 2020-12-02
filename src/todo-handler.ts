import path from "path";
import fse from "fs-extra";

type Todos = string[];

export interface TodoReport {
  [packageName: string]: {
    todos: Todos;
  };
}

export default class TodoHandler {
  public readonly packageName: string;
  public readonly todosPath: string;
  protected _report?: TodoReport;

  public constructor(baseDir: string) {
    this.packageName = path.basename(baseDir);
    this.todosPath = path.join(baseDir, "todo-report", "todos.json");
  }

  public async report(): Promise<TodoReport> {
    if (!this._report) {
      let todos: Todos;

      try {
        todos = await fse.readJSON(this.todosPath);
      } catch (e) {
        todos = [];
      }

      this._report = {
        [this.packageName]: {
          todos,
        },
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
      const { todos } = this._report[this.packageName];

      for (const todo of todos) {
        messages.push("TODO: " + todo.trim());
      }
    }

    return messages;
  }
}
