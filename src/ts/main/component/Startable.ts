

/**
 * Marks a service that needs to be started.
 */
interface Startable {

    /**
     * Stops the bean. Returns without doing anything in case that the bean has been already started.
     * An implementation needs to return immediately.
     */
    start():void;

}

export = Startable;
