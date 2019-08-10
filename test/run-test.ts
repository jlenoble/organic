import getPackages from "./packages";
import getFixer from "./fixer";

export default function runTest(
  hints: string | string[],
  options?: object
): () => Promise<void> {
  return async (): Promise<void> => {
    const packages = await getPackages();
    const fixer = getFixer();

    const message = packages.getErrorMessage(hints, options);
    const message2 = fixer.addFixes(message);

    if (message2) {
      console.log(message2);
    }

    if (message) {
      throw new Error(message);
    }
  };
}
