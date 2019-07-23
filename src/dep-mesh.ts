interface U {
  readonly name: string;
}

export interface Options<T> {
  createElement(name: string): T;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default class Link<T extends U> {
  public readonly name: string;
  public readonly element: T;
  public readonly links: Map<string, Link<T>>;
  public readonly options: Options<T>;

  protected readonly _children: Set<Link<T>> = new Set();
  protected readonly _parents: Set<Link<T>> = new Set();

  public static *generators<V extends U>(
    links: IterableIterator<Link<V>>
  ): IterableIterator<Link<V>> {
    const leftLinks: Set<Link<V>> = new Set(links);

    for (const leftLink of leftLinks) {
      while (leftLinks.has(leftLink)) {
        yield* leftLink.getFirstAncestors(leftLinks);
      }
    }
  }

  public constructor(
    name: string | T,
    links: Map<string, Link<T>>,
    options: Options<T>
  ) {
    if (typeof name === "string") {
      this.name = name;
    } else {
      this.name = name.name;
    }

    this.links = links;
    this.options = options;

    if (typeof name === "string") {
      this.element = options.createElement(name);
    } else {
      this.element = name;
    }

    if (this.links.has(this.name)) {
      return this.links.get(this.name) as Link<T>;
    }

    this.links.set(this.name, this);
  }

  public addChild(name: string): this {
    // No need to add if a descendant already has name as child
    if (!this.hasDescendant(name)) {
      let link: Link<T> | undefined = this.links.get(name);

      if (!link) {
        link = new Link(name, this.links, this.options);
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

    return this;
  }

  public addParent(name: string): this {
    // No need to add if an ancestor already has name as parent
    if (!this.hasAncestor(name)) {
      let link: Link<T> | undefined = this.links.get(name);

      if (!link) {
        link = new Link(name, this.links, this.options);
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

    return this;
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
    return Object.values(this._children).some((child): boolean => {
      return child.name === name;
    });
  }

  public hasParent(name: string): boolean {
    return Object.values(this._parents).some((parent): boolean => {
      return parent.name === name;
    });
  }

  public hasDescendant(name: string): boolean {
    return (
      this.hasChild(name) ||
      Object.values(this._children).some((child): boolean =>
        child.hasDescendant(name)
      )
    );
  }

  public hasAncestor(name: string): boolean {
    return (
      this.hasParent(name) ||
      Object.values(this._parents).some((parent): boolean =>
        parent.hasAncestor(name)
      )
    );
  }
}
