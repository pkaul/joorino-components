import Initializable = require("../component/Initializable");
import Destroyable = require("../component/Destroyable");
import Startable = require("../component/Startable");
import Stoppable = require("../component/Stoppable");
import EventSubscriber = require("../event/EventSubscriber");

/**
 * A scene
 */
interface Scene extends Initializable, Destroyable, Startable, Stoppable, EventSubscriber {

}

export = Scene;