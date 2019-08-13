"use strict";

import { Primitive, JsonObject, JsonValue } from "./json";
import EasyArray from "./easy-array";
import EasyMap from "./easy-map";

export type EasyObject = EasyArray | EasyMap;
export type EasyValue = Primitive | EasyObject;

export interface Easy {
  $getValue(): JsonValue;
  $deepAssign(json: JsonObject | EasyObject): void;
  $deepClone(): EasyObject;
  $equals(json: JsonValue | EasyObject): boolean;
  $includes(json: JsonValue | EasyObject): boolean;
  $isIncluded(json: JsonValue | EasyObject): boolean;
}

export class GenericMap {
  [key: string]: EasyValue;
}
