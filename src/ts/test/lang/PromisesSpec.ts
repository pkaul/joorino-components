/// <reference path="../../jasmine/jasmine.d.ts"/>
/// <reference path="../../es6-promises/es6-promises.d.ts"/>

import Promises = require("../../main/lang/Promises");

/**
 * Tests {@link Promises}
 */
describe("Promises", function():void {


    /**
     * Tests the Promise implementation's fulfill mechanism
     */
    it("PromiseWithFulfill", function():void {

        var value:number = 0;
        var p:Promise<number> = Promise.resolve<number>(10);
        p.then(
            (v:number) => {
                value = v;
            },
            (error:any) => {
                value = -1;
            });
        waitsFor(() => {
            return value == 10;
        });

        runs(function() {
            expect(value).toBe(10);
        });
    });

    /**
     * Tests the Promise implementation's reject mechanism
     */
    it("PromiseWithReject", function():void {

        var value:number = 0;
        var p:Promise<number> = Promise.reject("oh no");
        p.then(
            (v:number) => {
                value = v;
            },
            (error:any) => {
                value = -1;
            });
        waitsFor(() => {
            return value == -1;
        });

        runs(function() {
            expect(value).toBe(-1);
        });
    })

    it("promiseWithTimeoutWithTimeout", function():void {

        var result:string = "";

        // use a promise that is not evaluated at once
        var p:Promise<string> = new Promise<string>((resolve:(result:any) => void, reject:(error:any) => void) => {});
        Promises.withTimeout(p, () => {result += "timeout"}, 100);

        waitsFor(function() {
            return result.length > 0;
        }, "no result", 200);

        runs(function() {
            expect(result).toBe("timeout");
        });
    });

    it("promiseWithTimeoutWithResolve", function():void {

        var result:string = "";

        var def:Deferred<string> = new Deferred<string>();
        Promises.withTimeout(def.promise, () => {result += "timeout"}, 100).then(
            function(value:string) {
                result += value;
            },
            function(error:any) {
                result += error;
            });

        // resolve before timeout
        def.resolve("resolved");

        // make sure that timeout doesn't happen
        waits(200);

        runs(function() {
            expect(result).toBe("resolved");
        });
    });


    it("promiseWithTimeoutWithResolve", function():void {

        var result:string = "";

        var def:Deferred<string> = new Deferred<string>();
        Promises.withTimeout(def.promise, () => {result += "timeout"}, 100).then(
            function(value:string) {
                result += value;
            },
            function(error:any) {
                result += error;
            });

        // reject before timeout
        def.reject("reject");

        // make sure that timeout doesn't happen
        waits(200);

        runs(function() {
            expect(result).toBe("reject");
        });
    })

});

class Deferred<T> {

    public promise: Promise<T>;
    public resolve: (result:any) => void;
    public reject: (error:any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve:(result:any) => void, reject:(error:any) => void) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

