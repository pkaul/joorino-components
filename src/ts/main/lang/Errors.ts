/**
 * Utility class for dealing with errors
 */
class Errors {

    private static STACK_PROPERTY:string = "stack";

    public static ILLEGAL_STATE:string          = "illegal_state";
    public static ILLEGAL_ARGUMENT:string       = "illegal_argument";
    public static ABSTRACT_FUNCTION:string      = "abstract_function";
    public static UNSUPPORTED_OPERATION:string  = "unsupported_operation";
    public static ASSERTION:string              = "assertion";

    /**
     * Throws an error that indicates that an object is in a state that does not allow to execute a certain function
     */
    public static createIllegalStateError(message?:string):Error {
        return Errors.createError(Errors.ILLEGAL_STATE, message);
    }

    /**
     * creates an error that indicates that an invalid argument has been passed to a function
     */
    public static createIllegalArgumentError(message?:string):Error {
        return Errors.createError(Errors.ILLEGAL_ARGUMENT, message);
    }

    /**
     * creates an error that indicates that the called function is "abstract" and needs to be implemented properly
     */
    public static createAbstractFunctionError(message?:string):Error {
        return Errors.createError(Errors.ABSTRACT_FUNCTION, message);
    }

    /**
     * creates an error that indicates that an assertion is not fulfilled
     */
    public static createAssertionError(message?:string):Error {
        return Errors.createError(Errors.ASSERTION, message);
    }

    /**
     * creates an error that indicates that a function is invoked that is not supported in the current context
     */
    public static createUnsupportedOperationError(message?:string):Error {
        return Errors.createError(Errors.UNSUPPORTED_OPERATION, message);
    }

    // ==========

    public static createError(type:string, message?:string):Error {

        if( message !== undefined ) {
            return new Error(type+": "+message);
        }
        else {
            return new Error(type);
        }
    }

    /**
     * Gets an error's stack trace
     * @param error The error
     * @return The stack trace or null if none available
     */
    public static getStackTrace(error:Error):string {
       return error[Errors.STACK_PROPERTY] !== undefined ? error[Errors.STACK_PROPERTY] : null;
    }

    /**
     * Formats an error into a user readable way that is helpful for debugging
     * @param error
     */
    public static format(error:Error):string {

        if( error != null ) {
            var stack:string = Errors.getStackTrace(error);
            if( stack !== null ) {
               return error.message+"\n"+stack;
            }
            else {
                return error.message;
            }
        }
        else {
            return null;
        }
    }

}

export = Errors;