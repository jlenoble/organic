import { expect } from "chai";
import Organon from "../src/index";

describe("Testing Organon", (): void => {
  const defaultArgs = [];

  it("Class Organon can be instanciated", (): void => {
    expect(
      (): void => {
        new Organon(...defaultArgs);
      }
    ).not.to.throw();
  });
});
