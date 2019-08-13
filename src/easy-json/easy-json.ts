import { JsonValue } from "./json";
import { EasyValue, EasyObjectProxy } from "./easy";
import { easyArray } from "./easy-array";
import { easyMap } from "./easy-map";

export function easyFactory(json: JsonValue): EasyValue {
  if (Array.isArray(json)) {
    return easyArray(json);
  } else {
    switch (typeof json) {
      case "object":
        return easyMap(json);

      case "string":
      case "number":
      case "boolean":
        return json;

      default:
        throw new Error("Invalid input value");
    }
  }
}

export default function easyJson(json: JsonValue): EasyObjectProxy {
  if (Array.isArray(json)) {
    return easyArray(json);
  } else {
    switch (typeof json) {
      case "object":
        return easyMap(json);

      default:
        throw new Error("Invalid input value");
    }
  }
}
