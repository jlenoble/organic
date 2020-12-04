import path from "path";
import fse from "fs-extra";
import moment from "moment";

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

      if (Array.isArray(todo.todos) && todo.todos.length) {
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

  private _getMessages(
    depth = 0,
    timeOffsets: Map<number, number> = new Map()
  ): string[] {
    const timeOffset = (timeOffsets.get(depth) || 0) + this.evaluation;
    timeOffsets.set(depth, timeOffset);

    return [
      "".padEnd(depth * 2) +
        `TODO: ${this.todo.trim()} (duration ${
          this.evaluation
        } minutes, completion ${moment
          .duration(timeOffset, "m")
          .humanize(true)})`,
    ].concat(
      this.todos
        .map((todo) => todo._getMessages(depth + 1, timeOffsets))
        .reduce(messageReducer, [])
    );
  }

  public getMessages(): string[] {
    return this.getErrorMessages().concat(this._getMessages());
  }
}

type Todos = Todo[];

export interface TodoReport {
  todos: Todos;
}

export default class TodoHandler {
  public readonly packageName: string;
  public readonly todosPath: string;
  protected _report?: TodoReport;

  public constructor(baseDir: string) {
    this.packageName = path.basename(baseDir);
    this.todosPath = path.join(baseDir, "todo-report", "todos.json");
  }

  public async report(extraTodos: Todo[] = []): Promise<TodoReport> {
    if (!this._report) {
      let todos: Todos;

      try {
        todos = await fse.readJSON(this.todosPath);
      } catch (e) {
        todos = [];
      }

      this._report = {
        todos: extraTodos.concat(todos),
      };
    }

    return this._report;
  }

  public async outputReport(
    path: string,
    extraTodos: Todo[] = []
  ): Promise<void> {
    const report = await this.report(extraTodos);
    console.log(report);
    const messages = this.getErrorMessages();

    await fse.outputJson(path, { messages, ...report }, { spaces: 2 });
  }

  public getErrorMessages(): string[] {
    let messages: string[] = [];

    if (this._report) {
      const { todos } = this._report;
      const todo = new Todo({
        todo: this.packageName,
        todos,
      });

      messages = todo.getMessages();
    }

    return messages;
  }
}
