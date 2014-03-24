
/**
 * A logger for writing messages
 */
interface Logger {

    /**
     * Writes a debug message
     * @param message The message. Might contain placeholder tokens ({0}, {1}, {2}, ...) are will be replaced by the parameters
     * @param params placeholder replacements
     */
    debug(message:string, ...params:any[]):void;

    /**
     * Writes an info message
     */
    info(message:string, ...params:any[]):void;

    /**
     * Writes a warn message
     */
    warn(message:string, ...params:any[]):void;

    /**
     * Writes an error message
     */
    error(message:string, ...params:any[]):void;

    /**
     * @return Indicates whether logging is enabled for level "debug"
     */
    isDebugEnabled():boolean;

    isInfoEnabled():boolean;

    isWarnEnabled():boolean;

    isErrorEnabled():boolean;
}

export = Logger;















