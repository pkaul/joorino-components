/// <reference path="../../../jasmine/jasmine.d.ts"/>

import ComponentProcessor = require("../../../main/component/manager/ComponentProcessor");
import ComponentProcessors = require("../../../main/component/manager/ComponentProcessors");
import Maps = require("../../../main/lang/Maps");

/**
 * Tests {@link ComponentProcessors}
 */
describe("ComponentProcessors", function():void {

    /**
     * Tests that the lifecycle is executed correctly
     */
    it("testLifecycle", function():void {

        // logger.Configurator.configure("debug");

        var finished:boolean = false;

        var log:string[] = [];
        var components:Map<string, Object> = Maps.createMap(true);
        components.set("key1", "bean1");
        components.set("key2", "bean2");

        var processor1:ComponentProcessor = new LoggingComponentProcessor("p1", log);
        var processor2:ComponentProcessor = new LoggingComponentProcessor("p2", log);
        ComponentProcessors.processBeforeInit([processor1, processor2], components).then(() => {
            ComponentProcessors.processAfterInit([processor1, processor2], components).then(() => {
                ComponentProcessors.processBeforeDestroy([processor1, processor2], components).then(() => {
                    ComponentProcessors.processAfterDestroy([processor1, processor2], components).then(() => {
                        finished = true;
                    });
                })
            });
        });

        waitsFor(() => {
            return finished;
        });
        runs(function() {
            expect(log.join(",")).toBe("p1.beforeInit(key1=bean1),p1.beforeInit(key2=bean2),p2.beforeInit(key1=bean1),p2.beforeInit(key2=bean2),"+
                "p1.afterInit(key1=bean1),p1.afterInit(key2=bean2),p2.afterInit(key1=bean1),p2.afterInit(key2=bean2),"+
                "p2.beforeDestroy(key2=bean2),p2.beforeDestroy(key1=bean1),p1.beforeDestroy(key2=bean2),p1.beforeDestroy(key1=bean1),"+
                "p2.afterDestroy(key2=bean2),p2.afterDestroy(key1=bean1),p1.afterDestroy(key2=bean2),p1.afterDestroy(key1=bean1)");
        });
    })

});

// =======================


class LoggingComponentProcessor implements ComponentProcessor {

    private _name:string;
    private _log:string[];

    constructor(name:string, log:string[]) {
        this._name = name;
        this._log = log;
    }

    public processBeforeInit(name:string, bean:Object):Promise<any> {
        this._log.push(this._name+".beforeInit("+name+"="+bean+")");
        return Promise.resolve();
    }

    public processAfterInit(name:string, bean:Object):Promise<any>{
        this._log.push(this._name+".afterInit("+name+"="+bean+")");
        return Promise.resolve();
    }

    public processBeforeDestroy(name:string, bean:Object):Promise<any> {
        this._log.push(this._name+".beforeDestroy("+name+"="+bean+")");
        return Promise.resolve();
    }
    public processAfterDestroy(name:string, bean:Object, finished:Function = null):Promise<any> {
        this._log.push(this._name+".afterDestroy("+name+"="+bean+")");
        return Promise.resolve();
    }

    public toString():string {
        return "LoggingComponentProcessor[name="+this._name+"]";
    }
}