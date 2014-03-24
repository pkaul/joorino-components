/**
 * Notifier for event listeners
 */
interface EventPublisher {

    /**
     * Notifies all subscriber about a certain event
     * @param name The event name
     * @param args Event arguments to be passed to the subscriber
     */
    publishEvent(name:string, ... args:any[]):void;

    /**
     * Checks whether this instance has at least one subscriber for the given event
     * @param name The event name
     */
    hasSubscriber(name:string):boolean;
}

export = EventPublisher;