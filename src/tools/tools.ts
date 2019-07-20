import BabelConfig from "./babel";
import EslintConfig from "./eslint";

const tools: { [key: string]: string[] } = {
  babel: new BabelConfig({ babel: true, typescript: true }).deps,
  eslint: new EslintConfig({ eslint: true, prettier: true }).deps
};

export const implicitDevDeps: Set<string> = new Set();

for (const deps of Object.values(tools)) {
  for (const dep of deps) {
    implicitDevDeps.add(dep);
  }
}

export default tools;
