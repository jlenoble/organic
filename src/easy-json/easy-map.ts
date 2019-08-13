import { JsonMap, JsonValue, GenericMap } from "./json";
import { Easy, EasyValue, EasyMapProxy, EasyObjectProxy } from "./easy";
import isAssignable from "./is-assignable";
import easyJson from "./index";

export default class EasyMap implements Easy {
  public $: GenericMap<EasyValue>;

  public constructor() {
    this.$ = {};

    Object.defineProperty(this, "$", { writable: false, enumerable: false });
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

  public $deepAssign(json: JsonValue | EasyValue): void {
    if (typeof json === "object" && !Array.isArray(json)) {
      Object.keys(json).forEach((key): void => {
        if (isAssignable(this.$[key], json[key])) {
          (this.$[key] as EasyObjectProxy).$deepAssign(json[
            key
          ] as EasyObjectProxy);
        } else {
          this.$[key] = easyJson(json[key]);
        }
      });
    }
  }

  public $deepClone(): EasyMapProxy {
    return easyJson(this.$getValue()) as EasyMapProxy;
  }

  public $equals(json: JsonValue | EasyValue): boolean {
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

  public $includes(json: JsonValue | EasyValue): boolean {
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

  public $isIncluded(json: JsonValue | EasyValue): boolean {
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
}
