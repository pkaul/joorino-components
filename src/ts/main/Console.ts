/**
 * The "standard out" console
 */
class Console {

    private static logAvailable:boolean = window !== undefined && window.console !== undefined && console.log !== undefined;
    private static infoAvailable:boolean = window !== undefined && window.console !== undefined && console.info !== undefined;
    private static warnAvailable:boolean = window !== undefined && window.console !== undefined && console.warn !== undefined;
    private static errorAvailable:boolean = window !== undefined && window.console !== undefined && console.error !== undefined;
    private static debugAvailable:boolean = window !== undefined && window.console !== undefined && window.console.debug !== undefined;

    /**
     * Writes a message to the console
     */
    public static log(message:string):void {
        if (Console.logAvailable) {
            window.console.log(message);
        }
        // else: no logger available
    }

    public static info(message:string):void {
        if (Console.infoAvailable) {
            window.console.info(message);
        }
        else {
            Console.log(message);
        }
    }

    public static warn(message:string):void {
        if (Console.warnAvailable) {
            window.console.warn(message);
        }
        else {
            Console.log(message);
        }
    }

    public static debug(message:string):void {
        if (Console.debugAvailable) {
            window.console.debug(message);
        }
        else {
            Console.log(message);
        }
    }

    public static error(message:string):void {
        if (Console.errorAvailable) {
            window.console.error(message);
        }
        else {
            Console.log(message);
        }
    }

}

export = Console;