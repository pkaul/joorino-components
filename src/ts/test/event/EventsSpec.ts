/// <reference path="../../jasmine/jasmine.d.ts"/>

import Events = require("../../main/event/Events");
import EventHub = require("../../main/event/EventHub");


/**
 * Tests {@link Events}
 */
describe("Events", function():void {


    it("isEventSubscriber", function():void {

        expect(Events.isEventSubscriber(null)).toBe(false);
        expect(Events.isEventSubscriber(undefined)).toBe(false);
        expect(Events.isEventSubscriber(function():void {})).toBe(false);
        expect(Events.isEventSubscriber(5)).toBe(false);
        expect(Events.isEventSubscriber({})).toBe(false);
        expect(Events.isEventSubscriber({"subscribeEvent": function():void {}, "unsubscribeEvent": function():void {}})).toBe(true);
        expect(Events.isEventSubscriber(new EventHub())).toBe(true);
    });

    it("isEventPublisher", function():void {

        expect(Events.isEventPublisher(null)).toBe(false);
        expect(Events.isEventPublisher(undefined)).toBe(false);
        expect(Events.isEventPublisher(function():void {})).toBe(false);
        expect(Events.isEventPublisher(5)).toBe(false);
        expect(Events.isEventPublisher({})).toBe(false);
        expect(Events.isEventPublisher({"publishEvent": 5,"hasSubscriber":5})).toBe(false);
        expect(Events.isEventPublisher({"publishEvent": function():void {},"hasSubscriber":function(){}})).toBe(true);
        expect(Events.isEventPublisher(new EventHub())).toBe(true);
    });

});
