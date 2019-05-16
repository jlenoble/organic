import { task } from "gulp";
import del from "del";

export const handleClean = () => {
  return Promise.all([del("build")]);
};

task("clean", handleClean);
