/// <reference path="../jasmine/jasmine.d.ts"/>

import Classes = require("../main/Classes");

/**
 * Tests {@link Classes}
 */
describe("Classes", function() {

    /**
     * Tests {@link Classes#getClassName}
     */
    it("getClassName", function() {
        // test object of class
        expect(Classes.getClassName(new Classes())).toBe('Classes');
        // test class
        expect(Classes.getClassName(Classes)).toBe('Classes');
    });
});

