/// <reference path="../jasmine/jasmine.d.ts"/>
import Functions = require("../main/Functions");

/**
 * Tests {@link Functions}
 */
describe("Functions", function() {

    /**
     * Tests {@link Functions#getFunctionName}
     */
    it("getFunctionName", function() {

        var o:Object = {
            myFunctionName1: function myFunctionName2() {}
        };

        var f:Function = o['myFunctionName1'];

        // test object of class
        expect(Functions.getFunctionName(f)).toBe('myFunctionName2');
    });

});
