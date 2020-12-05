import { task } from "gulp";
import del from "del";
import { buildDir } from "./common";

export const handleClean = (): Promise<string[]> => {
  return del(buildDir);
};

task("clean", handleClean);
