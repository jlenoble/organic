import { expect } from "chai";
import DepMesh from "../src/dep-mesh";

describe("Testing class DepMesh", (): void => {
  it("forEach", (): void => {
    const root = new DepMesh({
      name: "root"
    });

    const p1 = root.addParent("p1");
    const p2 = root.addParent("p2");
    const p3 = root.addParent("p3");

    const p4 = p1.addParent("p4");
    const p5 = p2.addParent("p5");
    const p6 = p2.addParent("p6");

    const p7 = p5.addParent("p7");

    root.addParent("p4"); // Already an ancestor
    p1.addParent("p7"); // Mesh converges upstream

    const c1 = root.addChild("c1");
    const c2 = root.addChild("c2");
    const c3 = root.addChild("c3");

    const c4 = p1.addChild("c4");
    const c5 = p2.addChild("c5");
    const c6 = p2.addChild("c6");

    const c7 = p5.addChild("c7");

    root.addChild("c4"); // Already a descendant: ignore
    p1.addChild("c7"); // Mesh converges downstream

    expect([...root.links.values()]).to.eql([
      p4,
      p7,
      p1,
      p5,
      p6,
      p2,
      p3,
      root,
      c1,
      c2,
      c3,
      c4,
      c5,
      c6,
      c7
    ]);

    expect([...root.links.keys()]).to.eql([
      "p4",
      "p7",
      "p1",
      "p5",
      "p6",
      "p2",
      "p3",
      "root",
      "c1",
      "c2",
      "c3",
      "c4",
      "c5",
      "c6",
      "c7"
    ]);

    expect([...root.links.entries()]).to.eql([
      ["p4", p4],
      ["p7", p7],
      ["p1", p1],
      ["p5", p5],
      ["p6", p6],
      ["p2", p2],
      ["p3", p3],
      ["root", root],
      ["c1", c1],
      ["c2", c2],
      ["c3", c3],
      ["c4", c4],
      ["c5", c5],
      ["c6", c6],
      ["c7", c7]
    ]);
  });
});
