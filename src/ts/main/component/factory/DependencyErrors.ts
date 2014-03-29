
import Errors = require("../../lang/Errors")

/**
 * Errors that are thrown when a component dependency does not fulfill certain requirements
 */
class DependencyErrors  {

    /**
     * Error key for a dependency error
     */
    public static DEPENDENCY:string       = "dependency";

    /**
     * Throws an {@link Error} if a given dependency is null or undefined
     * @param name The dependency component's name
     * @param value The dependency value
     */
    public static ifNull(name:string, value:any):void {
        if( value === null || value === undefined ) {
            throw Errors.createError(DependencyErrors.DEPENDENCY, name+" is undefined or null");
        }
    }

    /**
     * Throws an {@link Error} if a given dependency is an array, vector or string and has the length 0
     * @param name The dependency component's name
     * @param value The dependency value
     */
    public static ifEmpty(name:string, value:any):void {

        DependencyErrors.ifNull(name,  value);
        if( typeof value === 'array' && (<any[]> value).length === 0 ) {
            throw Errors.createError(DependencyErrors.DEPENDENCY, name+" is empty");
        }
        else if( typeof value === 'string' && (<string> value).length === 0 ) {
            throw Errors.createError(DependencyErrors.DEPENDENCY, name+" is empty");
        }
    }
}
export = DependencyErrors;
