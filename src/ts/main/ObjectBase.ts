import Identifiable = require("./Identifiable");
import EventSubscriber = require("./event/EventSubscriber");
import EventHub = require("./event/EventHub");
import EventPublisher = require("./event/EventPublisher");
import Classes = require("./Classes");
import assert = require("./assert");
import Logger = require("./logger/Logger");
import LoggerFactory = require("./logger/LoggerFactory");

/**
 * A basic implementation of an object: Provides a logger, an event listener etc.
 */
class ObjectBase implements EventSubscriber, Identifiable {

    private static INSTANCEID_COUNT = 0;

    private _log:Logger;
    private _eventHub:EventHub;
    private _name:string;
    private _instanceNumber:number;
    private _id:string;


    constructor(name:string = null) {
        this._name = name;
    }

    public subscribeEvent(name:string, listener:Function, listenerObject?:Object):void {
        this.getEventHub().subscribeEvent(name,  listener, listenerObject);
    }

    public unsubscribeEvent(name:string, listener:Function):void {
        this.getEventHub().unsubscribeEvent(name,  listener);
    }



    public getId():string {
        if( this._id === undefined ) {
            // compute id automatically
            this._id = this.getName()+this.getInstanceNumber();
        }
        return this._id;
    }

    /**
     * @return A string that reflects this object's class
     */
    public toString():string {
        return this.getName()+"[]";
    }


    // ========


    /**
     * @see assert
     */
    // [PROTECTED]
    public assert(condition:boolean, message?:string, p1?:any, p2?:any, p3?:any, p4?:any, p5?:any):void {
        assert(condition, message, p1, p2, p3, p4, p5);
    }


    /**
     * @return A logger for this instance
     * [PROTECTED]
     */
    public getLogger():Logger {
        if( this._log === null || this._log === undefined ) {
            this._log = LoggerFactory.getLogger(this.getName());
        }

        return this._log;
    }

    // [PROTECTED]
    public getEventPublisher():EventPublisher {
        return this.getEventHub();
    }

    // [PROTECTED]
    public getName():string {
        if( this._name === undefined || this._name === null) {
            this._name = Classes.getClassName(this);
        }
        return this._name;
    }


    /**
     * An number for this instance. To be internally used for identification.
     * [PROTECTED]
     */
    public getInstanceNumber():number {
        if(this._instanceNumber === undefined )  {
            // no instance id has been generated. generate one
            if( ObjectBase.INSTANCEID_COUNT === Number.MAX_VALUE ) {
                // maximum number reached. start from the beginning.
                ObjectBase.INSTANCEID_COUNT = 0;
            }
            this._instanceNumber = ObjectBase.INSTANCEID_COUNT++;
        }
        return this._instanceNumber;
    }


    // =========

    private getEventHub():EventHub {
        if( this._eventHub == undefined || this._eventHub == null ) {
            // create new instance on-demand only
            this._eventHub = new EventHub(this.getName());
        }
        return this._eventHub;
    }
}

export = ObjectBase;