/**
 * Manages a function invocation that shall be delayed.
 */
class DelayedExecution {

    private _executor:Function;
    private _executed:boolean = false;
    private _handle:number;

    /**
     * @param executor The function to be invoked
     * @param delay The delay in millis
     */
    constructor(executor:Function, delay:number) {
        this._executor = executor;
        this._handle = window.setTimeout(() => {this.execute()}, delay);
    }

    /**
     * Cancels the scheduled execution
     */
    public cancel():void {
        window.clearTimeout(this._handle);
    }

    /**
     * @return True, if the execution has already taken place
     */
    public hasExecuted():boolean {
        return this._executed;
    }

    // ========

    private execute():void {
        this._executed = true;
        this._executor();
    }
}
export = DelayedExecution;