import { JsonArray, JsonValue } from "./json";
import { Easy, EasyValue, EasyObject } from "./easy";
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

  public $deepAssign(json: JsonArray | EasyArray): void {
    if (Array.isArray(json)) {
      const len = this.length;

      json.forEach((value: JsonValue | EasyObject, i): void => {
        if (i < len && isAssignable(this[i], value)) {
          (this[i] as EasyObject).$deepAssign(value);
        } else {
          this[i] = easyJson(value);
        }
      });
    }
  }

  public $deepClone(): EasyArray {
    return easyJson(this.$getValue()) as EasyArray;
  }

  public $equals(json: JsonValue | EasyObject): boolean {
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

  public $includes(json: JsonValue | EasyObject): boolean {
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

  public $isIncluded(json: JsonValue | EasyObject): boolean {
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
