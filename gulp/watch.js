import { task, watch, parallel } from "gulp";
import path from "path";
import del from "del";
import { handleBuild as build } from "./build";
import { handleTest as test } from "./test";
import { todoGlob, todoCheck } from "./todo";
import "./package-watch";

const buildDir = "build";
const srcGlob = ["src/**/*.ts", "test/**/*.ts", "src/**/*.js", "test/**/*.js"];
const buildGlob = ["build/src/**/*.js", "build/test/**/*.js"];

export const startWatching = (done) => {
  const watcher = watch(srcGlob, { events: ["add", "change"] }, build);

  watcher.on("unlink", (file) => {
    const buildFile = path.join(buildDir, file.replace(/(\.[\w]+)$/, ".js"));
    const mapFile = path.join(buildDir, file.replace(/(\.[\w]+)$/, ".js.map"));
    del(buildFile).catch(() => {});
    del(mapFile).catch(() => {});
  });

  watch(buildGlob, test);
  watch(todoGlob, todoCheck);

  done();
};

task("watch", parallel(startWatching, "package-watch"));
