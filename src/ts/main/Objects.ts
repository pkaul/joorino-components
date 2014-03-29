import Identifiable = require("./Identifiable");
import Ordered = require("./Ordered");
import Classes = require("./Classes");


/**
 * Helper functions related to objects
 */
class Objects {

    private static GETID_FUNCTION = "getId";
    private static GETORDER_FUNCTION = "getOrder";

    /**
     * Checks whether the given bean is {@link Identifiable}
     */
    public static isIdentifiable(bean:Object):boolean {
        return Classes.doesImplement(bean, Objects.GETID_FUNCTION);
    }

    /**
     * Provides a bean's id if it Identifiable or a default if not available
     */
    public static getId(bean:Object, def:string = null):string {
        if( Objects.isIdentifiable(bean) ) {
            return bean[Objects.GETID_FUNCTION]();
        }
        else {
            return def;
        }
    }

    /**
     * Checks whether the given bean is {@link Ordered}
     */
    public static isOrdered(bean:Object):boolean {
        return Classes.doesImplement(bean, Objects.GETORDER_FUNCTION);
    }

    /**
     * Provides a bean's order if it {@link Ordered} or a default if unavailable.
     */
    public static getOrder(bean:Object, def:number = 0):number {
        if( Objects.isOrdered(bean) ) {
            return bean[Objects.GETORDER_FUNCTION]();
        }
        else {
            return def;
        }
    }

    /**
     * Sorts a list of object using the {@link Ordered} signature. If not ordered, 0 is used as default order
     */
    public static sortOrdered<T>(objects:T[]):T[] {
        return objects.sort(Objects.sortOrderedFunction);
    }

    // ==========

    private static sortOrderedFunction(first:Object, second:Object):number {
        return Objects.getOrder(first, 0)-Objects.getOrder(second, 0);
    }


}

export = Objects;