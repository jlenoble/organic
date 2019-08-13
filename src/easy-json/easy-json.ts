import { JsonValue } from "./json";
import { EasyObject } from "./easy";
import EasyArray from "./easy-array";
import EasyMap from "./easy-map";

export default function easyJson(json: JsonValue): EasyObject {
  if (Array.isArray(json)) {
    const easy: EasyArray = new EasyArray(json.length);

    json.forEach((value, i): void => {
      easy[i] = easyJson(value);
    });

    const proxy = new Proxy(easy, {
      set: (obj, prop, value): boolean => {
        const n = parseInt(prop as string, 10);

        if (n.toString() === prop) {
          obj[n] = easyJson(value);
          return true;
        }

        return false;
      }
    });

    return proxy;
  } else {
    switch (typeof json) {
      case "object":
        const easy = new EasyMap();

        Object.keys(json).forEach((key): void => {
          easy[key] = easyJson(json[key]);
        });

        const proxy = new Proxy(easy, {
          set: (obj, prop, value): boolean => {
            if (typeof prop === "string") {
              obj[prop] = easyJson(value);
              return true;
            }

            return false;
          }
        });

        return proxy;

      case "string":
      case "number":
      case "boolean":
        return json;

      default:
        throw new Error("Invalid input value");
    }
  }
}
