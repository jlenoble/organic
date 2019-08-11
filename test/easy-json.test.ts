import EasyJson from "../src/easy-json";
import { expect } from "chai";

describe("Testint EasyJson", (): void => {
  it("Creating an EasyJson object", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = new EasyJson(json);

    expect(easy.value).to.eql(json);
  });

  it("Deeply assigning an EasyJson object", (): void => {
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

  it("Deeply cloning an EasyJson object", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = new EasyJson(json);
    const easy2 = easy.deepClone();

    expect(easy2.value).to.eql(json);
    expect(easy2).not.to.equal(easy);
  });
});
