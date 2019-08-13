"use strict";

import {
  Primitive,
  JsonObject,
  JsonValue,
  GenericArray,
  GenericMap
} from "./json";

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
interface BaseEasyArray extends GenericArray<EasyValue> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface BaseEasyMap extends GenericMap<EasyValue> {}

export type EasyArray = BaseEasyArray & Easy;
export type EasyMap = BaseEasyMap & Easy;
