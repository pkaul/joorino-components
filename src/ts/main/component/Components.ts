import Initializable = require("./Initializable");
import Destroyable = require("./Destroyable");
import Startable = require("./Startable");
import Stoppable = require("./Stoppable");
import Promises = require("../lang/Promises");
import Logger = require("../logger/Logger");
import LoggerFactory = require("../logger/LoggerFactory");
import EventPublisher = require("../event/EventPublisher");
/// <reference path="../../es6-promises/es6-promises.d.ts"/>

/**
 * Utility functions that deal with a bean lifecycle
 */
class Components {

    private static LOG:Logger;

    /**
      * Event that is fired when a bean has been started.
      *   The first argument of this event is the bean while the second is the this event name.
      */
     public static EVENT_STARTED:string = "started";

     /**
      * Event that is fired when a bean has finished running or when it has been stopped explicitly.
      *   The first argument of this event is the bean while the second is the this event name.
      */
     public static EVENT_STOPPED:string = "stopped";

     /**
      * Event that is fired when a bean has been initialized. The first argument of this event is the bean while the second
      * is the this event name.
      */
     public static EVENT_INITIALIZED:string = "initialized";

     /**
      * Event that is fired when a bean has been destroyed. Either externally or by the bean itself.
      *  The first argument of this event is the bean while the second is the this event name.
      */
     public static EVENT_DESTROYED:string = "destroyed";

     /**
      * Event that is fired when a bean has finished and is no longer of use so that it can be removed.
      *   The first argument of this event is the bean while the second is the this event name.
      */
     public static EVENT_FINISHED:string = "finished";

     /**
      * Notifies about a bean that is {@link #EVENT_INITIALIZED}
      */
     public static publishInitialized(notifier:EventPublisher, bean:Object):void {
         notifier.publishEvent(Components.EVENT_INITIALIZED, bean, Components.EVENT_INITIALIZED);
     }

     /**
      * Notifies about a bean that is {@link #EVENT_DESTROYED}
      */
     public static publishDestroyed(notifier:EventPublisher, bean:Object):void {
         notifier.publishEvent(Components.EVENT_DESTROYED, bean, Components.EVENT_DESTROYED);
     }

     /**
      * Notifies about a bean that is {@link #EVENT_STARTED}
      */
     public static publishStarted(notifier:EventPublisher, bean:Object):void {
         notifier.publishEvent(Components.EVENT_STARTED, bean, Components.EVENT_STARTED);
     }

     /**
      * Notifies about a bean that is {@link #EVENT_STOPPED}
      */
     public static publishStopped(notifier:EventPublisher, bean:Object):void {
         notifier.publishEvent(Components.EVENT_STOPPED, bean, Components.EVENT_STOPPED);
     }

     /**
      * Notifies about a bean that is {@link #EVENT_FINISHED}
      */
     public static publishFinished(notifier:EventPublisher, bean:Object):void {
         notifier.publishEvent(Components.EVENT_FINISHED, bean, Components.EVENT_FINISHED);
     }


    /**
     * Tests whether an object is of type {@link Initializable} or has a method {@link Initializable#init} respectively
     * @param obj The object to check
     */
    public static isInitializable(obj:any):boolean {
        return obj !== null && typeof obj === 'object' && typeof obj.init === 'function';
    }

    /**
     * Tests whether an object is of type {@link Destroyable} or has a method {@link Destroyable#destroy} respectively
     * @param obj The object to check
     */
    public static isDestroyable(obj:any):boolean {
        return obj !== null && typeof obj === 'object' && typeof obj.destroy === 'function';
    }

    /**
     * Tests whether an object is of type {@link Startable} or has a method {@link Startable#start} respectively
     * @param obj The object to check
     */
    public static isStartable(obj:any):boolean {
        return obj !== null && typeof obj === 'object' && typeof obj.start === 'function';
    }

    /**
     * Tests whether an object is of type {@link Stoppable} or has a method {@link Stoppable#stop} respectively
     * @param obj The object to check
     */
    public static isStoppable(obj:any):boolean {
        return obj !== null && typeof obj === 'object' && typeof obj.stop === 'function';
    }

    /**
     * Tests whether an object is of type {@link Runnable} or has a method {@link Runnable#run} respectively
     * @param obj The object to check
     */
    public static isRunnable(obj:any):boolean {
        return obj !== null && typeof obj === 'object' && typeof obj.run === 'function';
    }

    /**
     * Initializes a component in case that it is {@link Initializable}
     * @param obj The component to initialize
     * @param warnTimeout The timeout in milliseconds after which a warning shall be logged when destruction doesn't notify about success
     */
    public static init(obj:any, warnTimeout:number = -1):Promise<any> {

        if( Components.isInitializable(obj) ) {
            try {

                var d:Initializable = <Initializable> obj;
                var p:Promise<any> = d.init();
                p.catch((error) => {
                    Components.getLogger().warn("Error initializing {0}", obj, error);
                    return Promise.reject(error); // bubbling up
                });
                p.then((v:any) => {
                    Components.getLogger().debug("Initialized {0}", obj);
                    return Promise.resolve(v);  // bubbling up
                });

                return Promises.withTimeout(p, (resolve:(value:any) => void, reject:(error:any) => void) => {
                    Components.getLogger().warn("Timeout on initializing {0}", obj);
                    reject("Timeout on initializing "+obj);
                }, warnTimeout);

            } catch (e) {
                Components.getLogger().warn("Error initializing {0}", obj, e);
                throw e; // bubbling up
            }
        }
        else {
           return Promise.resolve();
        }
    }

