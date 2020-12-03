import { expect } from "chai";
import { Todo } from "../src/todo-handler";

describe("Testing class Todo", (): void => {
  it("Instantiate with string", (): void => {
    const todo = new Todo("TODO");

    expect(todo.todo).to.equal("TODO");
    expect(todo.todos).to.eql([]);
    expect(isNaN(todo.evaluation)).to.be.true;
    expect(todo.getErrorMessages()).to.eql([
      'EVALUATE TODO: "TODO" needs to be evaluated or decomposed',
    ]);
  });

  it("Instantiate with {todo}", (): void => {
    const todo = new Todo({
      todo: "TODO",
    });

    expect(todo.todo).to.equal("TODO");
    expect(todo.todos).to.have.length(0);
    expect(isNaN(todo.evaluation)).to.be.true;
    expect(todo.getErrorMessages()).to.eql([
      'EVALUATE TODO: "TODO" needs to be evaluated or decomposed',
    ]);
  });

  it("Instantiate with {todo, evaluation}", (): void => {
    const todo = new Todo({
      todo: "TODO",
      evaluation: 10,
    });

    expect(todo.todo).to.equal("TODO");
    expect(todo.todos).to.have.length(0);
    expect(todo.evaluation).to.equal(10);
    expect(todo.getErrorMessages()).to.eql([]);
  });

  it("Instantiate with {todo, todos}", (): void => {
    const todo = new Todo({
      todo: "TODO",
      todos: [
        { todo: "TODO1", evaluation: 3 },
        { todo: "TODO2", evaluation: 7 },
        {
          todo: "TODO3",
          todos: [
            { todo: "TODO4", evaluation: 3 },
            { todo: "TODO5", evaluation: 7 },
          ],
        },
      ],
    });

    expect(todo.todo).to.equal("TODO");
    expect(todo.todos).to.have.length(3);
    expect(todo.evaluation).to.equal(20);
    expect(todo.getErrorMessages()).to.eql([]);
  });
});
