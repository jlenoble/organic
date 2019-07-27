import { expect } from "chai";
import { DepMeshLink } from "../src/dep-mesh";

describe("Testing class DepMeshLink", (): void => {
  it("Unshared parents", (): void => {
    const mesh = new DepMeshLink({
      name: "root"
    });

    const p1 = mesh.addParent({ name: "p1" });
    const p2 = mesh.addParent({ name: "p2" });
    const p3 = mesh.addParent({ name: "p3" });

    const p4 = p1.addParent({ name: "p4" });
    const p5 = p2.addParent({ name: "p5" });
    const p6 = p2.addParent({ name: "p6" });

    const p7 = p5.addParent({ name: "p7" });

    expect([...mesh.childNames()]).to.eql([]);
    expect([...p1.childNames()]).to.eql(["root"]);
    expect([...p2.childNames()]).to.eql(["root"]);
    expect([...p3.childNames()]).to.eql(["root"]);
    expect([...p4.childNames()]).to.eql(["p1"]);
    expect([...p5.childNames()]).to.eql(["p2"]);
    expect([...p6.childNames()]).to.eql(["p2"]);
    expect([...p7.childNames()]).to.eql(["p5"]);

    expect([...mesh.parentNames()]).to.eql(["p1", "p2", "p3"]);
    expect([...p1.parentNames()]).to.eql(["p4"]);
    expect([...p2.parentNames()]).to.eql(["p5", "p6"]);
    expect([...p3.parentNames()]).to.eql([]);
    expect([...p4.parentNames()]).to.eql([]);
    expect([...p5.parentNames()]).to.eql(["p7"]);
    expect([...p6.parentNames()]).to.eql([]);
    expect([...p7.parentNames()]).to.eql([]);

    expect([...mesh.descendantNames()]).to.eql([]);
    expect([...p1.descendantNames()]).to.eql(["root"]);
    expect([...p2.descendantNames()]).to.eql(["root"]);
    expect([...p3.descendantNames()]).to.eql(["root"]);
    expect([...p4.descendantNames()]).to.eql(["p1", "root"]);
    expect([...p5.descendantNames()]).to.eql(["p2", "root"]);
    expect([...p6.descendantNames()]).to.eql(["p2", "root"]);
    expect([...p7.descendantNames()]).to.eql(["p5", "p2", "root"]);

    expect([...mesh.ancestorNames()]).to.eql([
      "p4",
      "p1",
      "p7",
      "p5",
      "p6",
      "p2",
      "p3"
    ]);
    expect([...p1.ancestorNames()]).to.eql(["p4"]);
    expect([...p2.ancestorNames()]).to.eql(["p7", "p5", "p6"]);
    expect([...p3.ancestorNames()]).to.eql([]);
    expect([...p4.ancestorNames()]).to.eql([]);
    expect([...p5.ancestorNames()]).to.eql(["p7"]);
    expect([...p6.ancestorNames()]).to.eql([]);
    expect([...p7.ancestorNames()]).to.eql([]);

    expect([...mesh.lastDescendantNames()]).to.eql(["root"]);
    expect([...p1.lastDescendantNames()]).to.eql(["root"]);
    expect([...p2.lastDescendantNames()]).to.eql(["root"]);
    expect([...p3.lastDescendantNames()]).to.eql(["root"]);
    expect([...p4.lastDescendantNames()]).to.eql(["root"]);
    expect([...p5.lastDescendantNames()]).to.eql(["root"]);
    expect([...p6.lastDescendantNames()]).to.eql(["root"]);
    expect([...p7.lastDescendantNames()]).to.eql(["root"]);

    expect([...mesh.firstAncestorNames()]).to.eql(["p4", "p7", "p6", "p3"]);
    expect([...p1.firstAncestorNames()]).to.eql(["p4"]);
    expect([...p2.firstAncestorNames()]).to.eql(["p7", "p6"]);
    expect([...p3.firstAncestorNames()]).to.eql(["p3"]);
    expect([...p4.firstAncestorNames()]).to.eql(["p4"]);
    expect([...p5.firstAncestorNames()]).to.eql(["p7"]);
    expect([...p6.firstAncestorNames()]).to.eql(["p6"]);
    expect([...p7.firstAncestorNames()]).to.eql(["p7"]);
  });

  it("Unshared children", (): void => {
    const mesh = new DepMeshLink({
      name: "root"
    });

    const p1 = mesh.addChild({ name: "p1" });
    const p2 = mesh.addChild({ name: "p2" });
    const p3 = mesh.addChild({ name: "p3" });

    const p4 = p1.addChild({ name: "p4" });
    const p5 = p2.addChild({ name: "p5" });
    const p6 = p2.addChild({ name: "p6" });

    const p7 = p5.addChild({ name: "p7" });

    expect([...mesh.parentNames()]).to.eql([]);
    expect([...p1.parentNames()]).to.eql(["root"]);
    expect([...p2.parentNames()]).to.eql(["root"]);
    expect([...p3.parentNames()]).to.eql(["root"]);
    expect([...p4.parentNames()]).to.eql(["p1"]);
    expect([...p5.parentNames()]).to.eql(["p2"]);
    expect([...p6.parentNames()]).to.eql(["p2"]);
    expect([...p7.parentNames()]).to.eql(["p5"]);

    expect([...mesh.childNames()]).to.eql(["p1", "p2", "p3"]);
    expect([...p1.childNames()]).to.eql(["p4"]);
    expect([...p2.childNames()]).to.eql(["p5", "p6"]);
    expect([...p3.childNames()]).to.eql([]);
    expect([...p4.childNames()]).to.eql([]);
    expect([...p5.childNames()]).to.eql(["p7"]);
    expect([...p6.childNames()]).to.eql([]);
    expect([...p7.childNames()]).to.eql([]);

    expect([...mesh.ancestorNames()]).to.eql([]);
    expect([...p1.ancestorNames()]).to.eql(["root"]);
    expect([...p2.ancestorNames()]).to.eql(["root"]);
    expect([...p3.ancestorNames()]).to.eql(["root"]);
    expect([...p4.ancestorNames()]).to.eql(["root", "p1"]);
    expect([...p5.ancestorNames()]).to.eql(["root", "p2"]);
    expect([...p6.ancestorNames()]).to.eql(["root", "p2"]);
    expect([...p7.ancestorNames()]).to.eql(["root", "p2", "p5"]);

    expect([...mesh.descendantNames()]).to.eql([
      "p1",
      "p4",
      "p2",
      "p5",
      "p7",
      "p6",
      "p3"
    ]);
    expect([...p1.descendantNames()]).to.eql(["p4"]);
    expect([...p2.descendantNames()]).to.eql(["p5", "p7", "p6"]);
    expect([...p3.descendantNames()]).to.eql([]);
    expect([...p4.descendantNames()]).to.eql([]);
    expect([...p5.descendantNames()]).to.eql(["p7"]);
    expect([...p6.descendantNames()]).to.eql([]);
    expect([...p7.descendantNames()]).to.eql([]);

    expect([...mesh.firstAncestorNames()]).to.eql(["root"]);
    expect([...p1.firstAncestorNames()]).to.eql(["root"]);
    expect([...p2.firstAncestorNames()]).to.eql(["root"]);
    expect([...p3.firstAncestorNames()]).to.eql(["root"]);
    expect([...p4.firstAncestorNames()]).to.eql(["root"]);
    expect([...p5.firstAncestorNames()]).to.eql(["root"]);
    expect([...p6.firstAncestorNames()]).to.eql(["root"]);
    expect([...p7.firstAncestorNames()]).to.eql(["root"]);

    expect([...mesh.lastDescendantNames()]).to.eql(["p4", "p7", "p6", "p3"]);
    expect([...p1.lastDescendantNames()]).to.eql(["p4"]);
    expect([...p2.lastDescendantNames()]).to.eql(["p7", "p6"]);
    expect([...p3.lastDescendantNames()]).to.eql(["p3"]);
    expect([...p4.lastDescendantNames()]).to.eql(["p4"]);
    expect([...p5.lastDescendantNames()]).to.eql(["p7"]);
    expect([...p6.lastDescendantNames()]).to.eql(["p6"]);
    expect([...p7.lastDescendantNames()]).to.eql(["p7"]);
  });
});
