import { expect } from "chai";
import { DepMeshLink } from "../src/dep-mesh";

describe("Testing class DepMeshLink", (): void => {
  it("Testing hasParent(name)", (): void => {
    const mesh = new DepMeshLink({
      name: "root"
    });

    const p1 = mesh.addParent("p1");
    expect(mesh.hasParent("p1")).to.be.true;
    expect(p1.hasParent("root")).to.be.false;
  });

  it("Testing hasChild(name)", (): void => {
    const mesh = new DepMeshLink({
      name: "root"
    });

    const p1 = mesh.addChild("p1");
    expect(mesh.hasChild("p1")).to.be.true;
    expect(p1.hasChild("root")).to.be.false;
  });

  it("Testing hasAncestor(name)", (): void => {
    const mesh = new DepMeshLink({
      name: "root"
    });

    const p1 = mesh.addParent("p1");
    const p2 = p1.addParent("p2");
    expect(mesh.hasAncestor("p1")).to.be.true;
    expect(mesh.hasAncestor("p2")).to.be.true;
    expect(p1.hasAncestor("p2")).to.be.true;
    expect(p1.hasAncestor("root")).to.be.false;
    expect(p2.hasAncestor("p1")).to.be.false;
    expect(p2.hasAncestor("root")).to.be.false;
  });

  it("Testing hasDescendant(name)", (): void => {
    const mesh = new DepMeshLink({
      name: "root"
    });

    const p1 = mesh.addChild("p1");
    const p2 = p1.addChild("p2");
    expect(mesh.hasDescendant("p1")).to.be.true;
    expect(mesh.hasDescendant("p2")).to.be.true;
    expect(p1.hasDescendant("p2")).to.be.true;
    expect(p1.hasDescendant("root")).to.be.false;
    expect(p2.hasDescendant("p1")).to.be.false;
    expect(p2.hasDescendant("root")).to.be.false;
  });
});
