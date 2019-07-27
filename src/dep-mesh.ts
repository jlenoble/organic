export interface DepMeshOptions {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface DepMeshLinkOptions<T> extends DepMeshOptions {
  name: string;
  mesh?: DepMesh<T>;
}

function compare<T>(l1: DepMeshLink<T>, l2: DepMeshLink<T>): 1 | 0 | -1 {
  if (l1 === l2) {
    return 0;
  } else if (l1.getAncestor(l2.name) === l2) {
    return 1;
  } else if (l1.getDescendant(l2.name) === l2) {
    return -1;
  } else {
    return 0;
  }
}

export default class DepMesh<T> extends Map<string, DepMeshLink<T>> {
  public readonly options: DepMeshOptions;

  public *entries(): IterableIterator<[string, DepMeshLink<T>]> {
    for (const link of this.values()) {
      yield [link.name, link];
    }
  }

  public *keys(): IterableIterator<string> {
    for (const link of this.values()) {
      yield link.name;
    }
  }

  public *values(): IterableIterator<DepMeshLink<T>> {
    const exclude: WeakSet<DepMeshLink<T>> = new WeakSet();

    for (const link of super.values()) {
      let stop = false;

      while (!stop) {
        stop = true;

        for (const ancestor of link.firstAncestors(exclude)) {
          stop = false;

          exclude.add(ancestor);
          yield ancestor;
        }
      }
    }
  }

  public constructor(options: DepMeshOptions = {}) {
    super();
    this.options = options;
  }

  public addLink(name1: string, name2: string): this {
    let l1 = this.get(name1);

    if (!l1) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      l1 = new DepMeshLink({ ...this.options, name: name1, mesh: this });
    }

    l1.addParent(name2);

    return this;
  }

  public forEach(
    cb: (
      value: DepMeshLink<T>,
      key: string,
      map: Map<string, DepMeshLink<T>>
    ) => void,
    thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    for (const link of this.values()) {
      cb.call(thisArg, link, link.name, this);
    }
  }

  public map<U>(
    cb: (
      value: DepMeshLink<T>,
      key: string,
      map: Map<string, DepMeshLink<T>>
    ) => U,
    thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): U[] {
    const array: U[] = [];

    for (const link of this.values()) {
      array.push(cb.call(thisArg, link, link.name, this));
    }

    return array;
  }
}

export class DepMeshLink<T> {
  public readonly name: string;
  public readonly mesh: DepMesh<T>;
  public readonly options: DepMeshLinkOptions<T>;

  protected readonly _children: Set<DepMeshLink<T>> = new Set();
  protected readonly _parents: Set<DepMeshLink<T>> = new Set();

  public *depthFirstDescendants(
    exclude: WeakSet<DepMeshLink<T>> = new WeakSet()
  ): IterableIterator<DepMeshLink<T>> {
    for (const child of this._children.values()) {
      if (!exclude.has(child)) {
        exclude.add(child);
        yield child;
      }

      yield* child.depthFirstDescendants(exclude);
    }
  }

  public *depthFirstAncestors(
    exclude: WeakSet<DepMeshLink<T>> = new WeakSet()
  ): IterableIterator<DepMeshLink<T>> {
    for (const parent of this._parents.values()) {
      if (!exclude.has(parent)) {
        exclude.add(parent);
        yield parent;
      }

      yield* parent.depthFirstAncestors(exclude);
    }
  }

  public *children(): IterableIterator<DepMeshLink<T>> {
    yield* [...this._children].sort(compare);
  }

  public *parents(): IterableIterator<DepMeshLink<T>> {
    yield* [...this._parents].sort(compare);
  }

  public *descendants(): IterableIterator<DepMeshLink<T>> {
    yield* [...this.depthFirstDescendants()].sort(compare);
  }

  public *ancestors(): IterableIterator<DepMeshLink<T>> {
    yield* [...this.depthFirstAncestors()].sort(compare);
  }

  public *lastDescendants(
    exclude: WeakSet<DepMeshLink<T>> = new WeakSet()
  ): IterableIterator<DepMeshLink<T>> {
    if (this.isLastDescendant() || this.allChildrenAreExcluded(exclude)) {
      if (!exclude.has(this)) {
        yield this;
      }
      return;
    }

    for (const descendant of this.descendants()) {
      if (
        descendant.isLastDescendant() ||
        descendant.allChildrenAreExcluded(exclude)
      ) {
        if (!exclude.has(descendant)) {
          yield descendant;
        }
      }
    }
  }

  public *firstAncestors(
    exclude: WeakSet<DepMeshLink<T>> = new WeakSet()
  ): IterableIterator<DepMeshLink<T>> {
    if (this.isFirstAncestor() || this.allParentsAreExcluded(exclude)) {
      if (!exclude.has(this)) {
        yield this;
      }
      return;
    }

    for (const ancestor of this.ancestors()) {
      if (
        ancestor.isFirstAncestor() ||
        ancestor.allParentsAreExcluded(exclude)
      ) {
        if (!exclude.has(ancestor)) {
          yield ancestor;
        }
      }
    }
  }

