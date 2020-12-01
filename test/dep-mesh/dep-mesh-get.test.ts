import { expect } from "chai";
import DepMesh, { DepMeshNode } from "../../src/dep-mesh";
import { defaultOptions } from "./options";

describe("Testing class DepMeshNode", (): void => {
  it("Testing getParent(name)", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh,
    });

    const p1 = root.addParent({ name: "p1" });
    expect(root.getParent("p1")).to.equal(p1);
    expect(p1.getParent("root")).to.be.undefined;
  });

  it("Testing getChild(name)", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh,
    });

    const p1 = root.addChild({ name: "p1" });
    expect(root.getChild("p1")).to.equal(p1);
    expect(p1.getChild("root")).to.be.undefined;
  });

  it("Testing getAncestor(name)", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh,
    });

    const p1 = root.addParent({ name: "p1" });
    const p2 = p1.addParent({ name: "p2" });
    expect(root.getAncestor("p1")).to.equal(p1);
    expect(root.getAncestor("p2")).to.equal(p2);
    expect(p1.getAncestor("p2")).to.equal(p2);
    expect(p1.getAncestor("root")).to.be.undefined;
    expect(p2.getAncestor("p1")).to.be.undefined;
    expect(p2.getAncestor("root")).to.be.undefined;
  });

  it("Testing getDescendant(name)", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh,
    });

    const p1 = root.addChild({ name: "p1" });
    const p2 = p1.addChild({ name: "p2" });
    expect(root.getDescendant("p1")).to.equal(p1);
    expect(root.getDescendant("p2")).to.equal(p2);
    expect(p1.getDescendant("p2")).to.equal(p2);
    expect(p1.getDescendant("root")).to.be.undefined;
    expect(p2.getDescendant("p1")).to.be.undefined;
    expect(p2.getDescendant("root")).to.be.undefined;
  });
});
