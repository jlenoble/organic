import Deps, { Options } from "./common";

class Presets {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly presets: (string | [string, any])[];

  public get deps(): string[] {
    return [
      ...this.presets.map((preset): string => {
        if (Array.isArray(preset)) {
          return preset[0];
        } else {
          return preset;
        }
      })
    ];
  }

  public constructor({ babel, node, typescript }: Options = {}) {
    if (babel) {
      if (node) {
        this.presets = [
          [
            "@babel/preset-env",
            {
              targets: {
                node: typeof node === "string" ? node : "current"
              }
            }
          ]
        ];
      } else {
        this.presets = ["@babel/preset-env"];
      }

      if (typescript) {
        this.presets.push([
          "@babel/preset-typescript",
          {
            allExtensions: true
          }
        ]);
      }
    } else {
      this.presets = [];
    }
  }
}

class Plugins {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly plugins: (string | [string, any])[];

  public get deps(): string[] {
    return [
      ...this.plugins.map((plugin): string => {
        if (Array.isArray(plugin)) {
          return plugin[0];
        } else {
          return plugin;
        }
      })
    ];
  }

  public constructor({ babel, typescript }: Options = {}) {
    if (babel) {
      this.plugins = typescript
        ? [
            "@babel/plugin-proposal-class-properties",
            [
              "@babel/plugin-proposal-decorators",
              {
                decoratorsBeforeExport: true
              }
            ],
            "@babel/plugin-proposal-object-rest-spread",
            "babel-plugin-add-module-exports"
          ]
        : ["babel-plugin-add-module-exports"];
    } else {
      this.plugins = [];
    }
  }
}

export default class BabelConfig extends Deps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly presets: (string | [string, any])[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly plugins: (string | [string, any])[];

  public constructor(options: Options = {}) {
    super();

    const presets = new Presets(options);
    const plugins = new Plugins(options);

    this.presets = presets.presets;
    this.plugins = plugins.plugins;

    if (options.babel) {
      this._addDeps(["@babel/core", "@babel/register"]);

      this._addDeps(presets.deps);
      this._addDeps(plugins.deps);
    }
  }
}
