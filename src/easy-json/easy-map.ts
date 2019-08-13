import { JsonMap, JsonValue } from "./json";
import { Easy, EasyObject } from "./easy";
import isAssignable from "./is-assignable";
import easyJson from "./index";

export default class EasyMap implements Easy {
  public $getValue(): JsonMap {
    return Object.keys(this).reduce((mb: JsonMap, key): JsonMap => {
      mb[key] =
        (typeof this[key] === "object" &&
          (this[key] as EasyObject).$getValue()) ||
        this[key];
      return mb;
    }, {});
  }

  public $deepAssign(json: JsonValue | EasyObject): void {
    if (typeof json === "object" && !Array.isArray(json)) {
      Object.keys(json).forEach((key): void => {
        if (isAssignable(this[key], json[key])) {
          (this[key] as EasyObject).$deepAssign(json[key] as EasyObject);
        } else {
          this[key] = easyJson(json[key]);
        }
      });
    }
  }

  public $deepClone(): EasyMap {
    return easyJson(this.$getValue()) as EasyMap;
  }

  public $equals(json: JsonValue | EasyObject): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    const keys = Object.keys(this);

    return (
      keys.length === Object.keys(json).length &&
      keys.every((key): boolean => {
        return (
          (typeof this[key] === "object" &&
            (this[key] as EasyObject).$equals(json[key])) ||
          this[key] === json[key]
        );
      })
    );
  }

  public $includes(json: JsonValue | EasyObject): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    let count = Object.keys(json).length;

    return (
      Object.keys(this).every((key): boolean => {
        if (!count) {
          return true;
        }

        if (json[key] !== undefined) {
          count--;
        }

        return (
          (typeof this[key] === "object" &&
            (this[key] as EasyObject).$includes(json[key])) ||
          this[key] === json[key]
        );
      }) && !count
    );
  }

  public $isIncluded(json: JsonValue | EasyObject): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    return Object.keys(this).every((key): boolean => {
      return (
        (typeof this[key] === "object" &&
          (this[key] as EasyObject).$isIncluded(json[key])) ||
        this[key] === json[key]
      );
    });
  }
}
