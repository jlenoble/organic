export interface Options<T> {
  name: string;
  links?: Map<string, Link<T>>;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function compare<T>(l1: Link<T>, l2: Link<T>): 1 | 0 | -1 {
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

export default class Link<T> {
  public readonly name: string;
  public readonly links: Map<string, Link<T>>;
  public readonly options: Options<T>;

  protected readonly _children: Set<Link<T>> = new Set();
  protected readonly _parents: Set<Link<T>> = new Set();

  protected *_depthFirstDescendants(
    wm: WeakSet<Link<T>> = new WeakSet()
  ): IterableIterator<Link<T>> {
    for (const child of this._children.values()) {
      if (!wm.has(child)) {
        wm.add(child);
        yield child;
      }

      yield* child._depthFirstDescendants(wm);
    }
  }

  protected *_depthFirstAncestors(
    wm: WeakSet<Link<T>> = new WeakSet()
  ): IterableIterator<Link<T>> {
    for (const parent of this._parents.values()) {
      if (!wm.has(parent)) {
        wm.add(parent);
        yield parent;
      }

      yield* parent._depthFirstAncestors(wm);
    }
  }

  public *children(): IterableIterator<Link<T>> {
    yield* [...this._children].sort(compare);
  }

  public *parents(): IterableIterator<Link<T>> {
    yield* [...this._parents].sort(compare);
  }

  public *descendants(): IterableIterator<Link<T>> {
    yield* [...this._depthFirstDescendants()].sort(compare);
  }

  public *ancestors(): IterableIterator<Link<T>> {
    yield* [...this._depthFirstAncestors()].sort(compare);
  }

  public *lastDescendants(): IterableIterator<Link<T>> {
    for (const descendant of this.descendants()) {
      if (descendant.isLastDescendant()) {
        yield descendant;
      }
    }
  }

  public *firstAncestors(): IterableIterator<Link<T>> {
    for (const ancestor of this.ancestors()) {
      if (ancestor.isFirstAncestor()) {
        yield ancestor;
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

  public constructor(options: Options<T>) {
    this.name = options.name;
    this.links = options.links || new Map();
    this.options = options;

    if (this.links.has(this.name)) {
      return this.links.get(this.name) as Link<T>;
    }

    this.links.set(this.name, this);
  }

  public addChild(name: string): Link<T> {
    let link = this.getDescendant(name);

    // No need to add if a descendant already has name as child
    if (!link) {
      link = this.links.get(name);

      if (!link) {
        link = new Link({ ...this.options, name, links: this.links });
      } else {
        // Link already defined; Prevent circularity
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

  public addParent(name: string): Link<T> {
    let link = this.getAncestor(name);

    // No need to add if an ancestor already has name as parent
    if (!link) {
      link = this.links.get(name);

      if (!link) {
        link = new Link({ ...this.options, name, links: this.links });
      } else {
        // Link already defined; Prevent circularity
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

  public getChild(name: string): Link<T> | undefined {
    let result: Link<T> | undefined;

    Array.from(this._children).some((child): boolean => {
      if (child.name === name) {
        result = child;
        return true;
      }

      return false;
    });

    return result;
  }

  public getParent(name: string): Link<T> | undefined {
    let result: Link<T> | undefined;

    Array.from(this._parents).some((parent): boolean => {
      if (parent.name === name) {
        result = parent;
        return true;
      }

      return false;
    });

    return result;
  }

  public getDescendant(name: string): Link<T> | undefined {
    let result = this.getChild(name);

    if (!result) {
      Array.from(this._children).some((child): boolean => {
        result = child.getDescendant(name);
        return !!result;
      });
    }

    return result;
  }

  public getAncestor(name: string): Link<T> | undefined {
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