  public *childNames(): IterableIterator<string> {
    for (const child of this.children()) {
      yield child.name;
    }
  }

  public *parentNames(): IterableIterator<string> {
    for (const parent of this.parents()) {
      yield parent.name;
    }
  }

  public *descendantNames(): IterableIterator<string> {
    for (const descendant of this.descendants()) {
      yield descendant.name;
    }
  }

  public *firstAncestorNames(): IterableIterator<string> {
    for (const ancestor of this.firstAncestors()) {
      yield ancestor.name;
    }
  }

  public *lastDescendantNames(): IterableIterator<string> {
    for (const descendant of this.lastDescendants()) {
      yield descendant.name;
    }
  }

  public *ancestorNames(): IterableIterator<string> {
    for (const ancestor of this.ancestors()) {
      yield ancestor.name;
    }
  }

  public constructor(options: DepMeshLinkOptions<T>) {
    this.name = options.name;
    this.mesh = options.mesh || new DepMesh();
    this.options = options;

    if (this.mesh.has(this.name)) {
      return this.mesh.get(this.name) as DepMeshLink<T>;
    }

    this.mesh.set(this.name, this);
  }

  public addChild(name: string): DepMeshLink<T> {
    let link = this.getDescendant(name);

    // No need to add if a descendant already has name as child
    if (!link) {
      link = this.mesh.get(name);

      if (!link) {
        link = new DepMeshLink({ ...this.options, name, mesh: this.mesh });
      } else {
        // DepMeshLink already defined; Prevent circularity
        if (this.hasAncestor(name)) {
          throw new Error(
            `Cannot add ${name} as child to ${this.name} as it is already an ancestor`
          );
        }
      }

      this._children.add(link);
      link._parents.add(this);
    }

    return link;
  }

  public addParent(name: string): DepMeshLink<T> {
    let link = this.getAncestor(name);

    // No need to add if an ancestor already has name as parent
    if (!link) {
      link = this.mesh.get(name);

      if (!link) {
        link = new DepMeshLink({ ...this.options, name, mesh: this.mesh });
      } else {
        // DepMeshLink already defined; Prevent circularity
        if (this.hasDescendant(name)) {
          throw new Error(
            `Cannot add ${name} as parent to ${this.name} as it is already a descendant`
          );
        }
      }

      this._parents.add(link);
      link._children.add(this);
    }

    return link;
  }

  public isLastDescendant(): boolean {
    return !this._children.size;
  }

  public isFirstAncestor(): boolean {
    return !this._parents.size;
  }

  public allChildrenAreExcluded(exclude: WeakSet<DepMeshLink<T>>): boolean {
    return Array.from(this._children).every((link): boolean =>
      exclude.has(link)
    );
  }

  public allParentsAreExcluded(exclude: WeakSet<DepMeshLink<T>>): boolean {
    return Array.from(this._parents).every((link): boolean =>
      exclude.has(link)
    );
  }

  public hasChild(name: string): boolean {
    return Array.from(this._children).some((child): boolean => {
      return child.name === name;
    });
  }

  public hasParent(name: string): boolean {
    return Array.from(this._parents).some((parent): boolean => {
      return parent.name === name;
    });
  }

  public hasDescendant(name: string): boolean {
    return (
      this.hasChild(name) ||
      Array.from(this._children).some((child): boolean =>
        child.hasDescendant(name)
      )
    );
  }

  public hasAncestor(name: string): boolean {
    return (
      this.hasParent(name) ||
      Array.from(this._parents).some((parent): boolean =>
        parent.hasAncestor(name)
      )
    );
  }

  public getChild(name: string): DepMeshLink<T> | undefined {
    let result: DepMeshLink<T> | undefined;

    Array.from(this._children).some((child): boolean => {
      if (child.name === name) {
        result = child;
        return true;
      }

      return false;
    });

    return result;
  }

  public getParent(name: string): DepMeshLink<T> | undefined {
    let result: DepMeshLink<T> | undefined;

    Array.from(this._parents).some((parent): boolean => {
      if (parent.name === name) {
        result = parent;
        return true;
      }

      return false;
    });

    return result;
  }

  public getDescendant(name: string): DepMeshLink<T> | undefined {
    let result = this.getChild(name);

    if (!result) {
      Array.from(this._children).some((child): boolean => {
        result = child.getDescendant(name);
        return !!result;
      });
    }

    return result;
  }

  public getAncestor(name: string): DepMeshLink<T> | undefined {
    let result = this.getParent(name);

    if (!result) {
      Array.from(this._parents).some((parent): boolean => {
        result = parent.getAncestor(name);
        return !!result;
      });
    }

    return result;
  }
}
