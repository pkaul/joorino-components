/**
 * A registry for events
 */
interface EventSubscriber {

    /**
     * Subscribes for for a certain type of events
     * @param name The event name
     * @param listener The listener function to be invoked. This listener needs to return immediately on invocation.
     * @param listenerObject (Optional) the object that holds the listener function. If given, it is made sure that the function is properly
     *  bound to the object, e.g. in case that the function is bound to the object's prototype only yet.
     */
    subscribeEvent(name:string, listener:Function, listenerObject?:Object):void;


    /**
     * Unregisters an already registered listener.
     * @throws Error in case that the listener is not registered
     */
    unsubscribeEvent(name:string, listener:Function):void;
}

export = EventSubscriber;