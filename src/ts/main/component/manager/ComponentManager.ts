import Initializable = require("./../Initializable");
import Destroyable = require("./../Destroyable");
import Stoppable = require("./../Stoppable");
import Startable = require("./../Startable");
import Components = require("./../Components");
import ComponentBase = require("./../ComponentBase");
import ComponentProcessor = require("./../factory/ComponentProcessor");
import ComponentProcessors = require("./../factory/ComponentProcessors");
import Events = require("../../event/Events");
import EventSubscriber = require("../../event/EventSubscriber");
import Logger = require("./../../logger/Logger");
import LoggerFactory = require("./../../logger/LoggerFactory");
import Errors = require("../../lang/Errors");
import Maps = require("../../lang/Maps");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * A container that holds and manages the lifecycle of components. These need to be explicitly {@link #register registered}.
 * After having {@link #register registered} a component, the entire
 * lifecycle is done automatically, e.g. the component is initialized, started, stopped and destroyed in sync of this
 * container's lifecycle. In addition, a {@link Components.EVENT_FINISHED} event from the component itself
 * is taken into account.
 */
class ComponentManager extends ComponentBase /*implements Initializable, Startable, Stoppable, Destroyable*/ {

    private static _idCount:number = 0;
    private static _idPrefix:string = "_cmpnt";

    private _initialized:boolean = false;
    private _destroyed:boolean = false;
    private _started:boolean = false;



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


    // list of all managed components
    private _components:Map<string, Object> = null;
    private _processors:ComponentProcessor[];
    private _parent:ComponentManager;

    private _lifecycleTimeout:number = 5000;    // TODO make configurable

    /**
     *
     * @param name The name of this manager. Might be null.
     * @param parent This manager's parent. Might be null.
     * @param processors optional processors. Might be null
     */
    constructor(name?:string, parent?:ComponentManager, processors?:ComponentProcessor[]) {
        super(name);
        this._processors = !!processors ? processors : [];
        this._parent = parent;
        this._components = Maps.createMap(true);
    }

    /**
     * Registers a new component to this manager. If lifecycle events ({@link Components#EVENT_INITIALIZED}, {@link Components#EVENT_STARTED})
     *  have been applied to this container already then
     *  the bean's state will be adjusted by "replaying" the lifecycle. A bean that fires {@link Components#EVENT_FINISHED}
     *  will be stopped, destroyed and unregistered.
     *
     * @param component The component
     * @param id the component id. If null or undefined, an id is generated
     */
    public register(component:Object, id?:string):Promise<any> {

        // generate an id if none available
        id = !!id ? id : ComponentManager.generateId();

        // store the component internally
        if( this._components.has(id) ) {
            throw Errors.createIllegalStateError("There is already a component "+id+": "+this._components.get(id));
        }
        this._components.set(id, component);
        this.getLogger().debug("Registered component {0} -> {1}", id, component);

        // bring the component's state up-to-date
        return this.replayLifecycle(id, component).then(() => {

            // detect certain events of component so that component can be unregistered automatically
            if( Events.isEventSubscriber(component)) {
                (<EventSubscriber> component).subscribeEvent(Components.EVENT_FINISHED, this.componentFinished, this);
            }

            // notify listeners that a component has been registered
            this.getEventPublisher().publishEvent(ComponentManager.EVENT_REGISTERED, component, ComponentManager.EVENT_REGISTERED);
            return Promise.resolve();
        });
    }

    /**
     * Unregister a component. Does nothing when no such component has been registered before
     */
    public unregister(component:Object, id?:string):Promise<any> {

        // lookup component
        var ci:string = id;
        if( !ci && !!component ) {

            // id is unknown. try to find the id via component
            this._components.forEach((c:any, i:string) => {

                if( c === component ) {

                    // found the component
                    ci = i;
                    // TODO stop this loop?
                }
            });
        }

        if(!ci || !this._components.has(ci)) {
            throw Errors.createIllegalArgumentError("Component "+id+" -> "+component+" is not registered");
        }
//        if( !!component && component !== this._components.get(ci) ) {
//            throw Errors.createIllegalArgumentError("Component "+id+"'s value doesn't match "+component+" <-> "+this._components.get(ci));
//        }
        component = this._components.get(ci);

        // unregister all events
        if( Events.isEventSubscriber(component)) {
            (<EventSubscriber> component).unsubscribeEvent(Components.EVENT_FINISHED, this.componentFinished);
        }

        this.getLogger().debug("Unregistered component {0} -> {1}", ci, component);

        // remove from registry
        this._components.delete(ci);

        // run destruction lifecycle
        var cm:Map<string, any> = Maps.createMap();
        cm.set(ci, component);
        return this.doDestroy(cm).then(() => {

            // notify listeners that a component has been unregistered
            this.getEventPublisher().publishEvent(ComponentManager.EVENT_UNREGISTERED, component, ComponentManager.EVENT_UNREGISTERED);

            return Promise.resolve();
        });
    }

    /**
     * Provides currently registered components of this manager instance (excluding the parent)
     * @return The component
     */
    public getComponents():Map<string, any> {
        return this._components;
    }

    /**
     * A named component. If this manager doesn't know such a component, the parent is asked.
     * @return The component or null if not found
     */
    public getComponent(name:string):any {
        var result:any = this._components.get(name);
        if( !result ) {
            result = this._parent.getComponent(name);
        }
        return !result ? null : result;
    }

    /**
     * The number of registered component of this manager instance (excluding the parent)
     */
    public getCount():number {
        return this._components.size;
    }

    // -----------------

    public init():Promise<any> {
        return super.init().then(() => {
            this.getLogger().debug("Initializing registered components ...");
            this._initialized = true;
            return this.doInit(this.clone(this._components)).then(() => {
                this.getLogger().debug("Initialized registered components");
                return Promise.resolve();
            });
        });
    }

    public destroy():Promise<any> {
        return super.destroy().then(() => {
            this.getLogger().debug("Destroying registered components ...");
            this._destroyed = true;
            return this.doDestroy(this.clone(this._components)).then(() => {
                this.getLogger().debug("Destroyed registered components");
                return Promise.resolve();
            })
        });
    }

    public start():void {
        super.start();

        // start all component
        this._components.forEach((component:any, id:string) => {
            Components.start(component);
        });
        this._started = true;
    }

    public stop():void {
        super.stop();
        // stop all component
        // start all component
        this._components.forEach((component:any, id:string) => {
            Components.stop(component);
        });
        this._started = false;
    }

    // ================

    /**
     * Indicates whether or not the components lifecycle may be processed concurrently. If true, then the lifecycle
     * may be faster but may also have dependency problems.
     * @protected
     */
    public isConcurrentProcessing():boolean {
        return false;
    }


    // ============

    /**
     * Notification when a component is finished and can be destroyed
     */
    private componentFinished(component:any):void {

        // stop component
        if( Components.isStoppable(component) ) {
            (<Stoppable> component).stop();
        }

        //hier ist ein fehler

        // destroy & unregister component
        this.unregister(component)/*.catch((e) => {
            this.getLogger().warn("Error unregistering component {0}", component, e);
        })*/;
    }


    /**
     * Brings a component into the current lifecycle state
     */
    private replayLifecycle(name:string, component:any):Promise<any> {

        this.getLogger().debug("Replaying lifecycle for {0} -> {1}", name, component);
        if( this._initialized && !this._destroyed ) {

            // the manager is already "initialized". initialize the component as well. and start it afterwards
            var cm:Map<string, any> = Maps.createMap();
            cm.set(name, component);
            return this.doInit(cm).then(() => {

                if( this._started ) {
                    // the manager is already "started". start the component as well
                    Components.start(component);
                }
                return Promise.resolve();
            });
        }
        else {
            return Promise.resolve();
        }
    }

    /**
     * Performs initialization of one or more components
     */
    private doInit(components:Map<string,any>):Promise<any> {

        if( components.size == 0 ) {
            return Promise.resolve();
        }

        var names:string[] = Maps.keys(components);

        // ----------- pre-initialize
        this.getLogger().debug("Pre-Initializing components [{0}] ...", names);
        return ComponentProcessors.processBeforeInit(this._processors, components, this._lifecycleTimeout).then(() => {

            // ----------- initialize
            this.getLogger().debug("Initializing components [{0}] {1} ...",  names, this.isConcurrentProcessing() ? "concurrently" : "sequentially");
            return Components.initAll(Maps.values(components), this.isConcurrentProcessing(), this._lifecycleTimeout).then(() => {

                // ----------- post-initialize
                this.getLogger().debug("Post-Initializing components [{0}]", names);
                return ComponentProcessors.processAfterInit(this._processors, components, this._lifecycleTimeout).then(() => {
                    this.getLogger().info("Initialized components: [{0}]", names);
                    return Promise.resolve();
                });
            });
        }).catch((e) => {
            this.getLogger().warn("Error initializing components [{0}]: {1}", names, e);
            return Promise.reject(e);
        });
    }

    /**
     * Performs destruction of one or more components
     */
    private doDestroy(components:Map<string,any>):Promise<any> {

        if( components.size == 0 ) {
            return Promise.resolve();
        }

        var names:string[] = Maps.keys(components);

        // ----------- pre-destroy
        this.getLogger().debug("Pre-Destroying components [{0}]", names);
        return ComponentProcessors.processBeforeDestroy(this._processors, components, this._lifecycleTimeout).then(() => {

            // --------------- destroy
            this.getLogger().debug("Destroying components [{0}] {1} ...", names, this.isConcurrentProcessing() ? "concurrently" : "sequentially");
            var cv:Object[] = Maps.values(components);
            cv.reverse(); // destroy in reverse order!
            return Components.destroyAll(cv, this.isConcurrentProcessing(), this._lifecycleTimeout).then(() => {

                // -------------- post-destroy
                this.getLogger().debug("Post-Destroying components [{0}]", names);
                return ComponentProcessors.processAfterDestroy(this._processors, this._components, this._lifecycleTimeout).then(() => {
                    this.getLogger().info("Destroyed components [{0}]", names);
                    return Promise.resolve();
                });
            });
        }).catch((e) => {
            this.getLogger().warn("Error destroying [{0}]: {1}", components, e);
            return Promise.reject(e);
        });
    }


    private static generateId():string {
        return ComponentManager._idPrefix+(ComponentManager._idCount++);
    }

    private clone(source:Map<string, any>):Map<string, any>  {
        var result:Map<string, any> = Maps.createMap(true);
        source.forEach((c:any, k:string) => {
            result.set(k, c);
        });
        return result;
    }

}

export = ComponentManager;






