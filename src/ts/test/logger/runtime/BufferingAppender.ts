import FormattingAppender = require("../../../main/logger/runtime/appender/FormattingAppender");
import Level = require("../../../main/logger/runtime/formatter/Level");

/**
 * An appender for test purposes
 */
class BufferingAppender extends FormattingAppender {

    private _messages:string[] = [];

    public getMessages():string[] {
        return this._messages;
    }

    //[Override]
    public appendFormatted(level:Level, message:string):void {
        this._messages.push(message);
    }
}
export = BufferingAppender;