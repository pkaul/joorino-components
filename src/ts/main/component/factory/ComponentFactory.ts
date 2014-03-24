import Initializable = require("../Initializable");
import Destroyable = require("../Destroyable");


/**
 * Factory for creating and wiring component instances including lifecycle management
 */
interface ComponentFactory extends Initializable, Destroyable {

    /**
     * Provides a (recently) created component.
     * @param name Then component's name
     * @return The component or null if no such bean exists
     */
    getComponent(name:string):any;

    /**
     * @return The number of components that are managed by this factory
     */
    getComponentCount():number;
}

export = ComponentFactory;
