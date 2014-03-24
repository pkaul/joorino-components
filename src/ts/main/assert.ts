import Strings = require("./Strings");

/**
 * A simple assertion: If a condition is not true, an error is thrown
 * @param condition The condition to be fulfilled for the assertion
 * @param message An optional message to be added to the error
 * @param p1 An optional message parameter
 */
var assert:Function = function(condition:boolean, message?:string, p1?:any, p2?:any, p3?:any, p4?:any, p5?:any)  {

    if(!condition) {
        if( message !== undefined ) {
            throw new Error("Assertion failed: "+Strings.format(message, p1, p2, p3, p4, p5));
        }
        else {
            throw new Error("Assertion failed");
        }
    }
};
export = assert;
