/// <reference path="../../jasmine/jasmine.d.ts"/>

import Components = require("../../main/component/Components");
import ComponentBase = require("../../main/component/ComponentBase");


/**
 * Tests {@link ComponentBase}
 */
describe("LifecycleBean", function():void {

    /**
     * Tests the entire lifecycle
     */
    it("testLifecycle", function() {

        var initializeCount:number = 0;
        var destroyCount:number = 0;
        var startCount:number = 0;
        var stopCount:number = 0;

        var initializeCallback:Function = function(bean:Object, eventName:string):void {
            expect(bean).toBe(testling);
            expect(eventName).toBe(Components.EVENT_INITIALIZED);
            initializeCount++;
        };
        var destroyCallback:Function = function(bean:Object, eventName:string):void {
            expect(bean).toBe(testling);
            expect(eventName).toBe(Components.EVENT_DESTROYED);
            destroyCount++;
        };
        var startCallback:Function = function(bean:Object, eventName:string):void {
            expect(bean).toBe(testling);
            expect(eventName).toBe(Components.EVENT_STARTED);
            startCount++;
        };
        var stopCallback:Function = function(bean:Object, eventName:string):void {
            expect(bean).toBe(testling);
            expect(eventName).toBe(Components.EVENT_STOPPED);
            stopCount++;
        };

        // --- create
        var testling:ComponentBase = new ComponentBase();
        testling.subscribeEvent(Components.EVENT_INITIALIZED, initializeCallback);
        testling.subscribeEvent(Components.EVENT_DESTROYED, destroyCallback);
        testling.subscribeEvent(Components.EVENT_STARTED, startCallback);
        testling.subscribeEvent(Components.EVENT_STOPPED, stopCallback);

        expect(testling.getState()).toBe(ComponentBase.STATE_CREATED);
        expect(initializeCount).toBe(0);
        expect(destroyCount).toBe(0);
        expect(startCount).toBe(0);
        expect(stopCount).toBe(0);

        // --- initialize
        testling.init();
        expect(testling.getState()).toBe(ComponentBase.STATE_INITIALIZED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(0);
        expect(startCount).toBe(0);
        expect(stopCount).toBe(0);

        // --- initialize again
        expect(() => {testling.init()}).toThrow();   // expect init() to throw an error
        expect(testling.getState()).toBe(ComponentBase.STATE_INITIALIZED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(0);
        expect(startCount).toBe(0);
        expect(stopCount).toBe(0);

        // --- start
        testling.start();
        expect(testling.getState()).toBe(ComponentBase.STATE_STARTED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(0);
        expect(startCount).toBe(1);
        expect(stopCount).toBe(0);

        // --- start again
        testling.start();
        // expect no change
        expect(testling.getState()).toBe(ComponentBase.STATE_STARTED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(0);
        expect(startCount).toBe(1);
        expect(stopCount).toBe(0);

        // --- stop
        testling.stop();
        expect(testling.getState()).toBe(ComponentBase.STATE_STOPPED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(0);
        expect(startCount).toBe(1);
        expect(stopCount).toBe(1);

        // --- stop again
        testling.stop();
        // expect no change
        expect(testling.getState()).toBe(ComponentBase.STATE_STOPPED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(0);
        expect(startCount).toBe(1);
        expect(stopCount).toBe(1);

        // --- destroy
        testling.destroy();
        expect(testling.getState()).toBe(ComponentBase.STATE_DESTROYED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(1);
        expect(startCount).toBe(1);
        expect(stopCount).toBe(1);

        // --- destroy again
//        expect(testling.destroy).toThrow();   // expect destroy() to throw an error
        testling.destroy();  // TODO not sure: shall be throw an exception here?
        expect(testling.getState()).toBe(ComponentBase.STATE_DESTROYED);
        expect(initializeCount).toBe(1);
        expect(destroyCount).toBe(1);
        expect(startCount).toBe(1);
        expect(stopCount).toBe(1);

    })
});

