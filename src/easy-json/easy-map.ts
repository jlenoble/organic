import fse from "fs-extra";
import { JsonMap, GenericMap } from "./json";
import {
  Easy,
  EasyValue,
  EasyArgument,
  EasyMapProxy,
  EasyObjectProxy
} from "./easy";
import isAssignable from "./is-assignable";
import { easyFactory } from "./easy-json";

export default class EasyMap implements Easy {
  public $: GenericMap<EasyValue>;
  public $filepath: string;

  public constructor(filepath: string = "") {
    this.$ = {};
    this.$filepath = filepath;

    Object.defineProperties(this, {
      $: { writable: false, enumerable: false },
      $filepath: { enumerable: false }
    });

    if (this.$filepath) {
      this.$deepAssign(require(this.$filepath));
    }
  }

  public $getValue(): JsonMap {
    return Object.keys(this.$).reduce((mb: JsonMap, key): JsonMap => {
      mb[key] =
        (typeof this.$[key] === "object" &&
          (this.$[key] as EasyObjectProxy).$getValue()) ||
        this.$[key];
      return mb;
    }, {});
  }

  public $deepAssign(json: EasyArgument): void {
    if (typeof json === "object" && !Array.isArray(json)) {
      Object.keys(json).forEach((key): void => {
        if (isAssignable(this.$[key], json[key])) {
          (this.$[key] as EasyObjectProxy).$deepAssign(json[
            key
          ] as EasyObjectProxy);
        } else {
          this.$[key] = easyFactory(json[key]);
        }
      });
    }
  }

  public $deepClone(): EasyMapProxy {
    return easyFactory(this.$getValue()) as EasyMapProxy;
  }

  public $equals(json: EasyArgument): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    const keys = Object.keys(this.$);

    return (
      keys.length === Object.keys(json).length &&
      keys.every((key): boolean => {
        return (
          (typeof this.$[key] === "object" &&
            (this.$[key] as EasyObjectProxy).$equals(json[key])) ||
          this.$[key] === json[key]
        );
      })
    );
  }

  public $includes(json: EasyArgument): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    let count = Object.keys(json).length;

    return (
      Object.keys(this.$).every((key): boolean => {
        if (!count) {
          return true;
        }

        if (json[key] !== undefined) {
          count--;
        }

        return (
          (typeof this.$[key] === "object" &&
            (this.$[key] as EasyObjectProxy).$includes(json[key])) ||
          this.$[key] === json[key]
        );
      }) && !count
    );
  }

  public $isIncluded(json: EasyArgument): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    return Object.keys(this.$).every((key): boolean => {
      return (
        (typeof this.$[key] === "object" &&
          (this.$[key] as EasyObjectProxy).$isIncluded(json[key])) ||
        this.$[key] === json[key]
      );
    });
  }

  public async $read(filepath: string = ""): Promise<void> {
    if (filepath) {
      this.$filepath = filepath;
    }

    const json: JsonMap = await fse.readJson(this.$filepath);

    this.$deepAssign(json);
  }

  public async $write(filepath: string = ""): Promise<void> {
    if (filepath) {
      this.$filepath = filepath;
    }

    return fse.outputJson(this.$filepath, this, { spaces: 2 });
  }
}

export function easyMap(json: JsonMap): EasyMapProxy {
  const easy = new EasyMap();

  Object.keys(json).forEach((key): void => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    easy.$[key] = easyFactory(json[key]);
  });

  // @ts-ignore We cannot add a index signature to EasyMap because we cannot
  // add the construct [key in Exclude<string, keyof Easy>] to it: it is
  // interpreted as a computed property name.
  const proxy: EasyMapProxy = new Proxy(easy, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (obj, prop): any => {
      if (typeof prop === "string" && prop in obj.$) {
        return obj.$[prop];
      }

      // @ts-ignore No index signature for EasyMap, see above explanation
      return obj[prop];
    },

    set: (obj, prop, value): boolean => {
      if (typeof prop === "string") {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (prop === "$filepath") {
          obj[prop] = value;
        } else {
          obj.$[prop] = easyFactory(value);
        }

        return true;
      }

      return false;
    },

    has: (obj, prop): boolean => {
      return obj.$.hasOwnProperty(prop);
    },

    ownKeys: (obj): string[] => {
      return Object.getOwnPropertyNames(obj.$);
    },

    getOwnPropertyDescriptor: (obj, prop): PropertyDescriptor | undefined => {
      return Object.getOwnPropertyDescriptor(obj.$, prop);
    }
  });

  return proxy;
}
