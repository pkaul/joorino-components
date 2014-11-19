import ComponentFactory = require("./ComponentFactory");
import ComponentProcessor = require("./ComponentProcessor");
import ComponentProcessors = require("./ComponentProcessors");
import ComponentBase = require("../ComponentBase");
import Components = require("../Components");
import Maps = require("../../lang/Maps");
import Errors = require("../../lang/Errors");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>

/**
 * ComponentFactory base implementation that supports {@link ComponentProcessor}s
 */
class ComponentFactoryBase extends ComponentBase implements ComponentFactory {

    private _initTimeout:number = 10000;    // TODO
    private _destroyTimeout:number = 5000;  // TODO

    // all processors
    private _processors:ComponentProcessor[] = [];

    // mapping of built components as "name -> component"
    private _components:Map<string, Object> = null;

    // -- to be used during initialization only
    // current stack of dependencies (component names)
    private _buildDependencyStack:string[];
    // map of components that are currently under construction
    private _buildComponents:Map<string, Object>;


    private _parent:ComponentFactory = null;


    constructor(parent:ComponentFactory = null) {
        super();
        this._parent = parent;
    }


    /**
     * @param processors Bean processors to be applied to every component
     */
    public setProcessors(processors:ComponentProcessor[]):void {
        this._processors = processors;
    }

    public getComponentCount():number {
        if( this._components === null ) {
            throw Errors.createIllegalStateError("Not initialized or already destroyed");
        }
        return this._components.size + (this._parent !== null ? this._parent.getComponentCount() : 0);
    }

    public getComponent(name:string):any {
        if( this._components === null ) {
            throw Errors.createIllegalStateError("Not initialized or already destroyed");
        }
        var result:Object = this._components.has(name) ? this._components.get(name) : null;
        // no such component? look into the parent ...
        if( result === null && this._parent !== null ) {
            result = this._parent.getComponent(name);
        }
        return result;
    }


    public init():Promise<any> {

        if( this._components !== null ) {
            throw Errors.createIllegalStateError("Already initialized");
        }


//        var _superInitializable:lifecycle.Initializable = super;

        return this.buildComponents().then((components:Map<string, Object>) => {

            this.getLogger().info("Created {0} components: {1}", components.size, Maps.keys(components));

            // ----------- pre-initialize
            this.getLogger().info("Pre-Initializing");
            return ComponentProcessors.processBeforeInit(this._processors, components, this._initTimeout).then(() => {

                // ----------- initialize
                this.getLogger().info("Initializing");
                return Components.initAll(Maps.values(components), this._initTimeout).then(() => {

                    // ----------- post-initialize
                    this.getLogger().info("Post-Initializing");
                    return ComponentProcessors.processAfterInit(this._processors, components, this._initTimeout).then(() => {
                        this.getLogger().info("Initialized components: {0}", Maps.keys(components));
                        this._components = components; // store the components

                        return super.init();
                    });
                });
            });
        }).catch((error:any) => {
            this.getLogger().error("Error initializing components: {0}", error);
        });
    }

    public destroy():Promise<any> {

        if( this._components === null ) {
            throw Errors.createIllegalStateError("Not initialized or already destroyed");
        }

        var superDestroy:Function = super.destroy;
        // ----------- pre-destroy
        this.getLogger().debug("Pre-Destroying");
        return ComponentProcessors.processBeforeDestroy(this._processors, this._components, this._destroyTimeout).then(() => {

            // --------------- destroy
            this.getLogger().debug("Destroying");
            var components:Object[] = Maps.values(this._components);
            components.reverse(); // destroy in reverse order!
            return Components.destroyAll(components, this._destroyTimeout).then(() => {

                // -------------- post-destroy
                this.getLogger().debug("Post-Destroying");
                return ComponentProcessors.processAfterDestroy(this._processors, this._components, this._destroyTimeout).then(() => {
                    this._components = null; // mark as destroyed
                    this.getLogger().info("Destroyed");
                    return superDestroy.apply(null);
                });
            });
        }).catch((error:any) => {
            this.getLogger().error("Error destroying components: {0}", error);
        });
    }


    // ==============

    /**
     * @return The names of all (locally) created components in the order of creation
     * @protected
     */
    public getComponentNames():string[] {
        if( this._components === null ) {
            throw Errors.createIllegalStateError("Not initialized or already destroyed");
        }
        return Maps.keys(this._components);
    }

