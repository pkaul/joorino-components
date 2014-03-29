
import ObjectBase = require("./../ObjectBase");
import Initializable = require("./Initializable");
import Destroyable = require("./Destroyable");
import Startable = require("./Startable");
import Stoppable = require("./Stoppable");
import Components = require("./Components");
import Errors = require("../Errors");
/// <reference path="../../es6-promises/es6-promises.d.ts"/>

/**
 * A basic implementation of a component that is aware of a lifecycle. The component's lifecycle state is managed internally.
 */
class ComponentBase extends ObjectBase implements Initializable, Destroyable, Startable, Stoppable {

    public static STATE_CREATED:number      = 0;
    public static STATE_INITIALIZED:number  = 1;

    public static STATE_STARTED:number      = 10;
    public static STATE_STOPPED:number      = 11;

    public static STATE_DESTROYED:number    = 100;

    private _state:number = ComponentBase.STATE_CREATED;

    constructor(name:string=null) {
        super(name);
    }


    /**
     * Initializes the component by changing the state and notifying listeners.
     */
    public init():Promise<any> {
        this.getLogger().debug("Initializing ...");
        this.assertNotInitialized();
        this._state = ComponentBase.STATE_INITIALIZED;
        Components.publishInitialized(this.getEventPublisher(), this);
        this.getLogger().info("Initialized");
        return Promise.resolve();
    }

    /**
     * Destroys the component by changing the state and notifying listeners.
     */
    public destroy():Promise<any> {
        if( this._state < ComponentBase.STATE_DESTROYED ) {
            this.getLogger().debug("Destroying ...");
            // not destroyed yet
            this._state = ComponentBase.STATE_DESTROYED;
            Components.publishDestroyed(this.getEventPublisher(), this);
            this.getLogger().info("Destroyed");
        }
        return Promise.resolve();
    }

    /**
     * Starts the component by changing the state and notifying listeners.
     */
    public start():void {
        this.getLogger().debug("Starting ...");
        this.assertInitialized();
        if( this._state !== ComponentBase.STATE_STARTED ) {
            // don't do anything when the component is already running
            Components.publishStarted(this.getEventPublisher(), this);
            this._state = ComponentBase.STATE_STARTED;
            this.getLogger().info("Started");
        }
        else {
            this.getLogger().debug("Don't starting {0} since it has been already started", this)
        }
    }

    /**
     * Stops the component by changing the state and notifying listeners.
     */
    public stop():void {
        this.getLogger().debug("Stopping ...");
        this.assertInitialized();
        if( this._state !== ComponentBase.STATE_STOPPED ) {
            // don't do anything when the component is already stopped
            Components.publishStopped(this.getEventPublisher(), this);
            this._state = ComponentBase.STATE_STOPPED;
            this.getLogger().info("Stopped");
        }
        else {
            this.getLogger().debug("Don't stopping {0} since it has been already stopped", this)
        }
    }



    /**
     * @return The current state
     */
    public getState():number {
        return this._state;
    }


    // ========

    /**
     * Asserts that this component is at least initialized and not destroyed. If not, an error is thrown
     */
    private assertInitialized():void {
        if( this._state < ComponentBase.STATE_INITIALIZED || this._state >= ComponentBase.STATE_DESTROYED ) {
            throw Errors.createIllegalStateError("Component "+this+" is not or no more 'initialized' but in state '"+this.getStateAsString()+"'");
        }
    }

    /**
     * Asserts that this component is not initialized yet. If not true, an error is thrown
     */
    private assertNotInitialized():void {
        if( this._state !== ComponentBase.STATE_CREATED ) {
            throw Errors.createIllegalStateError("Could not initialize "+this+". State is already '"+this.getStateAsString()+"'");
        }
    }


    /**
     * @return The current state as human readable string
     */
    private getStateAsString():string {
        switch (this._state ) {
            case ComponentBase.STATE_CREATED:
                return "created";
            case ComponentBase.STATE_INITIALIZED:
                return "initialized";
            case ComponentBase.STATE_STARTED:
                return "started";
            case ComponentBase.STATE_STOPPED:
                return "stopped";
            case ComponentBase.STATE_DESTROYED:
                return "destroyed";
            default:
                return "unknown("+this._state+")";
        }
    }
}

export = ComponentBase;