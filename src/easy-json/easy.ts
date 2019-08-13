"use strict";

import { Primitive, JsonObject, JsonValue, GenericMap } from "./json";
import EasyArray from "./easy-array";

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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface BaseEasyMap extends GenericMap<EasyValue> {}

export type EasyMap = BaseEasyMap & Easy;
