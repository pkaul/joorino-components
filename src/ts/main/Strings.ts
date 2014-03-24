/**
 * Utilities that are related to {@link string}s
 */
class Strings {


    /**
     * Formats a string that contains placeholder, such as "{0}"
     * @param text the original string
     * @param p1 A parameter to be used for substituting placeholder '0'
     * @param p2 A parameter to be used for substituting placeholder '1'
     * @returns The formatted string
     */
    public static format(text:string, p1?:any, p2?:any, p3?:any, p4?:any, p5?:any):string {

        var result:string = text;
        if( p1 !== undefined ) {
            result = result.replace("{0}", p1);

            if( p2 !== undefined ) {
                result = result.replace("{1}", p2);

                if( p3 !== undefined ) {
                    result = result.replace("{2}", p3);

                    if( p4 !== undefined ) {
                        result = result.replace("{3}", p4);

                        if( p5 !== undefined ) {
                            result = result.replace("{4}", p5);
                        }
                    }
                }
            }
        }

        return result;
    }
}

export = Strings;