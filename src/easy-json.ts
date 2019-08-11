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

type EasyType<T> = T extends Primitive
  ? EasyPrimitive
  : T extends JsonArray
  ? EasyArray
  : T extends JsonMap
  ? EasyMap
  : never;

type EasyValue = EasyPrimitive | EasyArray | EasyMap;

interface Easy {
  getValue(): JsonValue;

  isAssignable(json: JsonValue): boolean;

  equals(json: JsonValue): boolean;
  includes(json: JsonValue): boolean;
  isIncluded(json: JsonValue): boolean;

  deepAssign(json: JsonValue): this;
  deepClone(): EasyValue | EasyJson;
}

function easyFactory(json: JsonValue): EasyType<JsonValue> {
  if (Array.isArray(json)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new EasyArray(json);
  }

  switch (typeof json) {
    case "object":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return new EasyMap(json);

    case "string":
    case "number":
    case "boolean":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return new EasyPrimitive(json);
  }
}

export class EasyPrimitive implements Easy {
  protected _value: Primitive;

  public constructor(json: Primitive) {
    this._value = json;

    Object.defineProperty(this, "_value", { enumerable: false });
  }

  public getValue(): Primitive {
    return this._value;
  }

  public isAssignable(json: JsonValue): boolean {
    switch (typeof json) {
      case "string":
      case "number":
      case "boolean":
        return true;
    }

    return false;
  }

  public equals(json: JsonValue): boolean {
    return this._value === json;
  }

  public includes(json: JsonValue): boolean {
    return this._value === json;
  }

  public isIncluded(json: JsonValue): boolean {
    return this._value === json;
  }

  public deepAssign(json: Primitive): this {
    this._value = json;
    return this;
  }

  public deepClone(): EasyPrimitive {
    return new EasyPrimitive(this._value);
  }
}

export class EasyArray implements Easy {
  protected _value: EasyValue[];

  public constructor(json: JsonArray) {
    this._value = new Array(json.length);

    for (const [i, v] of json.entries()) {
      this._value[i] = easyFactory(v);
    }

    Object.defineProperty(this, "_value", { enumerable: false });
  }

  public getValue(): JsonArray {
    return this._value.map((easy): JsonValue => easy.getValue());
  }

  public isAssignable(json: JsonValue): boolean {
    return Array.isArray(json);
  }

  public equals(json: JsonValue): boolean {
    if (!Array.isArray(json)) {
      return false;
    }

    return (
      json.length === this._value.length &&
      this._value.every((value, i): boolean => {
        return value.equals(json[i]);
      })
    );
  }

  public includes(json: JsonValue): boolean {
    if (!Array.isArray(json)) {
      return false;
    }

    const len = json.length;

    return this._value.every((value, i): boolean => {
      return i >= len || value.includes(json[i]);
    });
  }

  public isIncluded(json: JsonValue): boolean {
    if (!Array.isArray(json)) {
      return false;
    }

    return this._value.every((value, i): boolean => {
      return value.isIncluded(json[i]);
    });
  }

  public deepAssign(json: JsonArray): this {
    const len = this._value.length;

    json.forEach((value, i): void => {
      if (i < len && this._value[i].isAssignable(value)) {
        // @ts-ignore
        this._value[i].deepAssign(value);
      } else {
        this._value[i] = easyFactory(value);
      }
    });

    return this;
  }

  public deepClone(): EasyArray {
    const len = this._value.length;
    const easy = new EasyArray([]);

    for (let i = 0; i < len; i++) {
      easy._value[i] = this._value[i].deepClone();
    }

    return easy;
  }
}

export class EasyMap implements Easy {
  protected _value: { [key: string]: EasyValue };

  public constructor(json: JsonMap) {
    this._value = {};

    for (const key of Object.keys(json)) {
      this._value[key] = easyFactory(json[key]);
    }

    Object.defineProperty(this, "_value", { enumerable: false });
  }

  public getValue(): JsonMap {
    return Object.keys(this._value).reduce((json: JsonMap, key): JsonMap => {
      json[key] = this._value[key].getValue();
      return json;
    }, {});
  }

  public isAssignable(json: JsonValue): boolean {
    return !Array.isArray(json) && typeof json === "object";
  }

  public equals(json: JsonValue): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    const keys = Object.keys(this._value);

    return (
      keys.length === Object.keys(json).length &&
      keys.every((key): boolean => {
        return this._value[key].equals(json[key]);
      })
    );
  }

  public includes(json: JsonValue): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    let count = Object.keys(json).length;

    return (
      Object.keys(this._value).every((key): boolean => {
        if (!count) {
          return true;
        }

        if (json[key] !== undefined) {
          count--;
        }

        return this._value[key].includes(json[key]);
      }) && !count
    );
  }

  public isIncluded(json: JsonValue): boolean {
    if (Array.isArray(json) || typeof json !== "object") {
      return false;
    }

    return Object.keys(this._value).every((key): boolean => {
      return this._value[key].isIncluded(json[key]);
    });
  }

  public deepAssign(json: JsonMap): this {
    Object.keys(json).forEach((key): void => {
      if (
        this._value[key] !== undefined &&
        this._value[key].isAssignable(json[key])
      ) {
        // @ts-ignore
        this._value[key].deepAssign(json[key]);
      } else {
        this._value[key] = easyFactory(json[key]);
      }
    });

    return this;
  }

  public deepClone(): EasyMap {
    const easy = new EasyMap({});

    Object.keys(this._value).forEach((key): void => {
      easy._value[key] = this._value[key].deepClone();
    });

    return easy;
  }
}

export class EasyJson implements Easy {
  protected _value: EasyType<JsonValue>;

  public constructor(json: JsonValue) {
    this._value = easyFactory(json);
    Object.defineProperty(this, "_value", { enumerable: false });
  }

  public getValue(): JsonValue {
    return this._value.getValue();
  }

  public isAssignable(json: JsonValue): boolean {
    switch (typeof json) {
      case "object":
      case "string":
      case "number":
      case "boolean":
        return true;
    }

    return false;
  }

  public equals(json: JsonValue): boolean {
    return this._value.equals(json);
  }

  public includes(json: JsonValue): boolean {
    return this._value.includes(json);
  }

  public isIncluded(json: JsonValue): boolean {
    return this._value.isIncluded(json);
  }

  public deepAssign(json: JsonValue): this {
    if (Array.isArray(json)) {
      return this._deepAssignArray(json);
    }

    switch (typeof json) {
      case "object":
        return this._deepAssignMap(json);

      case "string":
      case "number":
      case "boolean":
        this._value = new EasyPrimitive(json);
    }

    return this;
  }

  protected _deepAssignArray(json: JsonArray): this {
    if (this._value instanceof EasyArray) {
      this._value.deepAssign(json);
    } else {
      this._value = new EasyArray(json);
    }

    return this;
  }

  protected _deepAssignMap(json: JsonMap): this {
    if (this._value instanceof EasyMap) {
      this._value.deepAssign(json);
    } else {
      this._value = new EasyMap(json);
    }

    return this;
  }

  public deepClone(): EasyJson {
    const easy = new EasyJson({});
    easy._value = this._value.deepClone();
    return easy;
  }
}

export default function createEasyJson(json: JsonValue): EasyJson {
  return new EasyJson(json);
}
