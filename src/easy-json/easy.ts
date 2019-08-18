"use strict";

import { Primitive, JsonValue, GenericMap } from "./json";

export type EasyObjectProxy = EasyArrayProxy | EasyMapProxy;
export type EasyValue = Primitive | EasyObjectProxy;
export type EasyArgument = JsonValue | EasyValue;

export interface Easy {
  $getValue(): JsonValue;
  $deepAssign(json: EasyArgument): void;
  $deepClone(): EasyObjectProxy;
  $equals(json: EasyArgument): boolean;
  $includes(json: EasyArgument): boolean;
  $isIncluded(json: EasyArgument): boolean;
}

export interface EasyArrayProxy extends Easy, Array<EasyValue> {}

export type EasyMapProxy = Easy &
  {
    [index in Exclude<string, keyof Easy>]: EasyValue;
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyArray = any[];
export type EasyArray = Easy & AnyArray;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EasyMap = GenericMap<any>;
export type EasyObject = EasyArray | EasyMap;
