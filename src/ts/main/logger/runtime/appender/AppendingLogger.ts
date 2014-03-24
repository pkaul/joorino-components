import Logger = require("../../Logger");
import Level = require("../formatter/Level");
import Appender = require("./Appender");

/**
 * A logger implementation that delegates to a list of {@link Appender}s
 */
class AppendingLogger implements Logger {

    private _level:Level = Level.OFF;
    private _appenders:Appender[] = [];
    private _name:string = "";

    setLevel(value:Level) {
        this._level = value;
    }

    setAppenders(value:Appender[]) {
        this._appenders = value;
    }

    setName(value:string) {
        this._name = value;
    }

    getLevel():Level {
        return this._level;
    }

    getAppenders():Appender[] {
        return this._appenders;
    }

    getName():string {
        return this._name;
    }

    // ----------

    public isDebugEnabled():boolean {
        return this._level >= Level.DEBUG;
    }

    public isInfoEnabled():boolean {
        return this._level >= Level.INFO;
    }

    public isWarnEnabled():boolean {
        return this._level >= Level.WARN;
    }

    public isErrorEnabled():boolean {
        return this._level >= Level.ERROR;
    }

    public debug(message:string, ...params:any[]):void {
        this.append(Level.DEBUG, message, params);
    }

    public info(message:string, ...params:any[]):void {
        this.append(Level.INFO, message, params);
    }

    public warn(message:string, ...params:any[]):void {
        this.append(Level.WARN, message, params);
    }

    public error(message:string, ...params:any[]):void {
        this.append(Level.ERROR, message, params);
    }

    public toString():string {
        return "Logger[name="+this._name+", level="+this._level+"]";
    }

    // =========

    private append(level:Level, message:string, params:any[]):void {

        if( this._level > level ) {
            return;
        }

        var formattedMessage:string = AppendingLogger.formatMessage(message, params);
        var error:Error = AppendingLogger.getFirstError(params);

        var time:Date = new Date();
        for( var i:number =0; i<this._appenders.length; i++ ) {
            var appender:Appender = this._appenders[i];
            appender.append(this._name, level, time, formattedMessage, error);
        }
    }

    private static formatMessage(message:string, params:any[]):string {

        var result:string = message;
        for( var i:number=0; i<params.length; i++ ) {
            if( params[i] != null ) {
                result = result.replace("{"+i+"}", params[i]);
            }
        }

        return result;
    }


    private static getFirstError(params:any[]):Error {

        for( var i:number=0; i<params.length; i++ ) {
            if( params[i] instanceof Error ) {
                return params[i];
            }
        }

        return null;
    }
}
export = AppendingLogger;