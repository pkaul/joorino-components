/**
 * Manages a function that shall be invoked continuously
 */
class ContinuousExecution {

    private _handle:number;

    /**
     * @param executor The function to be invoked
     * @param interval The interval in millis
     */
    constructor(executor:Function, interval:number) {
        this._handle = window.setInterval(executor, interval);
    }

    /**
     * Cancels the scheduled execution
     */
    public cancel():void {
        window.clearInterval(this._handle);
    }
}
export = ContinuousExecution;