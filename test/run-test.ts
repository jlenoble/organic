import getPackages from "./packages";
import getRemediator from "./remediator";

export default function runTest(
  hints: string | string[],
  options?: object
): () => Promise<void> {
  return async (): Promise<void> => {
    const packages = await getPackages();
    const remediator = getRemediator();

    const message = packages.getErrorMessage(hints, options);
    const message2 = remediator.addFixes(message);

    if (message2) {
      console.log(message2);
    }

    if (message) {
      throw new Error(message);
    }
  };
}
