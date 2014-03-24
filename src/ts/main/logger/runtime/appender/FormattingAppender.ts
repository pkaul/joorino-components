import Appender = require("./Appender");
import Formatter = require("../formatter/Formatter");
import DefaultFormatter = require("../formatter/DefaultFormatter");
import Level = require("../formatter/Level");


/**
 * An (abstract) appender that formats the message into a string
 */
class FormattingAppender implements Appender {

    private static FORMATTER:Formatter = new DefaultFormatter();

    private _name:string;

    public getName():string {
        return this._name;
    }

    public setName(value:string) {
        this._name = value;
    }

    public append(name:string, level:Level, time:Date, message:string, error:Error):void {
        var message:string = FormattingAppender.FORMATTER.format(name, level, time, message, error);
        this.appendFormatted(level, message);
    }

    //[Abstract]
    appendFormatted(level:Level, message:string):void {
        // to be overridden
    }
}

export = FormattingAppender;