
import Initializable = require("../Initializable");
import Destroyable = require("../Destroyable");
import ComponentBase = require("../ComponentBase");
import ComponentManager = require("./ComponentManager");
import Classes = require("../../lang/Classes");
import Runnable = require("./../Runnable");
import Components = require("../Components");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * A component that delegates a {@link #runComponents} invocation to all {@link Runnable} implementations and
 * {@link Function}s that are registered to an underlying {@link ComponentManager}.
 * Note: When registering a function, keep in mind that that the function's binding might be important!
 */
class ComponentManagerRunner extends ComponentBase {

    private _componentManager:ComponentManager;
    private _runnables:Runnable[] = null;
    private _functions:Function[] = null;
    private _stopped:boolean = true;
    private _runFunctions:boolean;

    /**
     * @param componentManager The manager where the {@link Runnable}s shall be taken from
     * @param runFunctions whether or not function shall be executed, too. Default: true.
     */
    constructor(componentManager:ComponentManager, runFunctions:boolean = true) {
        super();
        this._componentManager = componentManager;
        this._runFunctions = runFunctions;
    }

    public init():Promise<any> {
        return super.init().then(() => {
            this._componentManager.subscribeEvent(ComponentManager.EVENT_REGISTERED, this.invalidate, this);
            this._componentManager.subscribeEvent(ComponentManager.EVENT_UNREGISTERED, this.invalidate, this);
            return Promise.resolve();
        });
    }

    public destroy():Promise<any> {
        return super.destroy().then(() => {
            this._componentManager.unsubscribeEvent(ComponentManager.EVENT_REGISTERED, this.invalidate);
            this._componentManager.unsubscribeEvent(ComponentManager.EVENT_UNREGISTERED, this.invalidate);
            return Promise.resolve();
        });
    }


    public start():void {
        super.start();
        this._stopped = false;
    }


    public stop():void {
        super.stop();
        this._stopped = true;
    }

    /**
     * Runs all components of the component manager.
     */
    public runComponents():void {

        // run all runnables
        var runnables:Runnable[] = this.getRunnables();
        for( var i:number=0; i<runnables.length; i++ ) {
            if(this._stopped) {
                // don't proceed if everything has been stopped in the meantime
                return;
            }
            runnables[i].run();
        }

        // run all functions
        var functions:Function[] = this.getFunctions();
        for( var j:number=0; j<functions.length; j++ ) {
            if(this._stopped) {
                // don't proceed if everything has been stopped in the meantime
                return;
            }
            functions[j]();
        }
    }

    // =====================

    private getRunnables():Runnable[] {
        if( this._runnables === null ) {
            this.computeEntities();
        }
        return this._runnables;
    }

    private getFunctions():Function[] {

        if( this._functions === null ) {
            this.computeEntities();
        }
        return this._functions;
    }

    /**
     * Extracts all runnables and functions from component manager
     */
    private computeEntities():void {

        this._runnables = [];
        this._functions = [];
        this._componentManager.getComponents().forEach((c:any, id:string) => {

            if( Components.isRunnable(c) ) {
                this._runnables.push(<Runnable> c);
            }
            else if( typeof c === 'function' && this._runFunctions ) {
                this._functions.push(<Function> c);
            }
        });
    }

    /**
     * Invalidates the cached runnables and functions and forces them to be recomputed
     */
    private invalidate():void {
        this._runnables = null;
        this._functions = null;
    }
}
export = ComponentManagerRunner;
