import Logger = require("./Logger");
import Console = require("../Console");
import Strings = require("../Strings");

/**
 * A logger that does not nothing
 */
//class NoopLogger implements Logger {
//    public debug(message:string, ...params):void {}
//    public info(message:string, ...params):void {}
//    public warn(message:string, ...params):void {}
//    public error(message:string, ...params):void {}
//    public isDebugEnabled():boolean { return false; }
//    public isInfoEnabled():boolean { return false; }
//    public isWarnEnabled():boolean { return false; }
//    public isErrorEnabled():boolean { return false; }
//}

/**
 * A static logger that writes warn and error messages only
 */
class WarnErrorLogger implements Logger {

    private _notConfiguredMessageLogged:boolean = false;

    public debug(message:string, ...params):void {}
    public info(message:string, ...params):void {}
    public warn(message:string, ...params):void {
        this.logNotConfiguredMessage();
        //Console.warn(Strings.format(message, params));
    }
    public error(message:string, ...params):void {
        this.logNotConfiguredMessage();
        Console.error(Strings.format(message, params));
    }
    public isDebugEnabled():boolean { return false; }
    public isInfoEnabled():boolean { return false; }
    public isWarnEnabled():boolean { return true; }
    public isErrorEnabled():boolean { return true; }

    /**
     * Writes a warn message in case that logging is not configured.
     */
    private logNotConfiguredMessage():void {
        if( !this._notConfiguredMessageLogged ) {
            this._notConfiguredMessageLogged = true;
            Console.warn("Logging environment has not been configured properly. Level 'error' is enabled only.");
        }
    }
}

/**
 * Factory for providing logger instances
 */
class LoggerFactory {

    // a default logger instance
    private static DEFAULT:Logger = new WarnErrorLogger();

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
