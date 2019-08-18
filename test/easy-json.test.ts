import { JsonMap, JsonArray } from "../src/easy-json/json";
import { EasyMap, EasyArray, AnyArray } from "../src/easy-json/easy";
import easyJson from "../src/easy-json";
import { expect } from "chai";

describe("Testint EasyJson", (): void => {
  it("Creating Map", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);

    expect(easy).to.eql(json);
  });

  it("Creating Array", (): void => {
    const json = [1, true, [2, 3, 4], { e: ["hello"] }];
    const easy = easyJson(json);

    expect(easy).to.eql(json);
  });

  it("Deeply assigning Map", (): void => {
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

    const easy = easyJson(json1) as EasyMap;
    easy.$deepAssign(json2);

    expect(easy).to.eql(json3);
  });

  it("Deeply assigning Array", (): void => {
    const json1: JsonArray = [
      1,
      true,
      [2, 3, 4],
      { e: ["hello", "bye"] },
      { a: { b: { c: { d: [{ e: [{ f: 4, u: 2 }, 14] }, 15] } } }, z: [5] }
    ];

    const json2: JsonArray = [
      1,
      { e: 7, f: ["foo"] },
      [3, 4],
      { e: ["bye"], f: 21 },
      { a: { b: { c: { d: [{ e: [{ f: "changed" }] }] } } }, x: true },
      42
    ];

    const json3: JsonArray = [
      1,
      { e: 7, f: ["foo"] },
      [3, 4, 4],
      { e: ["bye", "bye"], f: 21 },
      {
        a: { b: { c: { d: [{ e: [{ f: "changed", u: 2 }, 14] }, 15] } } },
        z: [5],
        x: true
      },
      42
    ];

    const easy = easyJson(json1) as EasyMap;
    easy.$deepAssign(json2);

    expect(easy).to.eql(json3);
  });

  it("Deeply cloning Map", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json);
    const easy2 = easy.$deepClone();

    expect(easy2).to.eql(json);
    expect(easy2).not.to.equal(easy);
  });

  it("Deeply cloning Array", (): void => {
    const json = [1, true, [2, 3, 4], { e: ["hello"] }];
    const easy = easyJson(json);
    const easy2 = easy.$deepClone();

    expect(easy2).to.eql(json);
    expect(easy2).not.to.equal(easy);
  });

  it("equals Map", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json) as EasyMap;
    const easy2 = easyJson(json) as EasyMap;
    const easy3 = easyJson(json) as EasyMap;

    easy2.$deepAssign({
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"] }
    });

    easy3.$deepAssign({
      f: 33,
      c: [2, 3, 4],
      d: { e: ["hello"], g: 3 }
    });

    expect(easy).to.eql(json);
    expect(easy.$equals(json)).to.be.true;

    expect(easy.$equals(easy2)).to.be.false;
    expect(easy2.$equals(easy)).to.be.false;

    expect(easy.$equals(easy3)).to.be.false;
    expect(easy3.$equals(easy)).to.be.false;
  });

  it("equals Array", (): void => {
    const json = [1, true, [2, 3, 4], { e: ["hello"] }];
    const easy = easyJson(json) as EasyMap;
    const easy2 = easyJson(json) as EasyMap;
    const easy3 = easyJson(json) as EasyMap;

    easy2.$deepAssign([1, true, [2, 3, 4, 5, 6], { e: ["hello", "bye"] }]);
    easy3.$deepAssign([1, true, [2, 3, 4], { e: ["hello"], g: 3 }, 33]);

    expect(easy).to.eql(json);
    expect(easy.$equals(json)).to.be.true;

    expect(easy.$equals(easy2)).to.be.false;
    expect(easy2.$equals(easy)).to.be.false;

    expect(easy.$equals(easy3)).to.be.false;
    expect(easy3.$equals(easy)).to.be.false;
  });

  it("includes Map", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json) as EasyMap;
    const easy2 = easyJson(json) as EasyMap;

    easy2.$deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.$includes(easy2)).to.be.false;
    expect(easy2.$includes(easy)).to.be.true;
  });

  it("includes Array", (): void => {
    const json = [1, true, [2, 3, 4], { e: ["hello"] }];
    const easy = easyJson(json) as EasyMap;
    const easy2 = easyJson(json) as EasyMap;

    easy2.$deepAssign([
      1,
      true,
      [2, 3, 4, 5, 6],
      { e: ["hello", "bye"], g: 3 },
      33
    ]);

    expect(easy.$includes(easy2)).to.be.false;
    expect(easy2.$includes(easy)).to.be.true;
  });

  it("isIncluded Map", (): void => {
    const json = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json) as EasyMap;
    const easy2 = easyJson(json) as EasyMap;

    easy2.$deepAssign({
      f: 33,
      c: [2, 3, 4, 5, 6],
      d: { e: ["hello", "bye"], g: 3 }
    });

    expect(easy.$isIncluded(easy2)).to.be.true;
    expect(easy2.$isIncluded(easy)).to.be.false;
  });

  it("isIncluded Array", (): void => {
    const json = [1, true, [2, 3, 4], { e: ["hello"] }];
    const easy = easyJson(json) as EasyMap;
    const easy2 = easyJson(json) as EasyMap;

    easy2.$deepAssign([
      1,
      true,
      [2, 3, 4, 5, 6],
      { e: ["hello", "bye"], g: 3 },
      33
    ]);

    expect(easy.$isIncluded(easy2)).to.be.true;
    expect(easy2.$isIncluded(easy)).to.be.false;
  });

  it("Direct access Map: getting", (): void => {
    const json: JsonMap = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy: EasyMap = easyJson(json);

    expect(easy.a).to.equal(1);
    expect(easy.b).to.be.true;
    expect(easy.c).to.eql([2, 3, 4]);
    expect(easy.c[1]).to.equal(3);
    expect(easy.d).to.eql({ e: ["hello"] });
    expect(easy.d.e).to.eql(["hello"]);
    expect(easy.d.e[0]).to.eql("hello");
  });

  it("Direct access Array: getting", (): void => {
    const json: JsonArray = [1, true, [2, 3, 4], { e: ["hello"] }];
    const easy = easyJson(json) as EasyArray;

    expect(easy[0]).to.equal(1);
    expect(easy[1]).to.be.true;
    expect(easy[2]).to.eql([2, 3, 4]);
    expect(easy[2][1]).to.equal(3);
    expect(easy[3]).to.eql({ e: ["hello"] });
    expect(easy[3].e).to.eql(["hello"]);
    expect(easy[3].e[0]).to.eql("hello");
  });

  it("Direct access Map: setting", (): void => {
    const json: JsonMap = { a: 1, b: true, c: [2, 3, 4], d: { e: ["hello"] } };
    const easy = easyJson(json) as EasyMap;

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

  it("Direct access Array: setting", (): void => {
    const json: AnyArray = [1, true, [2, 3, 4], { e: ["hello"] }];
    const easy = easyJson(json) as EasyArray;

    easy[0] = 2;
    easy[1] = false;
    easy[2] = [1, 2, 3, 4, 5];
    easy[2][1] = 4;
    easy[3] = { e: ["bye", "bye"], f: "u", g: "v" };
    easy[3].e = ["blah", "blah", "blah", "blah"];
    easy[3].e[0] = "foo";

    json[0] = 3;
    json[1] = 42;
    json[2] = [1, 2, 3];
    json[2][1] = 8;
    json[3] = { e: ["bye2", "bye2", "bye2"], f: "u2" };
    json[3].e = ["blah2", "blah2"];
    json[3].e[0] = "foo2";

    expect(easy[0]).to.equal(2);
    expect(easy[1]).to.be.false;
    expect(easy[2]).to.eql([1, 4, 3, 4, 5]);
    expect(easy[2][1]).to.equal(4);
    expect(easy[3]).to.eql({
      e: ["foo", "blah", "blah", "blah"],
      f: "u",
      g: "v"
    });
    expect(easy[3].e).to.eql(["foo", "blah", "blah", "blah"]);
    expect(easy[3].e[0]).to.eql("foo");

    // Original object is not proxied
    expect(json[0]).to.equal(3);
    expect(json[1]).to.equal(42);
    expect(json[2]).to.eql([1, 8, 3]);
    expect(json[2][1]).to.equal(8);
    expect(json[3]).to.eql({ e: ["foo2", "blah2"], f: "u2" });
    expect(json[3].e).to.eql(["foo2", "blah2"]);
    expect(json[3].e[0]).to.eql("foo2");

    easy.$deepAssign(json);

    // But easy object is proxied recursively for every property
    expect(easy[0]).to.equal(3);
    expect(easy[1]).to.equal(42);
    expect(easy[2]).to.eql([1, 8, 3, 4, 5]);
    expect(easy[2][1]).to.equal(8);
    expect(easy[3]).to.eql({
      e: ["foo2", "blah2", "blah", "blah"],
      f: "u2",
      g: "v"
    });
    expect(easy[3].e).to.eql(["foo2", "blah2", "blah", "blah"]);
    expect(easy[3].e[0]).to.eql("foo2");
  });
});
