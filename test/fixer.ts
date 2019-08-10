import Fixer from "../src/fixer";

let fixer: Fixer | undefined;

export default function getFixer(): Fixer {
  if (!fixer) {
    fixer = new Fixer("packages");
  }

  return fixer;
}
