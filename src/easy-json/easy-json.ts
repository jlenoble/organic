import { JsonValue, JsonArray, JsonMap } from "./json";
import { EasyObjectProxy, EasyArrayProxy, EasyMapProxy } from "./easy";
import EasyArray from "./easy-array";
import EasyMap from "./easy-map";

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

export function easyMap(json: JsonMap): EasyMapProxy {
  const easy = new EasyMap();

  Object.keys(json).forEach((key): void => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    easy.$[key] = easyJson(json[key]);
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
        obj.$[prop] = easyJson(value);
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

export default function easyJson(json: JsonValue): EasyObjectProxy {
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
