/// <reference path="../jasmine/jasmine.d.ts"/>

import Maps = require("../main/Maps");

/**
 * Tests {@link Maps}
 */
describe("Maps", function() {

    it("all", function() {

        var testlings:Map<string, string>[] = [Maps.createMap<string>(true), Maps.createMap<string>(false)];
        for( var t:number = 0; t<testlings.length; t++ ) {

            var testling:Map<string, string> = testlings[t];

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

            expect(Maps.keys(testling).join(",")).toBe("a,c,b");
            expect(Maps.values(testling).join(",")).toBe("1,3,2");

            testling.set("a", "4");
            expect(testling.size).toBe(3);
            expect(testling.get("a")).toBe("4");

            expect(Maps.keys(testling).join(",")).toBe("a,c,b");
            var fe:string[] = [];
            testling.forEach((v:string, k:string) => {
                fe.push(v);
                fe.push(k);
            });
            expect(fe.join(",")).toBe("4,a,3,c,2,b");

            testling.delete("a");
            expect(testling.size).toBe(2);
            expect(testling.get("a")).toBe(undefined);
            expect(Maps.keys(testling).join(",")).toBe("c,b");
            expect(Maps.values(testling).join(",")).toBe("3,2");

            testling.clear();
            expect(testling.size).toBe(0);
            expect(Maps.keys(testling).join(",")).toBe("");
        }

    });
});



