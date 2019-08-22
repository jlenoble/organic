import { expect } from "chai";
import DepMesh, { DepMeshNode } from "../../src/dep-mesh";
import { defaultOptions } from "./options";

describe("Testing class DepMeshNode", (): void => {
  const mesh = new DepMesh(defaultOptions);
  it("Testing hasParent(name)", (): void => {
    const root = new DepMeshNode({
      name: "root",
      mesh
    });

    const p1 = root.addParent({ name: "p1" });
    expect(root.hasParent("p1")).to.be.true;
    expect(p1.hasParent("root")).to.be.false;
  });

  it("Testing hasChild(name)", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh
    });

    const p1 = root.addChild({ name: "p1" });
    expect(root.hasChild("p1")).to.be.true;
    expect(p1.hasChild("root")).to.be.false;
  });

  it("Testing hasAncestor(name)", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh
    });

    const p1 = root.addParent({ name: "p1" });
    const p2 = p1.addParent({ name: "p2" });
    expect(root.hasAncestor("p1")).to.be.true;
    expect(root.hasAncestor("p2")).to.be.true;
    expect(p1.hasAncestor("p2")).to.be.true;
    expect(p1.hasAncestor("root")).to.be.false;
    expect(p2.hasAncestor("p1")).to.be.false;
    expect(p2.hasAncestor("root")).to.be.false;
  });

  it("Testing hasDescendant(name)", (): void => {
    const mesh = new DepMesh(defaultOptions);
    const root = new DepMeshNode({
      name: "root",
      mesh
    });

    const p1 = root.addChild({ name: "p1" });
    const p2 = p1.addChild({ name: "p2" });
    expect(root.hasDescendant("p1")).to.be.true;
    expect(root.hasDescendant("p2")).to.be.true;
    expect(p1.hasDescendant("p2")).to.be.true;
    expect(p1.hasDescendant("root")).to.be.false;
    expect(p2.hasDescendant("p1")).to.be.false;
    expect(p2.hasDescendant("root")).to.be.false;
  });
});
