import { expect } from "chai";
import DepMesh from "../src/dep-mesh";

describe("Testing class DepMesh", (): void => {
  it("Testing getParent(name)", (): void => {
    const mesh = new DepMesh({
      name: "root"
    });

    const p1 = mesh.addParent("p1");
    expect(mesh.getParent("p1")).to.equal(p1);
    expect(p1.getParent("root")).to.be.undefined;
  });

  it("Testing getChild(name)", (): void => {
    const mesh = new DepMesh({
      name: "root"
    });

    const p1 = mesh.addChild("p1");
    expect(mesh.getChild("p1")).to.equal(p1);
    expect(p1.getChild("root")).to.be.undefined;
  });

  it("Testing getAncestor(name)", (): void => {
    const mesh = new DepMesh({
      name: "root"
    });

    const p1 = mesh.addParent("p1");
    const p2 = p1.addParent("p2");
    expect(mesh.getAncestor("p1")).to.equal(p1);
    expect(mesh.getAncestor("p2")).to.equal(p2);
    expect(p1.getAncestor("p2")).to.equal(p2);
    expect(p1.getAncestor("root")).to.be.undefined;
    expect(p2.getAncestor("p1")).to.be.undefined;
    expect(p2.getAncestor("root")).to.be.undefined;
  });

  it("Testing getDescendant(name)", (): void => {
    const mesh = new DepMesh({
      name: "root"
    });

    const p1 = mesh.addChild("p1");
    const p2 = p1.addChild("p2");
    expect(mesh.getDescendant("p1")).to.equal(p1);
    expect(mesh.getDescendant("p2")).to.equal(p2);
    expect(p1.getDescendant("p2")).to.equal(p2);
    expect(p1.getDescendant("root")).to.be.undefined;
    expect(p2.getDescendant("p1")).to.be.undefined;
    expect(p2.getDescendant("root")).to.be.undefined;
  });
});
