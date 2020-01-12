import winston from "winston";

/**
 * logging helper class
 */
export default class Logger {
    public static logger: winston.Logger;

    constructor() {
        Logger.logger = winston.createLogger({
            level: "info",
            format: winston.format.json(),
            defaultMeta: {},
        });

        if (process.env.NODE_ENV !== "production") {
            Logger.logger.level = "debug";
            Logger.logger.add(new winston.transports.Console({
                format: winston.format.prettyPrint(),
            }));
        } else {
            Logger.logger.add(new winston.transports.File({
                filename: "logs/error.log",
                level: "error",
            }));
            Logger.logger.add(new winston.transports.File({
                filename: "logs/combined.log",
            }));
        }
    }
}