import path from "path";

export interface RelocatedDeps {
  [relDir: string]: {
    [depDir: string]: string;
  };
}

export interface RemappedRelocatedDeps {
  [depDir: string]: {
    [relDir: string]: string;
  };
}

export default class Relocator {
  public readonly packageDir: string;
  public readonly remappedRelocatedDeps: RemappedRelocatedDeps;

  public constructor(relocatedDeps: RelocatedDeps, packageDir: string) {
    this.packageDir = packageDir;

    const remappedRelocatedDeps: RemappedRelocatedDeps = {};
    this.remappedRelocatedDeps = remappedRelocatedDeps;

    for (const relDir of Object.keys(relocatedDeps)) {
      for (const depDir of Object.keys(relocatedDeps[relDir])) {
        if (!remappedRelocatedDeps[depDir]) {
          remappedRelocatedDeps[depDir] = {};
        }

        remappedRelocatedDeps[depDir][relDir] = relocatedDeps[relDir][depDir];
      }
    }
  }

  public relocate(dep: string, dir: string): string {
    const relDir = path.relative(this.packageDir, dir);
    const depDir = path.dirname(dep);
    const relDirMap = this.remappedRelocatedDeps[depDir];

    if (relDirMap) {
      const relocatedRelDir = relDirMap[relDir];

      if (relocatedRelDir) {
        return path.join(this.packageDir, relocatedRelDir, path.basename(dep));
      }
    }

    return path.join(dir, dep);
  }
}
