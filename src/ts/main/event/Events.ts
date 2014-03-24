
/**
 * Utilities when dealing with {@link EventPublisher} and {@link EventSubscriber}
 */
class Events {

    /**
     * Checks whether the given object is of type {@link EventSubscriber}
     * @param obj The object
     */
    public static isEventSubscriber(obj:any):boolean {
        return obj !== null && typeof obj === 'object' &&
            typeof obj.subscribeEvent === 'function' && typeof obj.unsubscribeEvent === 'function';
    }

    /**
     * Checks whether the given object is of type {@link EventPublisher}
     * @param obj The object
     */
    public static isEventPublisher(obj:any):boolean {
        return obj !== null && typeof obj === 'object' && typeof obj.publishEvent === 'function' && typeof obj.hasSubscriber === 'function';;
    }
}

export = Events;