import EventSubscriber = require("./EventSubscriber");
import EventPublisher = require("./EventPublisher");
import Errors = require("../lang/Errors");
import LoggerFactory = require("../logger/LoggerFactory");
import Logger = require("../logger/Logger");
import Functions = require("../lang/Functions");
import Maps = require("../lang/Maps");

/**
 * A {@link EventSubscriber}/{@link EventPublisher} default implementation
 */
class EventHub implements EventSubscriber, EventPublisher {

    private static LOG:Logger;
    private _name:string;
    private _warnThreshold:number = -1;
    private _listeners:Map<string, Function[]> = Maps.createMap<Function[]>();

    constructor(name:string = "unknown", warnThreshold:number = -1) {
        this._name = name;
        this._warnThreshold = warnThreshold;
    }


    public subscribeEvent(name:string, listener:Function, listenerObject?:Object) {

        var f:Function = listener;
        if( listenerObject !== undefined ) {
            // we need to bind the listener to its instance first.
            f = Functions.bind(listener, listenerObject)
        }

        this.register(name, f);

    }

    public unsubscribeEvent(name:string, listener:Function) {
        this.unregister(name, <Function> listener);
    }


    /**
     * Provides all event listeners for a given event
     * @param eventName  The event
     * @returns The listeners or null if none registered
     */
    public getSubscribers(eventName:string):Function[] {
        var result:Function[]  =  this._listeners.get(eventName);
        if( result === undefined ) {
            return null;
        }
        else {
            return result;
        }
    }

    /**
     * Notifies all listeners
     * @param name The event name
     * @param args Arguments to be passed to the listeners
     */
    public publishEvent(name:string, ... args):void {

        if( this.hasSubscriber(name) ) {
            var listeners:Function[] = this._listeners.get(name);
            for( var i:number = 0; i<listeners.length; i++ ) {
                var listener:Function = listeners[i];
                try {
                    // note: need to use #apply here in order to do the correct "argument unpacking"
                    listener.apply(listener, args);
                }
                catch(e) {
                    // just write a log message
                    EventHub.getLogger().warn("Error notifying listener {0} about event {1}", listener, name, e);
                }
            }
        }
        // else: no such listeners
    }


    /**
     * Checks whether this instance has listeners for a certain event
     * @param name The event name
     */
    public hasSubscriber(name:string):boolean {
        return this._listeners.has(name);
    }


    public toString():string {
        return "EventHub[name="+this._name+"]";
    }

    // ===========================

    private register(eventName:string, listener:Function):void {

        var listeners:Function[] = this._listeners.get(eventName);
        if( listeners === undefined || listeners === null ) {
            listeners = [];
            this._listeners.set(eventName, listeners);
        }

        if( this._warnThreshold > -1 && listeners.length >= this._warnThreshold ) {
            EventHub.getLogger().warn("EventHub {0} reached limit of {1} entries for event {2}", this._name, this._warnThreshold, eventName);
        }

        listeners.push(listener);
    }

    private unregister(eventName:string, listener:Function):void {

        var listeners:Function[] = this._listeners.get(eventName);
        if( listeners !== undefined && listeners !== null) {

            var found:boolean = false;

            var newListeners:Function[] = [];
            for( var i:number = 0; i<listeners.length; i++ ) {
                if( listener !== listeners[i] ) {
                    newListeners.push(listeners[i]);
                }
                else {
                    found = true;
                }
            }
            this._listeners.set(eventName, newListeners);

            if( !found ) {
                throw Errors.createIllegalArgumentError("Event listener "+listener+" is not registered for event "+eventName);
                //EventHubt.getLogger().warn("Couldn't unregister event listener {0} for event {1} since it does not exist", listener, eventName);
            }
        }
        else {
            throw Errors.createIllegalArgumentError("Event listener "+listener+" is not registered for event "+eventName);
        }
    }

    private static getLogger():Logger {
        if( !EventHub.LOG ) {
            EventHub.LOG = LoggerFactory.getLogger(EventHub);
        }
        return EventHub.LOG;
    }
}

export = EventHub;