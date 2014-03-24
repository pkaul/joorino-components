/// <reference path="../../jasmine/jasmine.d.ts"/>

import ComponentManager = require("../../main/component/manager/ComponentManager");
import ComponentBase = require("../../main/component/ComponentBase");
import TestLifecycleBean = require("./TestComponent");

//import SimpleConfigurator = require("../../main/logger/runtime/SimpleConfigurator");

/**
 * Tests {@link ComponentManager}
 */
describe("ComponentManager", function():void {

    /**
     * Tests the entire lifecycle of managed services
     */
    it("testLifeCycle", function():void {

        //SimpleConfigurator.configure("debug");

        var testling:ComponentManager = new ComponentManager();

        var b1:TestLifecycleBean = new TestLifecycleBean();
        var b2:TestLifecycleBean = new TestLifecycleBean();

        testling.register(b1);
        testling.register(b2);

        expect(testling.getCount()).toBe(2);
        expect(testling.getComponents()[0]).toBe(b1);
        expect(testling.getComponents()[1]).toBe(b2);

        expect(b1.getEventsAsString()).toBe("");
        expect(b2.getEventsAsString()).toBe("");

        var initialized:boolean = false;
        var destroyed:boolean = false;

        testling.init().then(() => {initialized = true;});
        waitsFor(function() {return initialized});
        runs(function() {

            expect(b1.getEventsAsString()).toBe("init");
            expect(b2.getEventsAsString()).toBe("init");

            testling.start();
            expect(b1.getEventsAsString()).toBe("init,start");
            expect(b2.getEventsAsString()).toBe("init,start");

            // destroy a single bean
            b1.notifyFinished();
            expect(testling.getCount()).toBe(1);
            expect(testling.getComponents()[0]).toBe(b2);
            expect(b1.getEventsAsString()).toBe("init,start,stop,destroy");
            expect(b2.getEventsAsString()).toBe("init,start");

            testling.stop();
            expect(b1.getEventsAsString()).toBe("init,start,stop,destroy");
            expect(b2.getEventsAsString()).toBe("init,start,stop");

            testling.destroy().then(() =>  {
                destroyed = true;
            });
        });

        waitsFor(() => {
            return destroyed;
        });

        runs(function() {
            expect(b1.getEventsAsString()).toBe("init,start,stop,destroy");
            expect(b2.getEventsAsString()).toBe("init,start,stop,destroy");
        });
    });


    it("testGetBeans", function():void {

        var testling:ComponentManager = new ComponentManager();

        var b1:TestLifecycleBean = new TestLifecycleBean();
        var b2:string = "my-string";

        testling.register(b1);
        expect(testling.getComponents().length).toBe(1);
        expect(testling.getComponents()[0]).toBe(b1);

        testling.register(b2);
        expect(testling.getComponents().length).toBe(2);
        expect(testling.getComponents()[0]).toBe(b1);
        expect(testling.getComponents()[1]).toBe(b2);
    });

    /**
     * Tests that lifecycle events will be applied on #register after container has been used
     */
    it("testRegisterAfterBegin", function():void {

        var testling:ComponentManager = new ComponentManager();
        testling.init();

        var b1:TestLifecycleBean = new TestLifecycleBean();
        testling.register(b1);
        expect(b1.getEventsAsString()).toBe("init");

        testling.start();
        expect(b1.getEventsAsString()).toBe("init,start");

        var b2:TestLifecycleBean = new TestLifecycleBean();
        testling.register(b2);
        waitsFor(function() {
            return b2.getEventsAsString() == "init,start";
        });
        runs(function() {
            expect(b2.getEventsAsString()).toBe("init,start");
        })
    });


    it("testRegisterFunctions", function():void {


        var f:Function = function():void {};

        var testling:ComponentManager = new ComponentManager();

        // test registering function directly
        testling.register(f);
        expect(testling.getCount()).toBe(1);
        testling.unregister(f);
        expect(testling.getCount()).toBe(0);

        // test registering an arrow function
//        testling.register(() => f());
//        expect(testling.count).toBe(1);
//        testling.unregister(() => f());
//        expect(testling.count).toBe(0);


    })
});


