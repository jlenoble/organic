import { task, series } from "gulp";

import "./test";
import "./todos";
import "./watch";

task("tdd", series("test", "todos", "watch"));
