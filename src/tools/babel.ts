import Deps, { Options } from "./common";

export class Presets {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _presets: (string | [string, any])[];

  public get deps(): string[] {
    return [
      ...this._presets.map((preset): string => {
        if (Array.isArray(preset)) {
          return preset[0];
        } else {
          return preset;
        }
      })
    ];
  }

  public constructor({ babel, typescript }: Options = {}) {
    if (babel) {
      this._presets = [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current"
            }
          }
        ]
      ];

      if (typescript) {
        this._presets.push([
          "@babel/preset-typescript",
          {
            allExtensions: true
          }
        ]);
      }
    } else {
      this._presets = [];
    }
  }
}

export class Plugins {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _plugins: (string | [string, any])[];

  public get deps(): string[] {
    return [
      ...this._plugins.map((plugin): string => {
        if (Array.isArray(plugin)) {
          return plugin[0];
        } else {
          return plugin;
        }
      })
    ];
  }

  public constructor({ babel }: Options = {}) {
    this._plugins = babel
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
      : [];
  }
}

export default class BabelConfig extends Deps {
  protected _presets: Presets;
  protected _plugins: Plugins;

  public get deps(): string[] {
    return [...this._deps];
  }

  public constructor(options: Options = {}) {
    super();

    this._addDeps(["@babel/core", "@babel/register"]);

    this._presets = new Presets(options);
    this._plugins = new Plugins(options);

    this._addDeps(this._presets.deps);
    this._addDeps(this._plugins.deps);
  }
}
