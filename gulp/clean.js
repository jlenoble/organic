import {task} from "gulp";
import del from "del";

export const clean = () => {
  return del("build");
};

task("clean", clean);
