import { task } from "gulp";
import del from "del";

export const distClean = () => {
  return del("lib");
};

task("dist-clean", distClean);
