/// <reference path="../../../jasmine/jasmine.d.ts"/>

import Initializable = require("../../../main/component/Initializable");
import Destroyable = require("../../../main/component/Destroyable");
import Startable = require("../../../main/component/Startable");
import Stoppable = require("../../../main/component/Stoppable");
import FunctionComponentFactoryBase = require("../../../main/component/factory/FunctionComponentFactoryBase");
//import SimpleConfigurator = require("../../../main/logger/runtime/SimpleConfigurator");

/**
 * Tests {@link FunctionComponentFactoryBase}
 */
describe("FunctionComponentFactoryBase", function():void {

    //SimpleConfigurator.configure("debug");

    /**
     * Tests that all beans are created and wired correctly for an example {@link TestFunctionBeanFactoryBase}
     */
    it("testBeansAndWiring", function():void {

        var initialized:boolean = false;
        var testling:TestFunctionBeanFactoryBase = new TestFunctionBeanFactoryBase();

        testling.init().then(() => {

            var bean1:TestComponent = <TestComponent> testling.getComponent("bean1");
            var bean2:TestComponent = <TestComponent> testling.getComponent("bean2");
            var bean3:TestComponent = <TestComponent> testling.getComponent("bean3");

            expect(bean1.getName()).toBe("my-bean-1");
            expect(bean1.getReference()).toBe(bean2);
            expect(bean2.getName()).toBe("my-bean-2");
            expect(bean2.getReference()).toBe(bean3);

            initialized = true;
        });

        waitsFor(() => {
            return initialized;
        });

        runs(() => {
            expect(initialized).toBe(true);
            // check the creation order
            expect(testling.getComponentNames().join(",")).toBe("bean1,bean2,bean3");
        });
    })
});


// ==================

class TestFunctionBeanFactoryBase extends FunctionComponentFactoryBase {

    /**
     * test factory function for creating bean "bean1"
     */
    private createComponentBean1():Promise<Object> {

        return this.resolveDependencies(["bean2", "bean3"]).then((dependencies:Map<string,Object>) => {
            var bean:TestComponent = new TestComponent();
            bean.setReference(dependencies.get('bean2'));
            bean.setName("my-bean-1");
            return Promise.resolve(bean);
        });
    }

    /**
     * test factory function for creating bean "bean2"
     */
    private createComponentBean2():Promise<Object> {
        return this.resolveDependencies(["bean3"]).then((dependencies:Map<string,Object>) => {
            var bean:TestComponent = new TestComponent();
            bean.setName("my-bean-2");
            bean.setReference(dependencies.get('bean3'));
            return Promise.resolve(bean);
        });
    }

    /**
     * test factory function for creating bean "bean3"
     */
    private createComponentBean3():Promise<Object> {
        var bean:TestComponent = new TestComponent();
        bean.setName("my-bean-3");
        return Promise.resolve(bean);
    }
}

class TestComponent implements Initializable, Destroyable, Startable, Stoppable {

    private _events:string[] = [];
    private _name:string;
    private _reference:Object;


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

    public getEvents():string {
        return this._events.join(',');
    }

    public init():Promise<any> {
        this._events.push("init");
        return Promise.resolve();
    }

    public destroy():Promise<any> {
        this._events.push("destroy");
        return Promise.resolve();
    }

    public start():void {
        this._events.push("start");
    }

    public stop():void {
        this._events.push("stop");
    }


    public toString():string {
        return "TestComponent[name="+this.getName()+"]";
    }

}