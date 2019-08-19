import fse from "fs-extra";
import { JsonArray, JsonValue } from "./json";
import {
  Easy,
  EasyValue,
  EasyArgument,
  EasyArrayProxy,
  EasyObjectProxy
} from "./easy";
import isAssignable from "./is-assignable";
import { easyFactory } from "./easy-json";

export default class EasyArray extends Array<EasyValue> implements Easy {
  public $filepath: string;

  public constructor(filepath?: string | number | JsonArray) {
    if (typeof filepath === "string") {
      super();

      this.$filepath = filepath;

      this.$deepAssign(require(this.$filepath));
    } else {
      // @ts-ignore
      super(filepath);

      this.$filepath = "";
    }

    Object.defineProperties(this, {
      $filepath: { enumerable: false }
    });
  }

  public $getValue(): JsonArray {
    return this.map(
      (el): JsonValue => {
        return (typeof el === "object" && el.$getValue()) || el;
      }
    );
  }

  public $deepAssign(json: EasyArgument): void {
    if (Array.isArray(json)) {
      const len = this.length;
      const len2 = json.length;

      for (let i = 0; i < len2; i++) {
        if (i < len && isAssignable(this[i], json[i])) {
          (this[i] as EasyObjectProxy).$deepAssign(json[i]);
        } else {
          this[i] = easyFactory(json[i]);
        }
      }
    }
  }

  public $deepClone(): EasyArray {
    return easyFactory(this.$getValue()) as EasyArray;
  }

  public $equals(json: EasyArgument): boolean {
    if (!Array.isArray(json)) {
      return false;
    }

    return (
      json.length === this.length &&
      this.every((el, i): boolean => {
        return (
          (typeof el === "object" && el.$equals(json[i])) || el === json[i]
        );
      })
    );
  }

  public $includes(json: EasyArgument): boolean {
    if (!Array.isArray(json)) {
      return false;
    }

    const len = json.length;

    return this.every((el, i): boolean => {
      return (
        i >= len ||
        (typeof el === "object" && el.$includes(json[i])) ||
        el === json[i]
      );
    });
  }

  public $isIncluded(json: EasyArgument): boolean {
    if (!Array.isArray(json)) {
      return false;
    }

    return this.every((el, i): boolean => {
      return (
        (typeof el === "object" && el.$isIncluded(json[i])) || el === json[i]
      );
    });
  }

  public async $read(filepath: string = ""): Promise<void> {
    if (filepath) {
      this.$filepath = filepath;
    }

    const json: JsonArray = await fse.readJson(this.$filepath);

    this.$deepAssign(json);
  }

  public async $write(filepath: string = ""): Promise<void> {
    if (filepath) {
      this.$filepath = filepath;
    }

    return fse.outputJson(this.$filepath, this, { spaces: 2 });
  }
}

export function easyArray(json: JsonArray): EasyArrayProxy {
  const easy: EasyArray = new EasyArray(json.length);

  json.forEach((value, i): void => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    easy[i] = easyFactory(value);
  });

  const proxy: EasyArrayProxy = new Proxy(easy, {
    set: (obj, prop, value): boolean => {
      const n = parseInt(prop as string, 10);

      if (n.toString() === prop) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        obj[n] = easyFactory(value);
        return true;
      } else if (prop === "$filepath") {
        obj[prop] = value;
        return true;
      }

      return false;
    }
  });

  return proxy;
}
