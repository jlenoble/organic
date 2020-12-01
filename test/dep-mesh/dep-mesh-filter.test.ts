import { expect } from "chai";
import DepMesh from "../../src/dep-mesh";
import { defaultOptions } from "./options";

describe("Testing class DepMesh", (): void => {
  it("filter", (): void => {
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

    expect([
      ...mesh.filter((link): boolean => link.name[0] === "c").keys(),
    ]).to.eql(["c1", "c2", "c3", "c4", "c5", "c6", "c7"]);

    expect([
      ...mesh
        .filter((link): boolean => link.name !== "p1" && link.name !== "c2")
        .keys(),
    ]).to.eql([
      "p4",
      "p7",
      "p5",
      "p6",
      "p2",
      "p3",
      "root",
      "c1",
      "c3",
      "c4",
      "c5",
      "c6",
      "c7",
    ]);
  });

  it("some/every", (): void => {
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

    expect(mesh.some((link): boolean => link.name[0] === "c")).to.be.true;
    expect(mesh.some((link): boolean => link.name[0] === "C")).to.be.false;
    expect(mesh.every((link): boolean => link.name[0] === "c")).to.be.false;
    expect(
      mesh.every(
        (link): boolean =>
          link.name[0] === "c" || link.name[0] === "p" || link.name === "root"
      )
    ).to.be.true;
  });
});
