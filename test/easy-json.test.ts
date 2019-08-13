import easyJson, { JsonMap } from "../src/easy-json";
import { expect } from "chai";

describe("Testint EasyJson", (): void => {
  it("Creating", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);

    expect(easy.$getValue()).to.eql(json);
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

    const easy = easyJson(json1);
    easy.$deepAssign(json2);

    expect(easy.$getValue()).to.eql(json3);
  });

  it("Deeply cloning", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);
    const easy2 = easy.$deepClone();

    expect(easy2.$getValue()).to.eql(json);
    expect(easy2).not.to.equal(easy);
  });

  it("equals", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);
    const easy2 = easyJson(json);
    const easy3 = easyJson(json);

    easy2.$deepAssign({
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"] }
    });

    easy3.$deepAssign({
      f: 33,
      c: [2, 3, 4],
      d: { e: ["hello"], g: 3 }
    });

    expect(easy.$getValue()).to.eql(json);
    expect(easy.$equals(json)).to.be.true;

    expect(easy.$equals(easy2.$getValue())).to.be.false;
    expect(easy2.$equals(easy.$getValue())).to.be.false;

    expect(easy.$equals(easy3.$getValue())).to.be.false;
    expect(easy3.$equals(easy.$getValue())).to.be.false;
  });

  it("includes", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);
    const easy2 = easyJson(json);

    easy2.$deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.$includes(easy2.$getValue())).to.be.false;
    expect(easy2.$includes(easy.$getValue())).to.be.true;
  });

  it("isIncluded", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);
    const easy2 = easyJson(json);

    easy2.$deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.$isIncluded(easy2.$getValue())).to.be.true;
    expect(easy2.$isIncluded(easy.$getValue())).to.be.false;
  });

  it("Direct access: getting", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);

    expect(easy.a).to.equal(1);
    expect(easy.b).to.be.true;
    expect(easy.c).to.eql([2, 3, 4]);
    expect(easy.c[1]).to.equal(3);
    expect(easy.d).to.eql({ e: ["hello"] });
    expect(easy.d.e).to.eql(["hello"]);
    expect(easy.d.e[0]).to.eql("hello");
  });

  it("Direct access: setting", (): void => {
    const json: JsonMap = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);

    easy.a = 2;
    easy.b = false;
    easy.c = [1, 2, 3, 4, 5];
    easy.c[1] = 4;
    easy.d = { e: ["bye", "bye"], f: "u", g: "v" };
    easy.d.e = ["blah", "blah", "blah", "blah"];
    easy.d.e[0] = "foo";

    json.a = 3;
    json.b = 42;
    json.c = [1, 2, 3];
    json.c[1] = 8;
    json.d = { e: ["bye2", "bye2", "bye2"], f: "u2" };
    json.d.e = ["blah2", "blah2"];
    json.d.e[0] = "foo2";

    expect(easy.a).to.equal(2);
    expect(easy.b).to.be.false;
    expect(easy.c).to.eql([1, 4, 3, 4, 5]);
    expect(easy.c[1]).to.equal(4);
    expect(easy.d).to.eql({
      e: ["foo", "blah", "blah", "blah"],
      f: "u",
      g: "v"
    });
    expect(easy.d.e).to.eql(["foo", "blah", "blah", "blah"]);
    expect(easy.d.e[0]).to.eql("foo");

    // Original object is not proxied
    expect(json.a).to.equal(3);
    expect(json.b).to.equal(42);
    expect(json.c).to.eql([1, 8, 3]);
    expect(json.c[1]).to.equal(8);
    expect(json.d).to.eql({ e: ["foo2", "blah2"], f: "u2" });
    expect(json.d.e).to.eql(["foo2", "blah2"]);
    expect(json.d.e[0]).to.eql("foo2");

    easy.$deepAssign(json);

    // But easy object is proxied recursively for every property
    expect(easy.a).to.equal(3);
    expect(easy.b).to.equal(42);
    expect(easy.c).to.eql([1, 8, 3, 4, 5]);
    expect(easy.c[1]).to.equal(8);
    expect(easy.d).to.eql({
      e: ["foo2", "blah2", "blah", "blah"],
      f: "u2",
      g: "v"
    });
    expect(easy.d.e).to.eql(["foo2", "blah2", "blah", "blah"]);
    expect(easy.d.e[0]).to.eql("foo2");
  });
});
