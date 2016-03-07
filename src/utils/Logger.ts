import * as log4js from 'log4js';
log4js.configure({
  "appenders": [
    {
      "type": "console",
      "level": "TRACE"
    }
  ],
  "replaceConsole": true
});

export default log4js;
