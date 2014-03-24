/**
 * Marks a service that needs to be stopped.
 * @see Startable
 */
interface Stoppable {

    /**
     * Stops the bean. Returns without doing anything in case that the bean has been already stopped or has not been started.
     * An implementation needs to return immediately.
     */
    stop():void;
}

export = Stoppable;
