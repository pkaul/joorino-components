/// <reference path="../../es6-promises/es6-promises.d.ts"/>

import ComponentBase = require("../component/ComponentBase");
import Components = require("../component/Components");
import Scene = require("./Scene");
import Errors = require("../lang/Errors");
import Promises = require("../lang/Promises");


/**
 * A basic implementation for a scene manager that handles the choreography of scenes
 */
class SceneManagerBase extends ComponentBase {

    private static LIFECYCLE_TIMEOUT:number = 10000;

    // the currently running scene
    private _current:Scene = null;

    constructor(name:string=null) {
        super(name);
    }

    public start():void {

        super.start();
        // compute the first scene
        Promises.withTimeout(this.getNextScene(null), () => {
            this.getLogger().error("Timeout on setting up the first scene");
        }, SceneManagerBase.LIFECYCLE_TIMEOUT).then(
            (scene:Scene) => {
                // scene has been determined
                return this.sceneCreated(scene).then(
                    () => {
                        this.getLogger().info("First scene is: {0}", scene);
                    });
            }
        ).catch((error:any) => {
                this.getLogger().error("Error setting up first scene: {0}", error);
            }
        );
    }

    public stop():void {

        super.stop();
        // stop a currently running scene
        if(  this._current != null ) {
            // stop
            this._current.stop();
        }
    }

    public destroy():Promise<any> {

        this.getLogger().info("Destroying ...");
        return super.destroy().then(
            () => {
                if( this._current != null ) {
                    // when there is a currently running scene: destroy it
                    return this._current.destroy();
                }
                else {
                    // if not: we are finished
                    return Promise.resolve();
                }
            });
    }


// ===============



    /**
     * Provides the next scene that is neither {@link Initializable#init} nor {@link Startable#started} yet. This scene
     *  will be then initialized and started. As soon an the scene notifies about {@link RunnableEvents#EVENT_FINISHED},
     *  this scene will be stopped and destroyed.
     * @param current The current scene. null if this is the first scene
     * @param callback The callback to be invoked when the next scene is available. The scene needs to be passed to this callback
     * [PROTECTED]
     */
    public getNextScene(current:Scene):Promise<Scene> {
        return Promise.reject(Errors.createAbstractFunctionError("getNextScene"));
    }


    /**
     * Will be invoked when a new scene is ready to run
     * @param scene The scene
     */
    private sceneCreated(scene:Scene):Promise<Scene> {

        var finishedCallback:Function = () => {
            scene.unsubscribeEvent(Components.EVENT_FINISHED, finishedCallback);
            this.sceneFinished(scene).catch(
                (error:any) => {
                    this.getLogger().error("Error leaving scene {0}: {1}", scene, error);
                });
        };

        // register for scene finished
        scene.subscribeEvent(Components.EVENT_FINISHED, finishedCallback);

        // init scene
        this.getLogger().info("Initializing scene {0} ...", scene);
        return Promises.withTimeout(scene.init(), (resolve:(value:any) => void, reject:(cause:any) => void) => {
            this.getLogger().error("Timeout when initializing {0}", scene);
            reject("Timeout when initializing "+scene); }, SceneManagerBase.LIFECYCLE_TIMEOUT).
            then(() => {

                // start scene
                this.getLogger().info("Scene {0} has been initialized", scene);
                scene.start();
                this.getLogger().info("Scene {0} has been started", scene);
                this._current = scene;

                return Promise.resolve(scene);

            }).catch((error:any) => {
                this.getLogger().error("Error initializing scene {0}: {1}", scene, error);
                return Promise.reject(error);
            });
    }


    /**
     * Will be invoked when a scene is finished (= when the "stop" event has been propagated)
     * @param oldScene The scene that has finished
     * @return The promise that indicates that processing has been done
     */
    private sceneFinished(oldScene:Scene):Promise<any> {

        this.getLogger().info("Scene {0} has finished", oldScene);

        // 2.) create the next scene
        return this.getNextScene(oldScene).then((newScene:Scene) => {

            if( newScene === null ) {
                throw Errors.createIllegalArgumentError("No scene available");
            }
            this.getLogger().info("Scene {0} is successor of {1}", newScene, oldScene);

            // 3.) start new scene
            return this.sceneCreated(newScene).then(() => {

                // 4.) stop old scene
                oldScene.stop();

                // 5.) destroy old scene
                return Promises.withTimeout(oldScene.destroy(), (resolve:(value:any) => void, reject:(cause:any) => void) => {
                    this.getLogger().warn("Timeout on destroying scene {0}", oldScene);
                    reject("Timeout on destroying scene "+oldScene);}, SceneManagerBase.LIFECYCLE_TIMEOUT).

                    then(() => {

                        if( this._current !== newScene ) {
                            this.getLogger().warn("Illegal state: Expected {0} but got {1}", newScene, this._current);
                        }

                        this.getLogger().info("Scene {0} has been destroyed", oldScene);
                        this.getLogger().info("Current scene is: {0}", this._current);
                        return Promise.resolve();
                    });
            });
        });
    }
}

export = SceneManagerBase;

