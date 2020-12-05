import { task } from "gulp";
import del from "del";
import { libDir } from "./common";

export const distClean = (): Promise<string[]> => {
  return del(libDir);
};

task("dist-clean", distClean);
