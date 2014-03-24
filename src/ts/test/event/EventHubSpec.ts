/// <reference path="../../jasmine/jasmine.d.ts"/>

import EventHub = require("../../main/event/EventHub");


/**
 * Tests {@link EventHub}
 */
describe("EventHub", function():void {

    it("testRegisterNotifyUnregister", function():void {

        var collector:string[] = [];

        var f1:Function = function(p1:string, p2:string):void {
            collector.push("f1("+p1+")");
            collector.push("f1("+p2+")");
        };

        var f2:Function = function(p1:string, p2:string):void {
            collector.push("f2("+p1+")");
            collector.push("f2("+p2+")");
        };

        var f3:Function = function(p1:string, p2:string):void {
            collector.push("f3("+p1+")");
            collector.push("f3("+p2+")");
        };


        var testling:EventHub = new EventHub();
        testling.subscribeEvent("event_a", f1);
        testling.subscribeEvent("event_a", f2);
        testling.subscribeEvent("event_b", f3);

        expect(testling.getSubscribers("event_a").length).toBe(2);
        expect(testling.getSubscribers("event_b").length).toBe(1);

        testling.publishEvent("event_a", "a","b");
        expect(collector.join(",")).toBe("f1(a),f1(b),f2(a),f2(b)");

        testling.publishEvent("event_b", "x", "y");
        testling.publishEvent("event_unknown", "r", "s");
        expect(collector.join(",")).toBe("f1(a),f1(b),f2(a),f2(b),f3(x),f3(y)");

        testling.unsubscribeEvent("event_a", f1);
        expect(() => {testling.unsubscribeEvent("event_unknown", f2)}).toThrow();
        expect(() => {testling.unsubscribeEvent("event_a", f3)}).toThrow();

        testling.publishEvent("event_a", "p","q");
        expect(collector.join(",")).toBe("f1(a),f1(b),f2(a),f2(b),f3(x),f3(y),f2(p),f2(q)");

        expect(testling.getSubscribers("event_a").length).toBe(1);
        expect(testling.getSubscribers("event_b").length).toBe(1);
    })
});
