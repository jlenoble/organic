import { task, series } from "gulp";

import "./test";
import "./watch";
import "./todos";

task("tdd", series("test", "todos", "watch"));