    /**
     * Destroys a component in case that it is {@link Destroyable}
     * @param obj The component to destroy
     * @param warnTimeout The timeout in milliseconds after which a warning shall be logged when destruction doesn't notify about success
     */
    public static destroy(obj:any, warnTimeout:number = -1):Promise<any> {

        if( Components.isDestroyable(obj) ) {
            try {

                var d:Destroyable = <Destroyable> obj;
                var p:Promise<any> = d.destroy();
                p.catch((error) => {
                    Components.getLogger().warn("Error destroying {0}", obj, error);
                    return Promise.reject(error); // bubbling up
                });
                p.then((v:any) => {
                    Components.getLogger().debug("Destroyed {0}", obj);
                    return Promise.resolve(v);  // bubbling up
                });

                return Promises.withTimeout(p, (resolve:(value:any) => void, reject:(error:any) => void) => {
                    Components.getLogger().warn("Timeout on destroying {0}", obj);
                    reject("Timeout on destroying "+obj);
                }, warnTimeout);

            } catch (e) {
                Components.getLogger().warn("Error destroying {0}", obj, e);
                throw e;  // bubbling up
            }
        }
        else {
           return Promise.resolve();
        }
    }

    /**
     * Starts an object in case that it is {@link Startable}
     * @param obj The object to start
     * @returns true, if it has been started
     */
    public static start(obj:any):boolean {
        if( Components.isStartable(obj) ) {
            (<Startable> obj).start();
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Starts an object in case that it is {@link Stoppable}
     * @param obj The object to stop
     * @returns true, if it has been started
     */
    public static stop(obj:any):boolean {
        if( Components.isStoppable(obj) ) {
            (<Stoppable> obj).stop();
            return true;
        }
        else {
            return false;
        }
    }


    /**
     * Destroys several components at once.
     * @param components The components
     * @param warnTimeout The timeout in milliseconds after which a warning shall be logged and the destruction shall be handled as 'failed'
     */
    public static destroyAll(components:any[], warnTimeout:number = -1):Promise<any> {

        var promises:Promise<any>[] = [];
        for( var i:number = 0; i<components.length; i++ ) {

            ((component:any) => {

                if( Components.isDestroyable(component)) {

                    var d:Destroyable = (<Destroyable> component);
                    try {

                        var p:Promise<any> = d.destroy();
                        p.then((v:any) => {
                            Components.getLogger().debug("Destroyed {0}", d);
                            return Promise.resolve(v);  // bubbling up
                        });
                        p.catch((error) => {
                            Components.getLogger().warn("Error destroying {0}", component, error);
                            return Promise.reject(error); // bubbling up
                        });
                        promises.push(p);
                    }
                    catch (e) {
                        Components.getLogger().warn("Error destroying {0}", component, e);
                        throw e; // bubbling up
                    }
                }
            })(components[i]);
        }

        if( promises.length == 0 ) {
            // we are done
            return Promise.resolve();
        }

        return Promises.withTimeout(Promise.all(promises), (resolve:(value:any) => void, reject:(error:any) => void) => {
            Components.getLogger().warn("Timeout on destroying components: {0}", components);
            reject("Timeout on destroying components concurrently: "+components)
        }, warnTimeout);
    }

    /**
     * Initializes several components at once.
     * @param components The components
     * @param warnTimeout The timeout in milliseconds after which a warning shall be logged and the initialization shall be handled as 'failed'
     */
    public static initAll(components:any[], warnTimeout:number = -1):Promise<any> {

        var promises:Promise<any>[] = [];
        for( var i:number = 0; i<components.length; i++ ) {

            ((component:any) => {
                if( Components.isInitializable(component)) {

                    var d:Initializable = (<Initializable> component);
                    try {
                        var p:Promise<any> = d.init();
                        p.then((v:any) => {
                            Components.getLogger().debug("Initialized {0}", component);
                            return Promise.resolve(v);  // bubbling up
                        });
                        p.catch((error) => {
                            Components.getLogger().warn("Error initializing {0}", component, error);
                            return Promise.reject(error); // bubbling up
                        });
                        promises.push(p);
                    }
                    catch (e) {
                        Components.getLogger().warn("Error initializing {0}", component, e);
                        throw e; // bubbling up
                    }
                }
            })(components[i]);
        }

        if( promises.length == 0 ) {
            // we are done
            return Promise.resolve();
        }

        return Promises.withTimeout(Promise.all(promises), (resolve:(value:any) => void, reject:(error:any) => void) => {
            Components.getLogger().warn("Timeout on initializing components concurrently: {0}", components);
            reject("Timeout on initializing components concurrently: "+components)
        }, warnTimeout);
    }

    // ===========

    private static getLogger():Logger {
        if( !Components.LOG ) {
            Components.LOG = LoggerFactory.getLogger(Components);
        }
        return Components.LOG;
    }

}

export = Components;