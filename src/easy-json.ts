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
  value: JsonValue;
  isAssignable(json: JsonValue): boolean;
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

  public get value(): Primitive {
    return this._value;
  }

  public constructor(json: Primitive) {
    this._value = json;
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

  public get value(): JsonArray {
    return this._value.map((easy): JsonValue => easy.value);
  }

  public constructor(json: JsonArray) {
    this._value = new Array(json.length);

    for (const [i, v] of json.entries()) {
      this._value[i] = easyFactory(v);
    }
  }

  public isAssignable(json: JsonValue): boolean {
    return Array.isArray(json);
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

  public get value(): JsonMap {
    return Object.keys(this._value).reduce((json: JsonMap, key): JsonMap => {
      json[key] = this._value[key].value;
      return json;
    }, {});
  }

  public constructor(json: JsonMap) {
    this._value = {};

    for (const key of Object.keys(json)) {
      this._value[key] = easyFactory(json[key]);
    }
  }

  public isAssignable(json: JsonValue): boolean {
    return !Array.isArray(json) && typeof json === "object";
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

export default class EasyJson implements Easy {
  protected _value: EasyType<JsonValue>;

  public get value(): JsonValue {
    return this._value.value;
  }

  public constructor(json: JsonValue) {
    this._value = easyFactory(json);
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
