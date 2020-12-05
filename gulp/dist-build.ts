import { src, dest, task } from "gulp";
import babel from "gulp-babel";
import { libDir, srcGlob } from "./common";

export const distBuild = (): NodeJS.ReadWriteStream => {
  return src(srcGlob).pipe(babel()).pipe(dest(libDir));
};

task("dist-build", distBuild);
