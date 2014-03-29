import Functions = require("./Functions");

/**
 * Class reflection helper functions
 */
class Classes {


    /**
     * Provides the class name of an object
     * @param obj The object
     * @return The class name
     */
    public static getClassName(obj:any):string {

        if( typeof obj === 'function' && obj['prototype'] !== undefined && typeof obj['prototype']['constructor'] === 'function') {
            // assuming that this function is the class itself
            return Functions.getFunctionName(<Function> obj['prototype']['constructor']);
        }
        else if( typeof obj === 'object' && typeof obj['constructor'] === 'function') {
            return Functions.getFunctionName(<Function> obj['constructor'])
        }
        else {
            return "(unknown)";
        }
    }


    /**
     * Checks whether a given object implements a certain interface. Since interfaces are not supported on runtime,
     *  this is done by checking the existence of certain functions
     *
     * @param obj The object to check
     * @param f1 name of a function that is a member of the class/interface
     * @param f2 optional: name of a another function that is a member of the class/interface
     * @param f3 optional: name of a another function that is a member of the class/interface
     * @returns true, if all the given functions exist
     */
    public static doesImplement(obj:any, f1:string, f2?:string, f3?:string):boolean {

        if( obj !== null && typeof obj === 'object' ) {

            if(f1 !== undefined && typeof obj[f1] !== 'function' ) {
                return false;
            }
            else if(f2 !== undefined && typeof obj[f2] !== 'function' ) {
                return false;
            }
            else if(f3 !== undefined && typeof obj[f3] !== 'function' ) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }

    }
}

export = Classes;