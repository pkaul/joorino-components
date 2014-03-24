
/// <reference path="../../es6-promises/es6-promises.d.ts"/>

/**
 * A component that requires initialization
 */
interface Initializable {

    /**
     * Initializes the component. The initialization process may take a while. Thus, the initialization ending is indicated by a promise.
     * @return The promise
     */
    init():Promise<any>;
}

export = Initializable;