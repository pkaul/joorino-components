

import Level = require("./formatter/Level");
import AppendingLogger = require("./appender/AppendingLogger");
import Appender = require("./appender/Appender");
import LoggerFactory = require("../LoggerFactory");
import Logger = require("../Logger");
import Classes = require("../../Classes");



/**
 * An (internal) logger configuration
 */
class LoggerConfig {

    private _level:Level;
    private _appenders:Appender[];

    constructor(level:Level, appenders:Appender[]) {
        this._level = level;
        this._appenders = appenders;
    }

    public getLevel():Level {
        return this._level;
    }

    public getAppenders():Appender[] {
        return this._appenders;
    }
}


/**
 * A logger implementation that supports
 */
class LoggerEngine {

    private static DEFAULT_CONFIG:LoggerConfig = new LoggerConfig(Level.OFF, []);

    public static ROOT_LOGGER:string = "";

    private static _instance:LoggerEngine = null;
    private _configs:Object/*<string,LoggerConfig>*/ = {};
    private _loggers:Object/*<string,AppendingLogger>*/ = {};

    public static getInstance():LoggerEngine {

        if( LoggerEngine._instance === null ) {
            LoggerEngine._instance = new LoggerEngine();
        }
        return LoggerEngine._instance;
    }


    /**
     * Enables this logger implementation by binding to {@link LoggerFactory}
     */
    public static bind():void {

        var engine:LoggerEngine = LoggerEngine.getInstance();
        var factoryFunction:Function = function(name:any) {
            return engine.getLogger(name)
        };

        // injects LoggerEngine#getLogger as factory function
        LoggerFactory.bind(factoryFunction);
    }

    /**
     * Provides a logger instance for a given name
     * @param name The name. Either a class or a string
     * @return
     */
    public getLogger(name:any):Logger {

        var n:string = LoggerEngine.computeName(name);
        var result:Logger = this._loggers[n];

        // no such logger obtained before
        if( result === undefined ) {

            var newLogger:AppendingLogger = new AppendingLogger();
            var cfg:LoggerConfig = this.getEffectiveConfig(n);

            newLogger.setName(n);
            newLogger.setLevel(cfg.getLevel());
            newLogger.setAppenders(cfg.getAppenders());

            result = newLogger;
            this._loggers[n] = result;
        }

        return result;
    }


    /**
     * Configures a single logger
     * @param name The logger name
     * @param level The logger level
     * @param appenders The appenders
     */
    public configureLogger(name:string, level:Level, appenders:Appender[]):void {

        // -- store config
        this._configs[name] = new LoggerConfig(level, appenders);
        this.reconfigure();
    }


    // ===============

    /**
     * Apply config to existing logger
     */
    public reconfigure():void {

        for( var ln in this._loggers ) {
            if( this._loggers.hasOwnProperty(ln) ) {
                var logger:AppendingLogger = this._loggers[ln];
                var cfg:LoggerConfig = this.getEffectiveConfig(ln);
                logger.setAppenders(cfg.getAppenders());
                logger.setLevel(cfg.getLevel());
            }
        }
    }


    public reset():void {
        this._configs = {};
        this.reconfigure();
    }

    /**
     * Provides the effective config for a logger
     * @return The config
     */
     private getEffectiveConfig(name:string):LoggerConfig {

        // walk logger name hierarchy up and look for a configured logger
        var result:LoggerConfig = undefined;
        var currentName:string = name;
        do {

            result = this._configs[currentName];
            if( currentName === LoggerEngine.ROOT_LOGGER ) {
                break; // nothing more to do
            }
            // walk up
            currentName = LoggerEngine.getParentLoggerName(currentName);
        }
        while( result === undefined );

        return result === undefined ? LoggerEngine.DEFAULT_CONFIG : result;
    }

    private getConfigNames():string[] {

        var result:string[] = [];
        for (var name in this._configs) {
            if (this._configs.hasOwnProperty(name)) {
                result.push(name);
            }
        }

        return result;
    }



    private static getParentLoggerName(name:string):string {

        var i:number = name.lastIndexOf('.');
        if( i > -1 ) {

            return name.substr(0, i);
        }
        else {

            return LoggerEngine.ROOT_LOGGER;
        }
    }


    private static computeName(name:any):string {

        if( typeof name === 'string' ) {
            return name;
        }
        else {
            return Classes.getClassName(name);
        }
    }
}






export = LoggerEngine;

