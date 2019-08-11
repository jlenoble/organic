import EasyJson from "../src/easy-json";
import { expect } from "chai";

describe("Testint EasyJson", (): void => {
  it("Creating", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = new EasyJson(json);

    expect(easy.value).to.eql(json);
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

    const easy = new EasyJson(json1);
    easy.deepAssign(json2);

    expect(easy.value).to.eql(json3);
  });

  it("Deeply cloning", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = new EasyJson(json);
    const easy2 = easy.deepClone();

    expect(easy2.value).to.eql(json);
    expect(easy2).not.to.equal(easy);
  });

  it("equals", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = new EasyJson(json);
    const easy2 = new EasyJson(json);
    const easy3 = new EasyJson(json);

    easy2.deepAssign({
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"] }
    });

    easy3.deepAssign({
      f: 33,
      c: [2, 3, 4],
      d: { e: ["hello"], g: 3 }
    });

    expect(easy.value).to.eql(json);
    expect(easy.equals(json)).to.be.true;

    expect(easy.equals(easy2.value)).to.be.false;
    expect(easy2.equals(easy.value)).to.be.false;

    expect(easy.equals(easy3.value)).to.be.false;
    expect(easy3.equals(easy.value)).to.be.false;
  });

  it("includes", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = new EasyJson(json);
    const easy2 = new EasyJson(json);

    easy2.deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.includes(easy2.value)).to.be.false;
    expect(easy2.includes(easy.value)).to.be.true;
  });

  it("isIncluded", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = new EasyJson(json);
    const easy2 = new EasyJson(json);

    easy2.deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.isIncluded(easy2.value)).to.be.true;
    expect(easy2.isIncluded(easy.value)).to.be.false;
  });
});
