/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * Hooks for processing a component's lifecycle
 */
interface ComponentProcessor {

    /**
     * Will be invoked before a component's gets initialized
     * @param name The component's name
     * @param component The component
     * @return A promise that indicates whether the processing has finished.
     */
    processBeforeInit(name:string, component:Object):Promise<any>;
    processAfterInit(name:string, component:Object):Promise<any>;
    processAfterDestroy(name:string, component:Object):Promise<any>;
    processBeforeDestroy(name:string, component:Object):Promise<any>;
}

export = ComponentProcessor;