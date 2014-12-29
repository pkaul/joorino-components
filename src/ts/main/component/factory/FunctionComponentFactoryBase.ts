import ComponentFactoryBase = require("./ComponentFactoryBase");
import ComponentProcessor = require("../manager/ComponentProcessor");
import ComponentManager = require("../manager/ComponentManager");
import Maps = require("../../lang/Maps");
import Errors = require("../../lang/Errors");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * A component factory where the components will be created from custom factory functions that have to be added
 * by subclasses of this implementation.
 * Example: An application context consisting of two components "myComponent1" and "myComponent2" where "myComponent2" depends on "myComponent1"
 * may be defined like:
 * <code>
 * public createMyComponent1():Promise<any> {
 *  var component1:Object = ...
 *  return Promise.resolve(component1);
 * }
 *
 * public createMyComponent2():Promise<any> {
 *  this.require(["myComponent1"], (dependencies:Object[]) => {
 *   var component1Dependency = dependencies[0];
 *   var component2:Object = ...
 *   component2.myComponent1 = component1Dependency;
 *   return Promise.resolve(component2);
 *  }
 * }
 * </code>
 */
class FunctionComponentFactoryBase extends ComponentFactoryBase {

    /**
     * Regexp for detecting creator functions for components: These component's functions need to be like
     * "createComponent[componentName]". Note that a suffix "$[digits]" might be available, too.
     */
    private static CREATOR_FUNCTION_PATTERN:RegExp = new RegExp("^createComponent(\\w+)(\\$\\d+)?$");


    // definition of the components name:String -> creator:Function
    private _componentsDefinitions:Map<string, Function>;


    // ==============


    constructor(name?:string, parent?:ComponentManager, processors?:ComponentProcessor[]) {
        super(name, parent, processors);
    }

    // ===================


    /*protected*/ buildAllComponents():Promise<any> {

        this._componentsDefinitions = this.lookupComponentCreators();
        if( this._componentsDefinitions.size === 0 ) {
            throw Errors.createIllegalArgumentError("No component definitions available: "+this._componentsDefinitions);
        }

        return this.buildComponents(Maps.keys(this._componentsDefinitions));
    }


    /*protected*/ buildComponent(name:string):Promise<Object> {

        // lookup 'create' function from definitions
        var createFunction:Function = this._componentsDefinitions.get(name);
        if( createFunction == null ) {
            throw Errors.createIllegalArgumentError("No function for creating component "+name+" available");
        }

        // invoke 'create' function
        var result:any = createFunction.apply(this);
        if( result === undefined || result === null || typeof result['then'] !== 'function' )  {
            throw Errors.createIllegalStateError("Function for creating component "+name+" didn't return with a promise");
        }

        return (<Promise<Object>> result).then((component:Object) => {

            if( component === null || component === undefined ) {
                throw Errors.createIllegalArgumentError("Result of component '"+name+"''s is undefined");
            }

            //this.getLogger().info("Component {0} has been created: {1}", name, component);
            return Promise.resolve(component);
        });
    }



    /*protected*/ hasComponentDefinition(componentName:string):boolean {
        return this._componentsDefinitions.has(componentName);
    }

// =========


    /**
     * Look ups the component creator functions
     * @return The functions as componentName:string -> creator:function
     */
    private lookupComponentCreators():Map<string, Function> {

        var result:Map<string, Function> = Maps.createMap<Function>();

        // iterate through all properties
        var ac:Object = this;
        for( var functionName in ac ) {

            var matchResult:RegExpExecArray = FunctionComponentFactoryBase.CREATOR_FUNCTION_PATTERN.exec(functionName);
            if( matchResult !== null && typeof (ac[functionName]) === 'function') {
                // property name matches the naming pattern and it is a function
                var name:string = matchResult[1];
                name = name.charAt(0).toLowerCase()+name.substring(1); // lowercase first character
                var creator:Function = this[functionName];
                this.getLogger().info("Found creator function {0} for bean {1}", functionName, name);
                result.set(name, creator);
            }
//      else {
//        getLogger().debug("Skipped property {0} as creator function", functionName);
//      }
        }

        if( result.size === 0 ) {
            throw Errors.createIllegalArgumentError("No functions for creating components found");
        }

        return result;
    }

}

export = FunctionComponentFactoryBase;

