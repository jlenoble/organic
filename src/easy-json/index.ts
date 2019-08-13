import { JsonArray, JsonMap, JsonValue } from "./json";
import { EasyArray, EasyMap, EasyObject } from "./easy";
import isAssignable from "./is-assignable";

export default function easyJson(json: JsonValue): EasyObject {
  if (Array.isArray(json)) {
    const easy: EasyArray = new Array(json.length) as EasyArray;

    json.forEach((value, i): void => {
      easy[i] = easyJson(value);
    });

    const proxy = new Proxy(easy, {
      get: (obj, prop): any => {
        switch (prop) {
          case "$getValue":
            return (): JsonArray =>
              obj.map(
                (el): JsonValue => {
                  return (typeof el === "object" && el.$getValue()) || el;
                }
              );

          case "$deepAssign":
            return (json: JsonArray | EasyArray): void => {
              if (Array.isArray(json)) {
                const len = obj.length;

                json.forEach((value: JsonValue | EasyObject, i): void => {
                  if (i < len && isAssignable(obj[i], value)) {
                    (obj[i] as EasyObject).$deepAssign(value);
                  } else {
                    obj[i] = easyJson(value);
                  }
                });
              }
            };

          case "$deepClone":
            return (): JsonValue => easyJson(proxy.$getValue());

          case "$equals":
            return (json: JsonValue | EasyObject): boolean => {
              if (!Array.isArray(json)) {
                return false;
              }

              return (
                json.length === obj.length &&
                obj.every((el, i): boolean => {
                  return (
                    (typeof el === "object" && el.$equals(json[i])) ||
                    el === json[i]
                  );
                })
              );
            };

          case "$includes":
            return (json: JsonValue | EasyObject): boolean => {
              if (!Array.isArray(json)) {
                return false;
              }

              const len = json.length;

              return obj.every((el, i): boolean => {
                return (
                  i >= len ||
                  (typeof el === "object" && el.$includes(json[i])) ||
                  el === json[i]
                );
              });
            };

          case "$isIncluded":
            return (json: JsonValue | EasyObject): boolean => {
              if (!Array.isArray(json)) {
                return false;
              }

              return obj.every((el, i): boolean => {
                return (
                  (typeof el === "object" && el.$isIncluded(json[i])) ||
                  el === json[i]
                );
              });
            };
        }

        return obj[prop];
      },

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
        const easy: EasyMap = {};

        Object.keys(json).forEach((key): void => {
          easy[key] = easyJson(json[key]);
        });

        const proxy = new Proxy(easy, {
          get: (obj, prop): any => {
            switch (prop) {
              case "$getValue":
                return (): JsonMap =>
                  Object.keys(obj).reduce((mb: JsonMap, key): JsonMap => {
                    mb[key] =
                      (typeof obj[key] === "object" &&
                        (obj[key] as EasyObject).$getValue()) ||
                      obj[key];
                    return mb;
                  }, {});

              case "$deepAssign":
                return (json: JsonValue | EasyObject): void => {
                  if (typeof json === "object" && !Array.isArray(json)) {
                    Object.keys(json).forEach((key): void => {
                      if (isAssignable(obj[key], json[key])) {
                        (obj[key] as EasyObject).$deepAssign(json[
                          key
                        ] as EasyObject);
                      } else {
                        obj[key] = easyJson(json[key]);
                      }
                    });
                  }
                };

              case "$deepClone":
                return (): JsonValue => easyJson(proxy.$getValue());

              case "$equals":
                return (json: JsonValue | EasyObject): boolean => {
                  if (Array.isArray(json) || typeof json !== "object") {
                    return false;
                  }

                  const keys = Object.keys(obj);

                  return (
                    keys.length === Object.keys(json).length &&
                    keys.every((key): boolean => {
                      return (
                        (typeof obj[key] === "object" &&
                          (obj[key] as EasyObject).$equals(json[key])) ||
                        obj[key] === json[key]
                      );
                    })
                  );
                };

              case "$includes":
                return (json: JsonValue | EasyObject): boolean => {
                  if (Array.isArray(json) || typeof json !== "object") {
                    return false;
                  }

                  let count = Object.keys(json).length;

                  return (
                    Object.keys(obj).every((key): boolean => {
                      if (!count) {
                        return true;
                      }

                      if (json[key] !== undefined) {
                        count--;
                      }

                      return (
                        (typeof obj[key] === "object" &&
                          (obj[key] as EasyObject).$includes(json[key])) ||
                        obj[key] === json[key]
                      );
                    }) && !count
                  );
                };

              case "$isIncluded":
                return (json: JsonValue | EasyObject): boolean => {
                  if (Array.isArray(json) || typeof json !== "object") {
                    return false;
                  }

                  return Object.keys(obj).every((key): boolean => {
                    return (
                      (typeof obj[key] === "object" &&
                        (obj[key] as EasyObject).$isIncluded(json[key])) ||
                      obj[key] === json[key]
                    );
                  });
                };
            }

            return obj[prop];
          },

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
