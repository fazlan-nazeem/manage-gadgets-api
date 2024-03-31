const SimpleNodeLogger = require("simple-node-logger"),
  opts = {
    logFilePath: "logs/mylogfile.log",
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
  },
  log = SimpleNodeLogger.createSimpleLogger(opts);

log.setLevel("info");

module.exports = log;
