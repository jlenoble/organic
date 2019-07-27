export interface DepMeshOptions<T> {
  create: (options: DepMeshNodeOptions<T>) => T;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface DepMeshNodeOptions<T> {
  name: string;
  value?: T;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface DepMeshNodeCtorOptions<T> extends DepMeshNodeOptions<T> {
  mesh: DepMesh<T>;
}

function compare<T>(l1: DepMeshNode<T>, l2: DepMeshNode<T>): 1 | 0 | -1 {
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

export default class DepMesh<T> extends Map<string, DepMeshNode<T>> {
  public readonly options: DepMeshOptions<T>;

  public [Symbol.iterator](): IterableIterator<[string, DepMeshNode<T>]> {
    return this.entries();
  }

  public *entries(): IterableIterator<[string, DepMeshNode<T>]> {
    for (const link of this.values()) {
      yield [link.name, link];
    }
  }

  public *keys(): IterableIterator<string> {
    for (const link of this.values()) {
      yield link.name;
    }
  }

  public *values(): IterableIterator<DepMeshNode<T>> {
    const exclude: WeakSet<DepMeshNode<T>> = new WeakSet();

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

  public constructor(options: DepMeshOptions<T>) {
    super();
    this.options = options;
  }

  public addLink(
    options1: DepMeshNodeOptions<T>,
    options2: DepMeshNodeOptions<T>
  ): this {
    let l1 = this.get(options1.name);

    if (!l1) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      l1 = new DepMeshNode({ ...this.options, ...options1, mesh: this });
    }

    l1.addParent(options2);

    return this;
  }

  public forEach(
    cb: (
      value: DepMeshNode<T>,
      key: string,
      map: Map<string, DepMeshNode<T>>
    ) => void,
    thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    for (const link of this.values()) {
      cb.call(thisArg, link, link.name, this);
    }
  }

  public map<U>(
    cb: (
      value: DepMeshNode<T>,
      key: string,
      map: Map<string, DepMeshNode<T>>
    ) => U,
    thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): U[] {
    const array: U[] = [];

    for (const link of this.values()) {
      array.push(cb.call(thisArg, link, link.name, this));
    }

    return array;
  }

  public filter(
    cb: (
      value: DepMeshNode<T>,
      key: string,
      map: Map<string, DepMeshNode<T>>
    ) => boolean,
    thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): DepMesh<T> {
    const mesh: DepMesh<T> = new DepMesh(this.options);
    const tested = new WeakMap();

    for (const node0 of this.values()) {
      if (!tested.has(node0)) {
        tested.set(node0, cb.call(thisArg, node0, node0.name, this));
      }

      if (tested.get(node0)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const node = new DepMeshNode({
          ...this.options,
          ...node0.options,
          mesh
        });

        for (const parent of node0.parents()) {
          if (!tested.has(parent)) {
            tested.set(parent, cb.call(thisArg, parent, parent.name, this));
          }

          if (tested.get(parent)) {
            node.addParent(parent.options);
          }
        }
      }
    }

    return mesh;
  }

  public some(
    cb: (
      value: DepMeshNode<T>,
      key: string,
      map: Map<string, DepMeshNode<T>>
    ) => boolean,
    thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): boolean {
    for (const node of this.values()) {
      if (cb.call(thisArg, node, node.name, this)) {
        return true;
      }
    }

    return false;
  }

  public every(
    cb: (
      value: DepMeshNode<T>,
      key: string,
      map: Map<string, DepMeshNode<T>>
    ) => boolean,
    thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): boolean {
    for (const node of this.values()) {
      if (!cb.call(thisArg, node, node.name, this)) {
        return false;
      }
    }

    return true;
  }
}

export class DepMeshNode<T> {
  public readonly name: string;
  // @ts-ignore value IS assigned, because of "singleton-ness"
  public readonly value: T;
  public readonly mesh: DepMesh<T>;
  public readonly options: DepMeshNodeOptions<T>;

  protected readonly _children: Set<DepMeshNode<T>> = new Set();
  protected readonly _parents: Set<DepMeshNode<T>> = new Set();

  public *depthFirstDescendants(
    exclude: WeakSet<DepMeshNode<T>> = new WeakSet()
  ): IterableIterator<DepMeshNode<T>> {
    for (const child of this._children.values()) {
      if (!exclude.has(child)) {
        exclude.add(child);
        yield child;
      }

      yield* child.depthFirstDescendants(exclude);
    }
  }

  public *depthFirstAncestors(
    exclude: WeakSet<DepMeshNode<T>> = new WeakSet()
  ): IterableIterator<DepMeshNode<T>> {
    for (const parent of this._parents.values()) {
      if (!exclude.has(parent)) {
        exclude.add(parent);
        yield parent;
      }

      yield* parent.depthFirstAncestors(exclude);
    }
  }

  public *children(): IterableIterator<DepMeshNode<T>> {
    yield* [...this._children].sort(compare);
  }

  public *parents(): IterableIterator<DepMeshNode<T>> {
    yield* [...this._parents].sort(compare);
  }

  public *descendants(): IterableIterator<DepMeshNode<T>> {
    yield* [...this.depthFirstDescendants()].sort(compare);
  }

  public *ancestors(): IterableIterator<DepMeshNode<T>> {
    yield* [...this.depthFirstAncestors()].sort(compare);
  }

  public *lastDescendants(
    exclude: WeakSet<DepMeshNode<T>> = new WeakSet()
  ): IterableIterator<DepMeshNode<T>> {
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
    exclude: WeakSet<DepMeshNode<T>> = new WeakSet()
  ): IterableIterator<DepMeshNode<T>> {
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

  public constructor(options: DepMeshNodeCtorOptions<T>) {
    this.name = options.name;
    this.mesh = options.mesh;
    this.options = options;

    if (this.mesh.has(this.name)) {
      return this.mesh.get(this.name) as DepMeshNode<T>;
    }

    if (options.value !== undefined) {
      this.value = options.value;
    } else {
      this.value = this.mesh.options.create(options);
    }

    this.mesh.set(this.name, this);
  }

  public addChild(options: DepMeshNodeOptions<T>): DepMeshNode<T> {
    const name = options.name;
    let link = this.getDescendant(name);

    // No need to add if a descendant already has name as child
    if (!link) {
      link = this.mesh.get(name);

      if (!link) {
        link = new DepMeshNode({
          ...this.options,
          ...options,
          mesh: this.mesh
        });
      } else {
        // DepMeshNode already defined; Prevent circularity
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

  public addParent(options: DepMeshNodeOptions<T>): DepMeshNode<T> {
    const name = options.name;
    let link = this.getAncestor(name);

    // No need to add if an ancestor already has name as parent
    if (!link) {
      link = this.mesh.get(name);

      if (!link) {
        link = new DepMeshNode({
          ...this.options,
          ...options,
          mesh: this.mesh
        });
      } else {
        // DepMeshNode already defined; Prevent circularity
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

  public allChildrenAreExcluded(exclude: WeakSet<DepMeshNode<T>>): boolean {
    return Array.from(this._children).every((link): boolean =>
      exclude.has(link)
    );
  }

  public allParentsAreExcluded(exclude: WeakSet<DepMeshNode<T>>): boolean {
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

  public getChild(name: string): DepMeshNode<T> | undefined {
    let result: DepMeshNode<T> | undefined;

    Array.from(this._children).some((child): boolean => {
      if (child.name === name) {
        result = child;
        return true;
      }

      return false;
    });

    return result;
  }

  public getParent(name: string): DepMeshNode<T> | undefined {
    let result: DepMeshNode<T> | undefined;

    Array.from(this._parents).some((parent): boolean => {
      if (parent.name === name) {
        result = parent;
        return true;
      }

      return false;
    });

    return result;
  }

  public getDescendant(name: string): DepMeshNode<T> | undefined {
    let result = this.getChild(name);

    if (!result) {
      Array.from(this._children).some((child): boolean => {
        result = child.getDescendant(name);
        return !!result;
      });
    }

    return result;
  }

  public getAncestor(name: string): DepMeshNode<T> | undefined {
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
