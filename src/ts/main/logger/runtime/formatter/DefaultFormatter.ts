import Formatter = require("./Formatter");
import Level = require("./Level");
import LevelHelper = require("./LevelHelper");

class DefaultFormatter implements Formatter {

    public format(name:string, level:Level, date:Date, message:string, error:Error):string {

        var t:string = DefaultFormatter.formatTime(date);
        var l:string = LevelHelper.format(level);
        var e:string = DefaultFormatter.formatError(error);

        var result:string = l+" "+t+" ["+name+"] "+message;
        if( e != null ) {
            result += "\n"+e;
        }


        return result;
    }

    // ==============================

    private static formatTime(time:Date):string {
        return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    }

    private static formatError(error:Error):string {

        if( error != null ) {

            if( error['stack'] !== undefined ) {  // chrome
                return error.message+"\n"+error['stack']
            }
            else {
                return error.message
            }
        }
        else {
            return null;
        }
    }
}

export = DefaultFormatter;