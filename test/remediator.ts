import { Remediator } from "../src/fixer";

let remediator: Remediator | undefined;

export default function getRemediator(): Remediator {
  if (!remediator) {
    remediator = new Remediator("packages");
  }

  return remediator;
}
