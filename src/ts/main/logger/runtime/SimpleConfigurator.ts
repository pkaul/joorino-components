import Level = require("./formatter/Level");
import LevelHelper = require("./formatter/LevelHelper");
import Console = require("../../lang/Console");
import LoggerEngine = require("./LoggerEngine");
import ConsoleAppender = require("./appender/ConsoleAppender");



/**
 * A simple logging configurator
 */
class SimpleConfigurator {

    /**
     * Configures the entire logging engine to log everyhing with a certain level
     * @param level The level, e.g. "info", "debug", ...
     */
    public static configure(level:string = "info"):void {

        var l:Level = LevelHelper.parse(level);

        Console.info("Simple logging configuration");
        LoggerEngine.bind(); // enable
        var provider:LoggerEngine = LoggerEngine.getInstance();
        var a:ConsoleAppender = new ConsoleAppender();
        provider.configureLogger(LoggerEngine.ROOT_LOGGER, l, [a]);
    }

    public toString():string {
        return "SimpleConfigurator[]";
    }

}

export = SimpleConfigurator;




