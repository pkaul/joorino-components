
import ObjectBase = require("../component/ObjectBase");
import Startable = require("../component/Startable");
import Stoppable = require("../component/Stoppable");
import Initializable = require("../component/Initializable");
import Destroyable = require("../component/Destroyable");
import Errors = require("../lang/Errors");

/**
 * Runs a function with a constant rate.
 */
class Runner extends ObjectBase implements Startable, Stoppable {

    private _intervalMillis:number; // the interval in millis between two executions
    private _runner:Function;
    private _running:boolean = false;

    // handle that identifies the current frame runner
    private _runnerHandle:number;

    // functions for requesting or cancelling an animation frame
    private _requestAnimationFrame:Function;
    private _cancelAnimationFrame:Function;
    private _lastExecutionWasError:boolean = false;

    /**
     * @param runner The function to be invoked with a fixed rate
     * @param fps The frames per second. Default: 60
     * @param name object name (makes it easier to debug)
     */
     constructor(runner:Function, fps:number = 60, name?:string) {
        super(name);

        //super("Runner[id="+(id++)+"]");
        this._runner = runner;
        this._intervalMillis = 1000 / fps;
        //this._fpsStatistics = new DefaultFrameStatistics(this._time);
        this._requestAnimationFrame =   window.requestAnimationFrame && window.requestAnimationFrame.bind(window) ||
                                        window['mozRequestAnimationFrame'] && window['mozRequestAnimationFrame'].bind(window) ||
                                        window['webkitRequestAnimationFrame']  && window['webkitRequestAnimationFrame'].bind(window) ||
                                        window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window);
        this._cancelAnimationFrame =    window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window) ||
                                        window['mozCancelAnimationFrame']  && window['mozCancelAnimationFrame'].bind(window) ||
                                        window['webkitCancelAnimationFrame']  && window['webkitCancelAnimationFrame'].bind(window) ||
                                        window['msCancelAnimationFrame']  && window['msCancelAnimationFrame'].bind(window);

        this.getLogger().debug("Execution runner: requestAnimationFrame={0}, cancelAnimationFrame={1}", this._requestAnimationFrame !== undefined, this._cancelAnimationFrame !== undefined);
    }

    public start():void {

        if( this._running ) {

            // already running.
            return;
        }

        // initial invocation
        this.scheduleNextExecution(this._intervalMillis);
        this._running = true;
        this.getLogger().info("Started");
    }

    public stop():void {

        if( !this._running  ) {
            // not running or stop already requested.
            return;
        }

        this._running = false;

        this.cancelNextExecution();
        this.getLogger().info("Stopped");
    }


    /**
     * Indicates whether this runner is currently running
     */
    public isRunning():boolean {
        return this._running;
    }


// ============

    /**
     * Will be called on every frame begin. May be overridden.
     * @return A (optional) handle that will be passed to {@link #endFrame}
     * @protected
     */
    public beginFrame():any {}

    /**
     * Will be called on every frame end. May be overridden.
     * @param handle The handle that has been provided by {@link #beginFrame}
     * @protected
     */
    public endFrame(handle:any):void {}


    private doRun():void {

        if( !this._running  ) {
            return;
        }

        try {

            // 1.) run ...
            //this._fpsStatistics.frameBegin();
            var begin:number = Date.now();
            var handle:any = this.beginFrame();
            try {
                this._runner();
                this._lastExecutionWasError = false;
            }
            catch (e) {
                if( !this._lastExecutionWasError ) { // don't flood the logs!
                    this.getLogger().warn("Error invoking runner", e);
                    this._lastExecutionWasError = true;
                    alert(Errors.format(e)); // TODO: make this optional
                }
            }
            this.endFrame(handle);
            var duration:number = Date.now()-begin;
            this.scheduleNextExecution(duration);

        }
        catch(e) {
            this.getLogger().error("Error running: {0}", e.message, e);
            alert(Errors.format(e)); // TODO: make this optional
            throw e;
        }
    }

    private scheduleNextExecution(lastExecutionDuration:number):void {

        if( this._requestAnimationFrame !== undefined ) {

            // request animation frame available
            this._runnerHandle = this._requestAnimationFrame(() => this.doRun());
        }
        else {

            // request animation frame not available. Falling back to #setTimeout
            // compute time for next execution
            var nextFrameDelay:number = this._intervalMillis-lastExecutionDuration;
            if( nextFrameDelay  < 0 ) {
                // next execution has already been skipped. Try to get in sync again
                nextFrameDelay = 0;
            }

            // scheduling next execution
            this._runnerHandle = window.setTimeout(() =>  this.doRun(), nextFrameDelay);
        }
    }

    private cancelNextExecution():void {

        if( this._requestAnimationFrame !== undefined ) {
            this._cancelAnimationFrame(this._runnerHandle);
        }
        else {
            window.clearTimeout(this._runnerHandle);
        }
    }

}
export = Runner;
