/**
 * Marks a service that needs to be started.
 */
interface Startable {

    /**
     * Starts or resumes the component. Returns without doing anything in case that the bean has been already started.
     * Any implementation needs to return immediately.
     */
    start():void;

}

export = Startable;
