import { JsonArray, JsonValue } from "./json";
import { Easy, EasyValue, EasyArrayProxy, EasyObjectProxy } from "./easy";
import isAssignable from "./is-assignable";
import easyJson from "./index";

export default class EasyArray extends Array<EasyValue> implements Easy {
  public $getValue(): JsonArray {
    return this.map(
      (el): JsonValue => {
        return (typeof el === "object" && el.$getValue()) || el;
      }
    );
  }

  public $deepAssign(json: JsonValue | EasyValue): void {
    if (Array.isArray(json)) {
      const len = this.length;
      const len2 = json.length;

      for (let i = 0; i < len2; i++) {
        if (i < len && isAssignable(this[i], json[i])) {
          (this[i] as EasyObjectProxy).$deepAssign(json[i]);
        } else {
          this[i] = easyJson(json[i]);
        }
      }
    }
  }

  public $deepClone(): EasyArray {
    return easyJson(this.$getValue()) as EasyArray;
  }

  public $equals(json: JsonValue | EasyValue): boolean {
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

  public $includes(json: JsonValue | EasyValue): boolean {
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

  public $isIncluded(json: JsonValue | EasyValue): boolean {
    if (!Array.isArray(json)) {
      return false;
    }

    return this.every((el, i): boolean => {
      return (
        (typeof el === "object" && el.$isIncluded(json[i])) || el === json[i]
      );
    });
  }
}

export function easyArray(json: JsonArray): EasyArrayProxy {
  const easy: EasyArray = new EasyArray(json.length);

  json.forEach((value, i): void => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    easy[i] = easyJson(value);
  });

  const proxy: EasyArrayProxy = new Proxy(easy, {
    set: (obj, prop, value): boolean => {
      const n = parseInt(prop as string, 10);

      if (n.toString() === prop) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        obj[n] = easyJson(value);
        return true;
      }

      return false;
    }
  });

  return proxy;
}
