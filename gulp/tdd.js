import { task, series } from "gulp";

import "./test";
import "./watch";

task("tdd", series("test", "watch"));
