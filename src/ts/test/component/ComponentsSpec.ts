/// <reference path="../../jasmine/jasmine.d.ts"/>

import Components = require("../../main/component/Components");
import TestLifecycleBean = require("./TestComponent");

/**
 * Tests {@link Components}
 */
describe("Components", function():void {


    it("testIsInitializable", function():void {

        expect(Components.isInitializable(null)).toBe(false);
        expect(Components.isInitializable(undefined)).toBe(false);
        expect(Components.isInitializable(function():void {})).toBe(false);
        expect(Components.isInitializable(5)).toBe(false);
        expect(Components.isInitializable({})).toBe(false);
        expect(Components.isInitializable({"init": function():void {}})).toBe(true);
        expect(Components.isInitializable(new TestLifecycleBean())).toBe(true);
    });

    it("testIsDestroyable", function():void {

        expect(Components.isDestroyable(null)).toBe(false);
        expect(Components.isDestroyable(undefined)).toBe(false);
        expect(Components.isDestroyable(function():void {})).toBe(false);
        expect(Components.isDestroyable(5)).toBe(false);
        expect(Components.isDestroyable({})).toBe(false);
        expect(Components.isDestroyable({"destroy": function():void {}})).toBe(true);
        expect(Components.isDestroyable(new TestLifecycleBean())).toBe(true);
    });
});
