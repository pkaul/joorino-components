
import Initializable = require("../Initializable");
import Destroyable = require("../Destroyable");
import ComponentBase = require("../ComponentBase");
import ComponentManager = require("./ComponentManager");
import Classes = require("../../Classes");
import Runnable = require("./../Runnable");
import Components = require("../Components");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * A {@link Runnable} bean that delegates to all {@link Runnable}s and {@link Function}s that are registered to
 * an underlying {@link ComponentManager}.
 * Note: When registering a function, keep in mind that that the function's binding might be important!
 */
class ComponentManagerRunnable extends ComponentBase implements Runnable {

    private _componentManager:ComponentManager;
    private _runnables:Runnable[] = null;
    private _functions:Function[] = null;
    private _stopped:boolean = true;

    /**
     * @param componentManager The manager where the {@link Runnable}s shall be taken from
     */
    constructor(componentManager:ComponentManager) {
        super();
        this._componentManager = componentManager;
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

    public run():void {

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
        var beans:any[] = this._componentManager.getComponents();
        for( var i:number = 0; i<beans.length; i++ ) {

            var b:Object = beans[i];
            if( Components.isRunnable(b)  && !(b instanceof ComponentManagerRunnable) ) {     // don't run this runner!
                this._runnables.push(<Runnable> b);
            }
            else if( typeof b === 'function' ) {
                this._functions.push(<Function> b);
            }
        }
    }

    /**
     * Invalidates the cached runnables and functions and forces them to be recomputed
     */
    private invalidate():void {
        this._runnables = null;
        this._functions = null;
    }
}
export = ComponentManagerRunnable;
