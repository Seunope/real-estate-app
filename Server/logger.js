const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  //exitOnError: false,

  level: "info",
  format: format.combine(
    format.splat(),
    format.simple(),
    format.timestamp()
    //format.prettyPrint()
  ),
  transports: [
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.simple(),
    }),
    new transports.File({ filename: "combined.log" }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: "exceptions.log",
      format: format.simple(),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

module.exports = logger;
