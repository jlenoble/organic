import createEasyJson from "../src/easy-json";
import { expect } from "chai";

describe("Testint EasyJson", (): void => {
  it("Creating", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = createEasyJson(json);

    expect(easy.getValue()).to.eql(json);
  });

  it("Deeply assigning", (): void => {
    const json1 = {
      a: 1,
      b: true,
      c: [2, 3, 4],
      d: { e: ["hello", "bye"] },
      f: { a: { b: { c: { d: [{ e: [{ f: 4, u: 2 }, 14] }, 15] } } }, z: [5] }
    };

    const json2 = {
      b: { e: 7, f: ["foo"] },
      c: [3, 4],
      d: { e: ["bye"], f: 21 },
      g: 42,
      f: { a: { b: { c: { d: [{ e: [{ f: "changed" }] }] } } }, x: true }
    };

    const json3 = {
      a: 1,
      b: { e: 7, f: ["foo"] },
      c: [3, 4, 4],
      d: { e: ["bye", "bye"], f: 21 },
      g: 42,
      f: {
        a: { b: { c: { d: [{ e: [{ f: "changed", u: 2 }, 14] }, 15] } } },
        z: [5],
        x: true
      }
    };

    const easy = createEasyJson(json1);
    easy.deepAssign(json2);

    expect(easy.getValue()).to.eql(json3);
  });

  it("Deeply cloning", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = createEasyJson(json);
    const easy2 = easy.deepClone();

    expect(easy2.getValue()).to.eql(json);
    expect(easy2).not.to.equal(easy);
  });

  it("equals", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = createEasyJson(json);
    const easy2 = createEasyJson(json);
    const easy3 = createEasyJson(json);

    easy2.deepAssign({
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"] }
    });

    easy3.deepAssign({
      f: 33,
      c: [2, 3, 4],
      d: { e: ["hello"], g: 3 }
    });

    expect(easy.getValue()).to.eql(json);
    expect(easy.equals(json)).to.be.true;

    expect(easy.equals(easy2.getValue())).to.be.false;
    expect(easy2.equals(easy.getValue())).to.be.false;

    expect(easy.equals(easy3.getValue())).to.be.false;
    expect(easy3.equals(easy.getValue())).to.be.false;
  });

  it("includes", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = createEasyJson(json);
    const easy2 = createEasyJson(json);

    easy2.deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.includes(easy2.getValue())).to.be.false;
    expect(easy2.includes(easy.getValue())).to.be.true;
  });

  it("isIncluded", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = createEasyJson(json);
    const easy2 = createEasyJson(json);

    easy2.deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.isIncluded(easy2.getValue())).to.be.true;
    expect(easy2.isIncluded(easy.getValue())).to.be.false;
  });
});
