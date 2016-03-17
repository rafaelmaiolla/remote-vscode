import * as log4js from 'log4js';
log4js.configure({
  "appenders": [
    {
      "type": "console",
      "level": "TRACE"
    }
  ]
});

export default log4js;
