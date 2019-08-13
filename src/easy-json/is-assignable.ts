import { JsonValue } from "./json";

export default function isAssignable(o1: JsonValue, o2: JsonValue): boolean {
  return (
    (Array.isArray(o1) && Array.isArray(o2)) ||
    (typeof o1 === "object" && typeof o2 === "object")
  );
}