    /**
     * Triggers building all component instances (without initializing them). TO BE IMPLEMENTED by custom implementation.
     * Should delegate to {@link  #doBuildBeans}
     *
     * @return The promise containing the builded components
     * @protected
     */
    public buildComponents():Promise<Map<string, Object>> {
        throw Errors.createAbstractFunctionError("buildComponents");
    }


    /**
     * Creates a component and populates its properties. TO BE IMPLEMENTED by custom implementation.
     * @param componentName The component name
     * @return The promise containing the created and populated component
     * @protected
     */
    public doCreateComponent(componentName:string):Promise<Object> {
        throw Errors.createAbstractFunctionError("createComponent");
    }

    // ==============


    /**
     * Triggers building named components. This will result in invocations of {@link #createComponent}
     * @param componentNames The (unordered) names of the components to be built
     * @return A promise containing all built components as a map name -> component.
     * @protected
     */
    public doBuildBeans(componentNames:string[]):Promise<Map<string, Object>> {

        this.getLogger().info("Creating {0} components ...", componentNames.length);
        this.initializeBuild();

        // trigger creation of all beans ...
        return this.getOrCreateComponents(componentNames).then((components:Map<string,Object>) => {

            // all components have been created now.
            // ... clean up ...
            this.cleanupBuild();

            this.getLogger().debug("Creating components {0} has been finished", componentNames);

            // ... and return
            return Promise.resolve(components);
        });
    }


    /**
     * Provides dependencies that are required by the current component
     * @param dependencyNames The names of the (dependency) components that shall be resolved
     * @return The promise containing the resolved dependencies
     * @protected
     * @deprecated Use {@link #require}
     */
    public resolveDependencies(dependencyNames:string[]):Promise<Map<string, Object>> {

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
    public require(dependencyNames:string[]):Promise<Object[]> {

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
        this._buildComponents = Maps.createMap(true);
        this._buildDependencyStack = [];
    }

    /**
     * Cleans up after the build process.
     */
    private cleanupBuild():void {
        this._buildComponents = null;
        this._buildDependencyStack = null;
    }


    /**
     * Gets or creates a list of components sequentially
     * @param componentNames The names of the components.
     * @return The components
     */
    private getOrCreateComponents(componentNames:string[]):Promise<Map<string,Object>> {

        // get or create the first/next in the list
        var next:string = componentNames[0];
        return this.getOrCreateComponent(next).then((component:any) => {

            if( componentNames.length == 1 ) {
                // this was the last one. return the result
                var result:Map<string,Object> = Maps.createMap(true);
                result.set(next, component);
                return Promise.resolve(result);
            }
            else {
                // still elements to process. process the remaining
                return this.getOrCreateComponents(componentNames.slice(1)).then((components:Map<string,Object>) => {
                    components.set(next, component);
                    return Promise.resolve(components);
                });
            }
        });

    }

    /**
     * Gets or creates a named component
     * @param componentName The component name
     * @return The promise containing the component instance
     */
    private getOrCreateComponent(componentName:string):Promise<Object> {

        if(this._buildComponents.has(componentName) ) {
            // already built. pass the existing component to the callback
            var existing:any = this._buildComponents.get(componentName);
            this.getLogger().debug("Component {0} is already available: {1}", componentName, existing);
            return Promise.resolve(existing);
        }
        else {

            // not built yet.
            this.getLogger().info("Creating component {0} ...", componentName);
            if( this._buildDependencyStack.indexOf(componentName) !== -1 ) {
                throw Errors.createIllegalStateError("Recursion detected: "+this._buildDependencyStack.join(" -> ")+" -> "+componentName);
            }
            this._buildDependencyStack.push(componentName); // put the current name on the stack for detecting recursions

            // do build (recursively)
            return this.doCreateComponent(componentName).then((createdComponent:Object) => {

                this.getLogger().info("Component {0} has been created: {1}", componentName, createdComponent);
                // register component
                this._buildComponents.set(componentName, createdComponent);
                // remove the current name from the stack
                this._buildDependencyStack.pop();
                return Promise.resolve(createdComponent);
            });
        }
    }
}
export = ComponentFactoryBase;