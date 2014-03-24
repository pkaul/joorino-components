/// <reference path="../jasmine/jasmine.d.ts"/>

import StringMap = require("../main/StringMap");

/**
 * Tests {@link StringMap}
 */
describe("StringMap", function() {

    it("all", function() {

        var testlings:StringMap<string>[] = [new StringMap<string>(true), new StringMap<string>(false)];
        for( var t:number = 0; t<testlings.length; t++ ) {

            var testling:StringMap<string> = testlings[t];

            testling.set("a", "1");
            expect(testling.size).toBe(1);
            expect(testling.get("a")).toBe("1");

            expect(testling.has("a")).toBe(true);
            expect(testling.has("b")).toBe(false);

            testling.set("c", "3");
            expect(testling.get("c")).toBe("3");
            expect(testling.size).toBe(2);

            testling.set("b", "2");
            expect(testling.get("b")).toBe("2");
            expect(testling.size).toBe(3);

            expect(testling.keys().join(",")).toBe("a,c,b");
            expect(testling.values().join(",")).toBe("1,3,2");

            testling.set("a", "4");
            expect(testling.size).toBe(3);
            expect(testling.get("a")).toBe("4");

            expect(testling.keys().join(",")).toBe("a,c,b");
            var fe:string[] = [];
            testling.forEach((v:string, k:string) => {
                fe.push(v);
                fe.push(k);
            });
            expect(fe.join(",")).toBe("4,a,3,c,2,b");

            testling.delete("a");
            expect(testling.size).toBe(2);
            expect(testling.get("a")).toBe(undefined);
            expect(testling.keys().join(",")).toBe("c,b");
            expect(testling.values().join(",")).toBe("3,2");

            testling.clear();
            expect(testling.size).toBe(0);
            expect(testling.keys().join(",")).toBe("");
        }

    });





});



