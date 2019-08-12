interface GenericMap<T> {
  [key: string]: T;
}

type GenericArray<T> = T[];
type Primitive = string | number | boolean;
type JsonValue = Primitive | JsonArray | JsonMap;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JsonArray extends GenericArray<JsonValue> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JsonMap extends GenericMap<JsonValue> {}

function isAssignable(o1: JsonValue, o2: JsonValue): boolean {
  return (
    (Array.isArray(o1) && Array.isArray(o2)) ||
    (typeof o1 === "object" && typeof o2 === "object")
  );
}

export default function easyFactory(json: JsonValue): JsonValue {
  if (Array.isArray(json)) {
    const easy: JsonArray = new Array(json.length);

    json.forEach((value, i): void => {
      easy[i] = easyFactory(value);
    });

    const proxy = new Proxy(easy, {
      get: (obj, prop): any => {
        switch (prop) {
          case "getValue":
            return (): JsonArray =>
              obj.map(
                (el): JsonValue => {
                  return (typeof el === "object" && el.getValue()) || el;
                }
              );

          case "deepAssign":
            return (json: JsonValue): void => {
              if (Array.isArray(json)) {
                const len = obj.length;

                json.forEach((value, i): void => {
                  if (i < len && isAssignable(obj[i], value)) {
                    obj[i].deepAssign(value);
                  } else {
                    obj[i] = easyFactory(value);
                  }
                });
              }
            };

          case "deepClone":
            return (): JsonValue => easyFactory(proxy.getValue());

          case "equals":
            return (json: JsonValue): boolean => {
              if (!Array.isArray(json)) {
                return false;
              }

              return (
                json.length === obj.length &&
                obj.every((el, i): boolean => {
                  return (
                    (typeof el === "object" && el.equals(json[i])) ||
                    el === json[i]
                  );
                })
              );
            };

          case "includes":
            return (json: JsonValue): boolean => {
              if (!Array.isArray(json)) {
                return false;
              }

              const len = json.length;

              return obj.every((el, i): boolean => {
                return (
                  i >= len ||
                  (typeof el === "object" && el.includes(json[i])) ||
                  el === json[i]
                );
              });
            };

          case "isIncluded":
            return (json: JsonValue): boolean => {
              if (!Array.isArray(json)) {
                return false;
              }

              return obj.every((el, i): boolean => {
                return (
                  (typeof el === "object" && el.isIncluded(json[i])) ||
                  el === json[i]
                );
              });
            };
        }

        return obj[prop];
      },

      set: (obj, prop, value): boolean => {
        obj[prop] = easyFactory(value);
        return true;
      }
    });

    return proxy;
  } else {
    switch (typeof json) {
      case "object":
        const easy: JsonMap = {};

        Object.keys(json).forEach((key): void => {
          easy[key] = easyFactory(json[key]);
        });

        const proxy = new Proxy(easy, {
          get: (obj, prop): any => {
            switch (prop) {
              case "getValue":
                return (): JsonMap =>
                  Object.keys(obj).reduce((mb: JsonMap, key): JsonMap => {
                    mb[key] =
                      (typeof obj[key] === "object" && obj[key].getValue()) ||
                      obj[key];
                    return mb;
                  }, {});

              case "deepAssign":
                return (json: JsonValue): void => {
                  if (typeof json === "object" && !Array.isArray(json)) {
                    Object.keys(json).forEach((key): void => {
                      if (isAssignable(obj[key], json[key])) {
                        obj[key].deepAssign(json[key]);
                      } else {
                        obj[key] = easyFactory(json[key]);
                      }
                    });
                  }
                };

              case "deepClone":
                return (): JsonValue => easyFactory(proxy.getValue());

              case "equals":
                return (json: JsonValue): boolean => {
                  if (Array.isArray(json) || typeof json !== "object") {
                    return false;
                  }

                  const keys = Object.keys(obj);

                  return (
                    keys.length === Object.keys(json).length &&
                    keys.every((key): boolean => {
                      return (
                        (typeof obj[key] === "object" &&
                          obj[key].equals(json[key])) ||
                        obj[key] === json[key]
                      );
                    })
                  );
                };

              case "includes":
                return (json: JsonValue): boolean => {
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
                          obj[key].includes(json[key])) ||
                        obj[key] === json[key]
                      );
                    }) && !count
                  );
                };

              case "isIncluded":
                return (json: JsonValue): boolean => {
                  if (Array.isArray(json) || typeof json !== "object") {
                    return false;
                  }

                  return Object.keys(obj).every((key): boolean => {
                    return (
                      (typeof obj[key] === "object" &&
                        obj[key].isIncluded(json[key])) ||
                      obj[key] === json[key]
                    );
                  });
                };
            }

            return obj[prop];
          },

          set: (obj, prop, value): boolean => {
            obj[prop] = easyFactory(value);
            return true;
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
