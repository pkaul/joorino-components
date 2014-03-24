import Initializable = require("./../Initializable");
import Destroyable = require("./../Destroyable");
import Stoppable = require("./../Stoppable");
import Startable = require("./../Startable");
import Components = require("./../Components");
import ComponentBase = require("./../ComponentBase");
import Events = require("../../event/Events");
import EventSubscriber = require("../../event/EventSubscriber");
import Logger = require("./../../logger/Logger");
import LoggerFactory = require("./../../logger/LoggerFactory");
import Errors = require("../../Errors");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * A container that holds and manages the lifecycle of components. These need to be explicitly {@link #register registered}.
 * After having {@link #register registered} a component, the entire
 * lifecycle is done automatically, e.g. the component is initialized, started, stopped and destroyed in sync of this
 * container's lifecycle. In addition, a {@link Components.EVENT_FINISHED} event from the component itself
 * is taken into account.
 */
class ComponentManager extends ComponentBase /*implements Initializable, Startable, Stoppable, Destroyable*/ {

    /**
     * Name of an event that is raised when a component is {@link #register}ed
     *  The first argument of this event is the component itself while the second is the this event name.
     */
    public static EVENT_REGISTERED:string = "registered";

    /**
     * Name of an event that is raised when a component is {@link #unregister}ed
     *  The first argument of this event is the component instance itself while the second is the this event name.
     */
    public static EVENT_UNREGISTERED:string = "unregistered";


    private _components:any[] = [];
    private _lifecycleTimeout:number = 5000;    // TODO

    constructor(name?:string) {
        super(name);
    }

    /**
     * Adds a new bean to this container. If lifecycle events ({@link Components#EVENT_INITIALIZED}, {@link Components#EVENT_STARTED})
     *  have been applied to this container already then
     *  the bean's state will be adjusted by "replaying" the lifecycle. A bean that fires {@link Components#EVENT_FINISHED}
     *  will be stopped, destroyed and unregistered.
     *
     * @param component The bean
     * @return This container
     */
    public register(component:Object):void {

        // store the component internally
        this._components.push(component);

        // bring the component's state up-to-date
        this.adjustState(component);

        // detect certain events of component so that component can be unregistered automatically
        if( Events.isEventSubscriber(component)) {
            (<EventSubscriber> component).subscribeEvent(Components.EVENT_FINISHED, this.componentFinished, this);
        }

        // notify listeners that a component has been registered
        this.getEventPublisher().publishEvent(ComponentManager.EVENT_REGISTERED, component, ComponentManager.EVENT_REGISTERED);
    }


    /**
     * Unregister a component. Does nothing when no such component has been registered before
     */
    public unregister(component:Object):void {

        // lookup component
        var componentIndex:number = this._components.indexOf(component);
        if( componentIndex > -1 ) {

            // remove component from array. TODO reuse array for GC reasons
            var newComponents:any[] = this._components.slice(0, componentIndex);
            newComponents = newComponents.concat(this._components.slice(componentIndex+1));
            this._components = newComponents;

            // unregister all events
            if( Events.isEventSubscriber(component)) {
                (<EventSubscriber> component).unsubscribeEvent(Components.EVENT_FINISHED, this.componentFinished);
            }

            // notify listeners that a component has been unregistered
            this.getEventPublisher().publishEvent(ComponentManager.EVENT_UNREGISTERED, component, ComponentManager.EVENT_UNREGISTERED);
        }
        else {
            // no such component
            //this.getLogger().warn("Bean {0} couldn't be unregistered since it is not (or no longer) registered", bean);
            throw Errors.createIllegalArgumentError("Component "+component+" is not registered");
        }
    }



    /**
     * Provides currently registered components
     * @return The component
     */
    public getComponents():any[] {
        return this._components;
    }

    /**
     * The number of registered component
     */
    public getCount():number {
        return this._components.length;
    }

    // -----------------


    public init():Promise<any> {
        return super.init().then(
            () => { return Components.initAll(this._components, this._lifecycleTimeout); }
        );
    }


    public destroy():Promise<any> {
        return super.destroy().then(
            () => { return Components.destroyAll(this._components, this._lifecycleTimeout); }
        );
    }

    public start():void {
        super.start();
        // start all component
        for( var i:number = 0; i<this._components.length; i++ ) {
            var b:any = this._components[i];
            Components.start(b);
        }
    }

    public stop():void {
        super.stop();
        // stop all component
        for( var i:number = 0; i<this._components.length; i++ ) {
            var b:any = this._components[i];
            Components.stop(b);
        }
    }

    // ============

    /**
     * Notification when a bean has been destroyed
     */
    private componentFinished(component:any):void {

        // unregister component
        this.unregister(component);

        // stop component
        if( Components.isStoppable(component) ) {
            (<Stoppable> component).stop();
        }

        // destroy component
        if( Components.isDestroyable(component) ) {
            (<Destroyable> component).destroy();
        }
    }


    /**
     * Brings a component into a certain state
     */
    private adjustState(component:any):void {

        var start:Function = () => {
            if( this.getState() === ComponentManager.STATE_STARTED ) {
                // the manager is already "started". start the component as well
                Components.start(component);
            }
        };

        if( this.getState() >= ComponentManager.STATE_INITIALIZED && this.getState() <= ComponentManager.STATE_DESTROYED ) {
            // the manager is already "initialized". initialize the component as well. and start it afterwards
            Components.init(component, this._lifecycleTimeout).then(() => {
                start();
            });
        }
        else {
            start();
        }

    }
}

export = ComponentManager;






