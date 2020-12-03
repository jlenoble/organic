import path from "path";
import fse from "fs-extra";

interface ValidTodo {
  readonly todo: string;
  readonly todos: ValidTodo[];
  readonly evaluation: number;
}

interface PartialTodo {
  readonly todo: string;
  readonly evaluation?: number;
  readonly todos?: TodoInitializer[];
}

type TodoInitializer = string | PartialTodo;

const messageReducer = (messages1: string[], messages2: string[]): string[] => {
  return messages1.concat(messages2);
};

export class Todo implements ValidTodo {
  private readonly _errorMessages: string[];

  public readonly todo: string;
  public readonly todos: Todo[];
  public readonly evaluation: number;

  public constructor(todo: TodoInitializer) {
    if (typeof todo === "string") {
      this.todo = todo;
      this.todos = [];
      this.evaluation = NaN;
    } else {
      this.todo = todo.todo;

      if (Array.isArray(todo.todos)) {
        this.todos = todo.todos.map((todo) => new Todo(todo));
        this.evaluation = this.todos.reduce(
          (evaluation: number, todo: Todo): number => {
            return evaluation + todo.evaluation;
          },
          0
        );
      } else {
        this.todos = [];
        this.evaluation = todo.evaluation || NaN;
      }
    }

    this._errorMessages = isNaN(this.evaluation)
      ? [`EVALUATE TODO: "${this.todo}" needs to be evaluated or decomposed`]
      : [];
  }

  public getErrorMessages(): string[] {
    return this.todos
      .map((todo) => todo.getErrorMessages())
      .reduce(messageReducer, [])
      .concat(this._errorMessages);
  }

  public getMessages(depth = 0): string[] {
    return [
      "".padEnd(depth * 2) + `TODO[${this.evaluation}]: ${this.todo.trim()}`,
    ].concat(
      this.todos
        .map((todo) => todo.getMessages(depth + 1))
        .reduce(messageReducer, [])
    );
  }
}

type Todos = Todo[];

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
    let messages: string[] = [];

    if (this._report) {
      const { todos } = this._report[this.packageName];
      const todo = new Todo({
        todo: this.packageName,
        todos,
      });

      messages = todo.getMessages();
    }

    return messages;
  }
}
