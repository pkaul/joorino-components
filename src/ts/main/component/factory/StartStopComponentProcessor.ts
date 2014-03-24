import ComponentProcessor = require("./ComponentProcessor");
import Components = require("../Components");
import ObjectBase = require("../../ObjectBase");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * A bean processor that handles {@link Startable#start} and {@link Stoppable#stop} on init/destroy
 * @see Startable
 * @see Stoppable
 */
class StartStopBeanProcessor extends ObjectBase implements ComponentProcessor {

    public processBeforeInit(name:string, component:Object):Promise<any> {
        // do nothing
        return Promise.resolve();
    }

    public processAfterInit(name:string, component:Object):Promise<any> {
        // starts the bean after it has been initialized
        Components.start(component);
        return Promise.resolve();
    }

    public processBeforeDestroy(name:string, component:Object, finished?:Function):Promise<any> {
        // stops the bean before it gets destroyed
        Components.stop(component);
        return Promise.resolve();
    }

    public processAfterDestroy(name:string, component:Object, finished?:Function):Promise<any> {
        // do nothing
        return Promise.resolve();
    }
}

export = StartStopBeanProcessor;








