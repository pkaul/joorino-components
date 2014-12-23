/// <reference path="../../../jasmine/jasmine.d.ts"/>

import Initializable = require("../../../main/component/Initializable");
import Destroyable = require("../../../main/component/Destroyable");
import FunctionComponentFactoryBase = require("../../../main/component/factory/FunctionComponentFactoryBase");
import ComponentProcessor = require("../../../main/component/factory/ComponentProcessor");
//import Configurator = require("../../../main/logger/runtime/Configurator");

/**
 * Tests {@link FunctionComponentFactoryBase}
 */
describe("FunctionComponentFactoryBase", function():void {

    //Configurator.configure("debug");

    /**
     * Tests that all components are created and wired in the correct order. This is done using {@link TestFunctionComponentFactory}
     */
    it("testWiringAndLifecycle", function():void {

        var initialized:boolean = false;
        var destroyed:boolean = false;
        var testling:TestFunctionComponentFactory = new TestFunctionComponentFactory();

        testling.init().then(() => {
            initialized = true;
        });

        waitsFor(() => {
            return initialized;
        });

        runs(() => {

            expect(initialized).toBe(true);

            var bean1:MyComponent = <MyComponent> testling.getComponent("bean1");
            var bean2:MyComponent = <MyComponent> testling.getComponent("bean2");
            var bean3:MyComponent = <MyComponent> testling.getComponent("bean3");

            // check that all components are properly wired
            expect(bean1.getName()).toBe("my-bean-1");
            expect(bean1.getReference()).toBe(bean2);
            expect(bean2.getName()).toBe("my-bean-2");
            expect(bean2.getReference()).toBe(bean3);
            expect(bean3.getName()).toBe("my-bean-3");

            // check the lifecycle order. It's especially important that the leaf components are initialized before the node components
            // expecting order bean3,bean2,bean1
            expect(testling.getEvents().join(",")).toBe("beforeinit(bean3),beforeinit(bean2),beforeinit(bean1),init(my-bean-3),init(my-bean-2),init(my-bean-1),afterinit(bean3),afterinit(bean2),afterinit(bean1)");

            // check all names
            expect(testling.getComponentNames().join(",")).toBe("bean3,bean2,bean1");

            // destroy
            testling.destroy().then(() => {
                destroyed = true;
            });

        });

        waitsFor(() => {
            return destroyed;
        });

        runs(function() {
            // check the destruction order. make sure that the destruction takes place in reverse order than init
            expect(testling.getEvents().join(",")).toBe("beforeinit(bean3),beforeinit(bean2),beforeinit(bean1),init(my-bean-3),init(my-bean-2),init(my-bean-1),afterinit(bean3),afterinit(bean2),afterinit(bean1),beforedestroy(bean1),beforedestroy(bean2),beforedestroy(bean3),destroy(my-bean-1),destroy(my-bean-2),destroy(my-bean-3),afterdestroy(bean1),afterdestroy(bean2),afterdestroy(bean3)");
        });
    })
});


// ==================

/**
 * A component factory to be used by this tests
 */
class TestFunctionComponentFactory extends FunctionComponentFactoryBase {

    private _events:string[] = [];

    constructor() {
        super(null, null);
        this.setComponentProcessors([new MyComponentProcessor(this._events)]);
    }

    /**
     * test factory function for creating bean "bean2"
     */
    private createComponentBean2():Promise<Object> {
        return this.require(["bean3"]).then((dependencies:Object[]) => {
            var bean:MyComponent = new MyComponent(this._events);
            bean.setName("my-bean-2");
            bean.setReference(dependencies[0]);
            return Promise.resolve(bean);
        });
    }

    /**
     * test factory function for creating bean "bean1"
     */
    private createComponentBean1():Promise<Object> {

        return this.require(["bean2", "bean3"]).then((dependencies:Object[]) => {
            var bean:MyComponent = new MyComponent(this._events);
            bean.setReference(dependencies[0]);
            bean.setName("my-bean-1");
            return Promise.resolve(bean);
        });
    }

    /**
     * test factory function for creating bean "bean3"
     */
    private createComponentBean3():Promise<Object> {
        var bean:MyComponent = new MyComponent(this._events);
        bean.setName("my-bean-3");
        return Promise.resolve(bean);
    }

    public getEvents() {
        return this._events;
    }

}

/**
 * A test component
 */
class MyComponent implements Initializable, Destroyable {

    private _events:string[] = [];
    private _name:string;
    private _reference:Object;

    constructor(events:string[]) {
        this._events = events;
    }


    public getReference():Object {
        return this._reference;
    }

    public setReference(value:Object) {
        this._reference = value;
    }

    public setName(value:string) {
        this._name = value;
    }

    public getName():string {
        return this._name;
    }

    public init():Promise<any> {
        this._events.push("init("+this._name+")");
        return Promise.resolve();
    }

    public destroy():Promise<any> {
        this._events.push("destroy("+this._name+")");
        return Promise.resolve();
    }

    public toString():string {
        return "TestComponent[name="+this.getName()+"]";
    }
}


/**
 * A test processor
 */
class MyComponentProcessor implements ComponentProcessor {

    private _events:string[];

    constructor(events:string[]) {
        this._events = events;
    }

    public processBeforeInit(name:string, component:Object):Promise<any> {
        this._events.push("beforeinit("+name+")");
        return Promise.resolve(component);
    }

    public processAfterInit(name:string, component:Object):Promise<any> {
        this._events.push("afterinit("+name+")");
        return Promise.resolve(component);
    }

    public processAfterDestroy(name:string, component:Object):Promise<any> {
        this._events.push("afterdestroy("+name+")");
        return Promise.resolve(component);
    }

    public processBeforeDestroy(name:string, component:Object):Promise<any> {
        this._events.push("beforedestroy("+name+")");
        return Promise.resolve(component);
    }
}