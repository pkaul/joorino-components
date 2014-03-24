import Level = require("../formatter/Level");

/**
 * Strategy for writing log messages
 */
interface Appender {
    append(name:string, level:Level, time:Date, message:string, error:Error):void;
}
export = Appender;
