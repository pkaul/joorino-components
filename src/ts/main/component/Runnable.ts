/**
 * Marks an object that requires continuous execution (e.g. on a certain FPS rate)
 */
interface Runnable {

    /**
     * Runs the object in an interval
     */
    run():void
}

export = Runnable;
