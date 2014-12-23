/// <reference path="../../jasmine/jasmine.d.ts"/>

import ComponentManager = require("../../main/component/manager/ComponentManager");
import ComponentBase = require("../../main/component/ComponentBase");
import TestLifecycleBean = require("./TestComponent");

//import Configurator = require("../../main/logger/runtime/Configurator");

/**
 * Tests {@link ComponentManager}
 */
describe("ComponentManager", function():void {

    //Configurator.configure("debug");

    /**
     * Tests the entire lifecycle of managed services
     */
    it("testLifeCycle", function():void {

        //Configurator.configure("debug");

        var testling:ComponentManager = new ComponentManager();

        var b1:TestLifecycleBean = new TestLifecycleBean();
        var b2:TestLifecycleBean = new TestLifecycleBean();

        testling.register(b1,'1');
        testling.register(b2,'2');

        expect(testling.getCount()).toBe(2);
        expect(testling.getComponents().get('1')).toBe(b1);
        expect(testling.getComponents().get('2')).toBe(b2);

        expect(b1.getEventsAsString()).toBe("");
        expect(b2.getEventsAsString()).toBe("");

        var initialized:boolean = false;
        testling.init().then(() => {initialized = true;});
        waitsFor(function() {return initialized});
        runs(function() {

            expect(b1.getEventsAsString()).toBe("init");
            expect(b2.getEventsAsString()).toBe("init");

            testling.start();
            expect(b1.getEventsAsString()).toBe("init,start");
            expect(b2.getEventsAsString()).toBe("init,start");

            // notify about finished and expect destruction lifecycle
            b1.notifyFinished();
            expect(testling.getCount()).toBe(1);
            expect(testling.getComponents().get('2')).toBe(b2);
        });

        waitsFor(() => {
            // wait until destruction has taken place
            return b1.getEventsAsString() === "init,start,stop,destroy";
        });

        var destroyed:boolean = false;
        runs(() => {

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


    it("testGetComponents", function():void {

        var testling:ComponentManager = new ComponentManager();

        var b1:TestLifecycleBean = new TestLifecycleBean();
        var b2:string = "my-string";

        testling.register(b1, 'first');
        expect(testling.getComponents().size).toBe(1);
        expect(testling.getComponents().get('first')).toBe(b1);
        expect(testling.getComponent('first')).toBe(b1);

        testling.register(b2, 'second');
        expect(testling.getComponents().size).toBe(2);
        expect(testling.getComponent('second')).toBe(b2);
        expect(testling.getComponents().get('first')).toBe(b1);
        expect(testling.getComponents().get('second')).toBe(b2);
    });

    /**
     * Tests that lifecycle events will be applied on #register after container has been used
     */
    it("testRegisterAfterBegin", function():void {

        var testling:ComponentManager = new ComponentManager();

        var b1:TestLifecycleBean = new TestLifecycleBean();
        var b2:TestLifecycleBean = new TestLifecycleBean();

        testling.init().then(() => {
            testling.register(b1);
        });
        waitsFor(function() {
            return b1.getEventsAsString() === "init";
        });
        runs(function() {
            expect(b1.getEventsAsString()).toBe("init");
            testling.start();
            expect(b1.getEventsAsString()).toBe("init,start");
            testling.register(b2);
        });
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



