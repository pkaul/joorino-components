import ComponentProcessor = require("./../manager/ComponentProcessor");
import ComponentProcessors = require("./../manager/ComponentProcessors");
import ComponentManager = require("../manager/ComponentManager");
import Components = require("../Components");
import Maps = require("../../lang/Maps");
import Errors = require("../../lang/Errors");
import assert = require("../../lang/assert");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * ComponentFactory base implementation that supports {@link ComponentProcessor}s
 */
class ComponentFactoryBase extends ComponentManager {

    // -- to be used during initialization only
    // current stack of dependencies (component names)
    private _buildDependencyStack:string[];

    constructor(name?:string, parent?:ComponentManager, processors?:ComponentProcessor[]) {
        super(name, parent, processors);
    }


    public init():Promise<any> {
        return this.buildAllComponents().
            then(() => {
                // perform initialization of all created components
                return super.init();
            }).catch((error:any) => {
                this.getLogger().error("Error building components: {0}", error);
            });
    }

    // ==============

    /**
     * Triggers building all component instances (without initializing them) and {@link #register registration}. TO BE IMPLEMENTED by custom implementation.
     * Should delegate to {@link  #doBuildBeans}
     * @protected
     */
    /*protected*/ buildAllComponents():Promise<any> {
        throw Errors.createAbstractFunctionError("buildAllComponents");
    }

    /**
     * Creates a component and populates its properties. TO BE IMPLEMENTED by custom implementation.
     * @param componentName The component name
     * @return The promise containing the created and populated component
     * @protected
     */
    /*protected*/ buildComponent(componentName:string):Promise<Object> {
        throw Errors.createAbstractFunctionError("createComponent");
    }

    /**
     * Whether or not this factory has a definition for the named component. TO BE IMPLEMENTED by custom implementation.
     */
    /*protected*/ hasComponentDefinition(componentName:string):boolean {
        throw Errors.createAbstractFunctionError("hasComponentDefinition");
    }

    /**
     * Triggers building named components. This will result in invocations of {@link #createComponent}
     * @param componentNames The (unordered) names of the components to be built
     * @protected
     */
    /*protected*/ buildComponents(componentNames:string[]):Promise<any> {

        this.getLogger().info("Creating {0} components ...", componentNames.length);
        this.initializeBuild();

        // trigger creation of all beans ...
        return this.getOrCreateComponents(componentNames).then(() => {
            // ... clean up ...
            this.cleanupBuild();
            this.getLogger().debug("Creating components {0} has been finished", componentNames);
            return Promise.resolve();
        });
    }

    /**
     * Provides dependencies that are required by the current component
     * @param dependencyNames The names of the (dependency) components that shall be resolved
     * @return The promise containing the resolved dependencies
     * @protected
     * @deprecated Use {@link #require}
     */
    /*protected*/ resolveDependencies(dependencyNames:string[]):Promise<Map<string, Object>> {

        if( dependencyNames.length === 0 ) {
            // no dependencies. return immediately
            this.getLogger().debug("No dependencies to resolve");
            return Promise.resolve(Maps.createMap());
        }

        this.getLogger().debug("Resolving dependencies [{0}] ...", dependencyNames);
        return this.getOrCreateComponents(dependencyNames).then((dependencies:Map<string,Object>) => {

            if( this.getLogger().isDebugEnabled() ) {
                this.getLogger().debug("Resolved dependencies [{0}] to {1}", dependencyNames, Maps.values(dependencies));
            }

            // return the dependencies as a map
            return Promise.resolve(dependencies);
        });
    }

    /**
     * Provides dependencies that are required by the current component
     * @param dependencyNames The names of the (dependency) components that shall be resolved
     * @return The promise containing the resolved dependencies
     * @protected
     */
    /*protected*/ require(dependencyNames:string[]):Promise<Object[]> {

        return this.resolveDependencies(dependencyNames).then((dependencies:Map<string, Object>) => {

            // copy map structure into more simple list structure
            var result:Object[] = [];
            for( var i:number = 0; i<dependencyNames.length; i++ ) {
                result.push(dependencies.get(dependencyNames[i]));
            }
            return Promise.resolve(result);
        });
    }

    // =========================

    /**
     * Initializes the build process.
     */
    private initializeBuild():void {
        this._buildDependencyStack = [];
    }

    /**
     * Cleans up after the build process.
     */
    private cleanupBuild():void {
        this._buildDependencyStack = null;
    }


    /**
     * Gets or creates a list of components sequentially
     * @param componentNames The names of the components.
     * @return The components
     */
    private getOrCreateComponents(componentNames:string[]):Promise<Map<string,Object>> {

        assert(componentNames.length > 0, "number of component names needs to be greater than zero");

        // get or create the first/next in the list
        var next:string = componentNames[0];
        return this.getOrCreateComponent(next).then((component:any) => {

            if( componentNames.length == 1 ) {
                // this was the last one.
                var result:Map<string, any> = Maps.createMap(true);
                result.set(next, component);
                return Promise.resolve(result);
            }
            else {
                // still elements to process. process the remaining
                return this.getOrCreateComponents(componentNames.slice(1)).then((components:Map<string,any>) => {

                    // add the current component to the map of previously fetched
                    components.set(next, component);
                    return Promise.resolve(components);
                });
            }
        }).catch((error:any) => {
            this.getLogger().error("Error creating component {0}: {1}", next, error);
            return Promise.reject("Error creating components "+componentNames); // bubble up
        });
    }

    /**
     * Gets or creates a named component
     * @param componentName The component name
     * @return The promise containing the component instance
     */
    private getOrCreateComponent(componentName:string):Promise<Object> {

        if(this.getComponents().has(componentName) ) {
            // already built. pass the existing component to the callback
            var existing:any = this.getComponents().get(componentName);
            this.getLogger().debug("Component {0} is already available: {1}", componentName, existing);
            return Promise.resolve(existing);
        }
        else if( this.hasComponentDefinition(componentName) ) {

            // not built yet but a definition is available
            this.getLogger().info("Creating component {0} ...", componentName);
            if( this._buildDependencyStack.indexOf(componentName) !== -1 ) {
                throw Errors.createIllegalStateError("Recursion detected: "+this._buildDependencyStack.join(" -> ")+" -> "+componentName);
            }
            this._buildDependencyStack.push(componentName); // put the current name on the stack for detecting recursions

            // do build (recursively)
            return this.buildComponent(componentName).then((createdComponent:Object) => {

                this.getLogger().info("Component {0} has been created: {1}", componentName, createdComponent);
                // register component
                this.register(createdComponent, componentName);
                // remove the current name from the stack
                this._buildDependencyStack.pop();
                return Promise.resolve(createdComponent);
            })/*.catch((error:any) => {
                this.getLogger().error("Error creating component {0}: {1}", componentName, error);
                return Promise.reject(error); // bubble up
            })*/;
        }
        else {

            // no definition available. have a look at the parent ...
            var result:any = null;
            if( !!this.getParent() ) {
                result = this.getParent().getComponent(componentName);
            }
            if( result === null ) {
                // parent doesn't know this
                return Promise.reject(Errors.createIllegalStateError("Unknown component "+componentName));
            }
            else {
                return Promise.resolve(result);
            }
        }
    }
}
export = ComponentFactoryBase;