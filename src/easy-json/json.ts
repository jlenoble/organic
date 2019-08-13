"use strict";

export interface GenericMap<T> {
  [key: string]: T;
}

export type GenericArray<T> = T[];
export type Primitive = string | number | boolean;
export type JsonObject = JsonArray | JsonMap;
export type JsonValue = Primitive | JsonObject;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsonArray extends GenericArray<JsonValue> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsonMap extends GenericMap<JsonValue> {}
