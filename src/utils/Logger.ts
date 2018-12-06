import * as log4js from "log4js";
log4js.configure({
  appenders: {
    out: { type: "console" }
  },
  categories: {
    default: { appenders: [ "out" ], level: "trace" }
  }
});

export default log4js;
