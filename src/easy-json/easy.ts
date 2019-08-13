"use strict";

import { Primitive, JsonValue } from "./json";

export type EasyObjectProxy = EasyArrayProxy | EasyMapProxy;
export type EasyValue = Primitive | EasyObjectProxy;

export interface Easy {
  $getValue(): JsonValue;
  $deepAssign(json: JsonValue | EasyValue): void;
  $deepClone(): EasyObjectProxy;
  $equals(json: JsonValue | EasyValue): boolean;
  $includes(json: JsonValue | EasyValue): boolean;
  $isIncluded(json: JsonValue | EasyValue): boolean;
}

export interface EasyArrayProxy extends Easy, Array<EasyValue> {}

export type EasyMapProxy = Easy &
  {
    [index in Exclude<string, keyof Easy>]: EasyValue;
  };
