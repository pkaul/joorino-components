import Level = require("./Level");

/**
 * Helper when dealing with {@link Level}
 */
class LevelHelper {

    /**
     * Parses logging level string into the constant
     */
    public static parse(level:string):Level {

        var l:string = level.replace(/^\s+|\s+$/g, '').toLowerCase(); // trim and lowercase
        if( l === 'debug' || l === 'all' || l === 'd') {
            return Level.DEBUG;
        }
        else if ( l === 'info' || l === 'i') {
            return Level.INFO;
        }
        else if ( l === 'warn' || l === 'w') {
            return Level.WARN;
        }
        else if ( l === 'error' || l === 'e') {
            return Level.ERROR;
        }
        else {
            // fallback
            return Level.OFF;
        }
    }

    public static format(level:Level):string {

        switch (level) {

            case Level.DEBUG:
                return "DEBUG";
            case Level.INFO:
                return "INFO";
            case Level.WARN:
                return "WARN";
            case Level.ERROR:
                return "ERROR";
            case Level.FATAL:
                return "FATAL";
            default:
                return "OFF";
        }
    }

    public static formatToShort(level:number):string {

        switch (level) {

            case Level.DEBUG:
                return "D";
            case Level.INFO:
                return "I";
            case Level.WARN:
                return "W";
            case Level.ERROR:
                return "E";
            case Level.FATAL:
                return "F";
            default:
                return "-";
        }
    }

}

export = LevelHelper;
