import Errors = require("./Errors");



/**
 * Function related utilities
 */
class Functions {


    /**
     * Regexp for extracting a function's name
     */
    private static FUNCTION_NAME_EXTRACTOR:RegExp = /function (.{1,})\(/;

    /**
     * Extracts the name of a given function
     * @param f The function
     */
    public static getFunctionName(f:Function):string {
        var results:RegExpExecArray =  Functions.FUNCTION_NAME_EXTRACTOR.exec(f.toString());
        return (results && results.length > 1) ? results[1] : "(unknown)";
    }

    /**
     * Binds a function that is part of the object's prototype to the object itself.
     * @param f the function to be bound. Needs to be a member of the object's prototype
     * @param instance the object to bind the function to
     * @return The bound function
     */
    public static bind(f:Function, instance:Object):Function {

        // 1. lookup name of function
        var functionName:string = null;
        for( var k in instance ) {
            if( instance[k] === f ) {
                functionName = k;
                break;
            }
        }

        if( functionName === null ) {
            throw Errors.createIllegalArgumentError("Function "+Functions.getFunctionName(f)+" can not be bound to "+instance+" because it is no prototype of this instance");
        }

        if (instance.hasOwnProperty(functionName)) {
            // function is already bound to object
            return instance[functionName];
        }


        // do the binding
        var boundMethod:Function = f.bind(instance);
        // add function to object
        instance[functionName] = boundMethod;


        return boundMethod;
    }
}

/**
 * Polyfill for Function.bind.
 * Copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

export = Functions;