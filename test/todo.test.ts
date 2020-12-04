import { expect } from "chai";
import { Todo } from "../src/todo-handler";

describe("Testing class Todo", (): void => {
  describe("Initializing", () => {
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

    describe("Computing offsets", () => {
      it("Same depths", (): void => {
        const todo = new Todo({
          todo: "TODO0",
          todos: [
            {
              todo: "TODO1",
              todos: [
                { todo: "TODO2", evaluation: 1 },
                { todo: "TODO3", evaluation: 2 },
              ],
            },
            {
              todo: "TODO4",
              todos: [
                { todo: "TODO5", evaluation: 4 },
                { todo: "TODO6", evaluation: 8 },
              ],
            },
          ],
        });

        expect(todo.evaluation).to.equal(15);
        expect(todo.getMessages()).to.eql([
          "TODO: TODO0 (duration 15 minutes, completion in 15 minutes)",
          "  TODO: TODO1 (duration 3 minutes, completion in 3 minutes)",
          "    TODO: TODO2 (duration 1 minutes, completion in a minute)",
          "    TODO: TODO3 (duration 2 minutes, completion in 3 minutes)",
          "  TODO: TODO4 (duration 12 minutes, completion in 15 minutes)",
          "    TODO: TODO5 (duration 4 minutes, completion in 7 minutes)",
          "    TODO: TODO6 (duration 8 minutes, completion in 15 minutes)",
        ]);
      });

      it("Increasing depths", (): void => {
        const todo = new Todo({
          todo: "TODO0",
          todos: [
            { todo: "TODO1", evaluation: 1 },
            { todo: "TODO2", evaluation: 2 },
            {
              todo: "TODO3",
              todos: [
                { todo: "TODO4", evaluation: 4 },
                { todo: "TODO5", evaluation: 8 },
              ],
            },
          ],
        });

        expect(todo.evaluation).to.equal(15);
        expect(todo.getMessages()).to.eql([
          "TODO: TODO0 (duration 15 minutes, completion in 15 minutes)",
          "  TODO: TODO1 (duration 1 minutes, completion in a minute)",
          "  TODO: TODO2 (duration 2 minutes, completion in 3 minutes)",
          "  TODO: TODO3 (duration 12 minutes, completion in 15 minutes)",
          "    TODO: TODO4 (duration 4 minutes, completion in 7 minutes)",
          "    TODO: TODO5 (duration 8 minutes, completion in 15 minutes)",
        ]);
      });

      it("Decreasing depths", (): void => {
        const todo = new Todo({
          todo: "TODO0",
          todos: [
            {
              todo: "TODO1",
              todos: [
                { todo: "TODO2", evaluation: 1 },
                { todo: "TODO3", evaluation: 2 },
              ],
            },
            { todo: "TODO4", evaluation: 4 },
            { todo: "TODO5", evaluation: 8 },
          ],
        });

        expect(todo.evaluation).to.equal(15);
        expect(todo.getMessages()).to.eql([
          "TODO: TODO0 (duration 15 minutes, completion in 15 minutes)",
          "  TODO: TODO1 (duration 3 minutes, completion in 3 minutes)",
          "    TODO: TODO2 (duration 1 minutes, completion in a minute)",
          "    TODO: TODO3 (duration 2 minutes, completion in 3 minutes)",
          "  TODO: TODO4 (duration 4 minutes, completion in 7 minutes)",
          "  TODO: TODO5 (duration 8 minutes, completion in 15 minutes)",
        ]);
      });
    });
  });
});
