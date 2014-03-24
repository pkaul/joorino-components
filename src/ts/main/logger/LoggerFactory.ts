import Logger = require("./Logger");

/**
 * A logger that does not nothing
 */
class NoopLogger implements Logger {
    public debug(message:string, ...params):void {}
    public info(message:string, ...params):void {}
    public warn(message:string, ...params):void {}
    public error(message:string, ...params):void {}
    public isDebugEnabled():boolean { return false; }
    public isInfoEnabled():boolean { return false; }
    public isWarnEnabled():boolean { return false; }
    public isErrorEnabled():boolean { return false; }
}

/**
 * Factory for providing logger instances
 */
class LoggerFactory {

    // a default logger instance
    private static DEFAULT:Logger = new NoopLogger();

    private static delegate:Function = null;

    /**
     * Binds a function for creating logger instances on this factory
     * @param factory The factory. It is expected that it has a function 'getLogger(name:String)'
     */
    public static bind(factory:Function):void {
        LoggerFactory.delegate = factory;
    }

    /**
     * Provides a logger instance
     * @param name The logger name or an object for that a logger shall be acquired
     * @return The logger
     */
    public static getLogger(name:any):Logger {

        var result:Logger;

        if( LoggerFactory.delegate !== null ) {
            // there is a delegate. invoke it.
            result = LoggerFactory.delegate(name);
        }
        else {
            // if it does not exist: Use the default
            result = LoggerFactory.DEFAULT;
        }

        return result;
    }
}


export = LoggerFactory;
