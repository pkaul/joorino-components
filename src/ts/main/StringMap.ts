/**
 * A map implementation that is restricted to string based keys. In addition, the map is able to preserve the elements order.
 */
class StringMap<T> implements Map<string, T> {

    private _elements:Object = {};
    private _sorted:boolean;
    private _sortedKeys:string[];
    public size:number = 0;

    constructor(sorted:boolean = false) {
        this._sorted = sorted;
        if( sorted ) {
            this._sortedKeys = [];
        }
    }

    public forEach(callbackfn: (value: T, index: string, map: Map<string, T>) => void, thisArg?: any): void {

        if( this._sorted ) {

            // iterate over sorted keys
            for( var i:number = 0; i<this._sortedKeys.length; i++ ) {
                var key:string = this._sortedKeys[i];
                callbackfn.apply(thisArg, [this._elements[key], key, this]);
            }
        }
        else {

            for( var key in this._elements ) {
                if( this._elements.hasOwnProperty(key) ) {
                    callbackfn.apply(thisArg, [this._elements[key], key, this]);
                }
            }
        }
    }


    public clear():void {
        this._elements = {};
        if( this._sorted ) {
            this._sortedKeys = [];
        }
        this.size = 0;
    }


    public get(key:string):T {
        return this._elements[key];
    }

    public has(key:string):boolean {
        return this._elements[key] !== undefined;
    }

    public delete(key:string):boolean {

        var result:boolean = delete this._elements[key];
        if( result ) {
            this.size--;
        }

        if (this._sorted) {
            // delete the key from sort list
            var i:number = this._sortedKeys.indexOf(key);
            if( i !== -1 ) {
                this._sortedKeys.splice(i, 1);
            }
        }

        return result;
    }


    public set(key:string, value:T):Map<string,T> {

        var exists:boolean = this.has(key);
        this._elements[key] = value;
        if( this._sorted && this._sortedKeys.indexOf(key) === -1 ) {
            // not contained yet
            this._sortedKeys.push(key);
        }
        if( !exists ) {
            this.size++;
        }
        return this;
    }

    /**
     * Puts several elements to the map
     * @param map The elements to put into the map
     */
//    public setAll(map:Object):void {
//        // TODO support map input
//        for( var key in map ) {
//            if( map.hasOwnProperty(key) ) {
//                this.set(key, map[key]);
//            }
//        }
//    }


    /**
     * Lists the keys that are currently managed by this map
     */
    public keys():string[] {
        if( this._sorted ) {
            return this._sortedKeys.slice(0);  // make a copy
        }
        else {

            // copy all keys into the result array
            var result:string[] = [];
            for( var key in this._elements ) {
                if( this._elements.hasOwnProperty(key) ) {
                    result.push(key);
                }
            }
            return result;
        }
    }

    /**
     * Lists the values that are currently managed by this map
     */
    public values():T[] {

        // copy all keys into the result array
        var result:T[] = [];
        if( this._sorted ) {

            for( var i:number = 0; i<this._sortedKeys.length; i++ ) {
                result.push(this._elements[this._sortedKeys[i]]);
            }
        }
        else {

            for( var key in this._elements ) {
                if( this._elements.hasOwnProperty(key) ) {
                    result.push(this._elements[key]);
                }
            }
        }

        return result;
    }




    public toString():string {
        return "StringMap[]";
    }
}

export = StringMap;
