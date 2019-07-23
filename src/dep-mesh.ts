export interface Options<T> {
  name: string;
  links?: Map<string, Link<T>>;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default class Link<T> {
  public readonly name: string;
  public readonly links: Map<string, Link<T>>;
  public readonly options: Options<T>;

  protected readonly _children: Set<Link<T>> = new Set();
  protected readonly _parents: Set<Link<T>> = new Set();

  public *children(): IterableIterator<Link<T>> {
    yield* this._children.values();
  }

  public *parents(): IterableIterator<Link<T>> {
    yield* this._parents.values();
  }

  public *descendants(): IterableIterator<Link<T>> {
    for (const child of this.children()) {
      yield child;
      yield* child.descendants();
    }
  }

  public *ancestors(): IterableIterator<Link<T>> {
    for (const parent of this.parents()) {
      yield parent;
      yield* parent.ancestors();
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

  public getFirstAncestors(linksLeft: Set<Link<T>>): Set<Link<T>> {
    const ancestors: Set<Link<T>> = new Set();

    if (linksLeft.has(this)) {
      for (const parent of this._parents.values()) {
        for (const ancestor of parent.getFirstAncestors(linksLeft)) {
          ancestors.add(ancestor);
        }
      }
      ancestors.add(this);
      linksLeft.delete(this);
    }

    return ancestors;
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
