import Level = require("./Level");

/**
 * Formatter for logging messages
 */
 interface Formatter {

    /**
     * Formats a logging record
     * @param name The logger name
     * @param level The log level
     * @param date The message date
     * @param message The message
     * @param error An optional error
     * @return The formatted message
     */
    format(name:string, level:Level, date:Date, message:string, error:Error):string;
}

export = Formatter;