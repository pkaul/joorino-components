import FormattingAppender = require("./FormattingAppender");
import Level = require("../formatter/Level");
import Console = require("../../../lang/Console");

/**
 * An appender that writes to the console
 */
class ConsoleAppender extends FormattingAppender {

    //[Override]
    appendFormatted(level:Level, message:string):void {

        switch (level) {

            case Level.DEBUG:
                Console.debug(message);
                break;
            case Level.INFO:
                Console.info(message);
                break;
            case Level.WARN:
                Console.warn(message);
                break;
            case Level.ERROR:
                Console.error(message);
                break;
            case Level.FATAL:
                Console.error(message);
                break;
            default:
                Console.log(message);
                break;
        }
    }

    public toString():string {
        return "ConsoleAppender[]";
    }
}

export = ConsoleAppender;