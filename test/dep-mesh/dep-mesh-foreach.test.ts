import { expect } from "chai";
import DepMesh, { DepMeshNode } from "../../src/dep-mesh";
import { defaultOptions } from "./options";

describe("Testing class DepMesh", (): void => {
  it("keys/values/entries generators", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh
    });

    const p1 = root.addParent({ name: "p1" });
    const p2 = root.addParent({ name: "p2" });
    const p3 = root.addParent({ name: "p3" });

    const p4 = p1.addParent({ name: "p4" });
    const p5 = p2.addParent({ name: "p5" });
    const p6 = p2.addParent({ name: "p6" });

    const p7 = p5.addParent({ name: "p7" });

    root.addParent({ name: "p4" }); // Already an ancestor
    p1.addParent({ name: "p7" }); // Mesh converges upstream

    const c1 = root.addChild({ name: "c1" });
    const c2 = root.addChild({ name: "c2" });
    const c3 = root.addChild({ name: "c3" });

    const c4 = p1.addChild({ name: "c4" });
    const c5 = p2.addChild({ name: "c5" });
    const c6 = p2.addChild({ name: "c6" });

    const c7 = p5.addChild({ name: "c7" });

    root.addChild({ name: "c4" }); // Already a descendant: ignore
    c1.addChild({ name: "c7" }); // Mesh converges downstream

    expect([...root.mesh.values()]).to.eql([
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

    expect([...root.mesh.keys()]).to.eql([
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

    expect([...root.mesh.entries()]).to.eql([
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

    expect([...root.mesh]).to.eql([
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

  it("forEach/map", (): void => {
    const mesh = new DepMesh(defaultOptions);

    mesh.addLink({ name: "root" }, { name: "p1" });
    mesh.addLink({ name: "root" }, { name: "p2" });
    mesh.addLink({ name: "root" }, { name: "p3" });
    mesh.addLink({ name: "p1" }, { name: "p4" });
    mesh.addLink({ name: "p2" }, { name: "p5" });
    mesh.addLink({ name: "p2" }, { name: "p6" });
    mesh.addLink({ name: "p5" }, { name: "p7" });
    mesh.addLink({ name: "root" }, { name: "p4" }); // Already an ancestor
    mesh.addLink({ name: "p1" }, { name: "p7" }); // Mesh converges upstream
    mesh.addLink({ name: "c1" }, { name: "root" });
    mesh.addLink({ name: "c2" }, { name: "root" });
    mesh.addLink({ name: "c3" }, { name: "root" });
    mesh.addLink({ name: "c4" }, { name: "c1" });
    mesh.addLink({ name: "c5" }, { name: "c2" });
    mesh.addLink({ name: "c6" }, { name: "c2" });
    mesh.addLink({ name: "c7" }, { name: "c5" });
    mesh.addLink({ name: "c4" }, { name: "root" }); // Already a descendant: ignore
    mesh.addLink({ name: "c7" }, { name: "c1" }); // Mesh converges downstream

    const refNames = [
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
    ];
    const names: string[] = [];

    mesh.forEach((link): void => {
      names.push(link.name);
    });

    expect(names).to.eql(refNames);
    expect(mesh.map((link): string => link.name)).to.eql(refNames);
  });
});
