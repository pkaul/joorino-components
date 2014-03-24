/// <reference path="../../es6-promises/es6-promises.d.ts"/>

/**
 * A component that requires a proper destruction, e.g. in order to free resources.
 * @see Initializable
 */
interface Destroyable {

    /**
     * Destroys the object. Since destruction might take a while, the ending is indicated by a callback.
     *  This method does nothing when the object is already destroyed.
     * @return A promise to be called when the destruction has been ended.
     */
    destroy():Promise<any>;
}

export = Destroyable;