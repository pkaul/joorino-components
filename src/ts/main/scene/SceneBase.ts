/// <reference path="../../es6-promises/es6-promises.d.ts"/>

import ComponentBase = require("../component/ComponentBase");
import Components = require("../component/Components");
import ComponentManager = require("../component/manager/ComponentManager");
import Runner = require("./Runner");
import ComponentManagerRunnable = require("./../component/manager/ComponentManagerRunnable");
import Scene = require("./Scene");
import Runnable = require("./../component/Runnable");

/**
 * Base implementation of a {@link Scene}. Any {@link Runnable}s may be simply registered at the {@link #getComponentManager()}
 * and will be managed and executed by this scene. A scene that is finished needs to notify about this by sending
 * {@link Components#EVENT_FINISHED} to the {@link #getEventPublisher()}.
 */
class SceneBase extends ComponentBase implements Scene {

    private _startTime:number;
    private _componentManager:ComponentManager;
    private _finished:boolean = false;
    private _runnables:Runnable;
    private _lastRunTime:number = 0;

    constructor(name:string = null) {
        super(name);
    }

    public start():void {
        super.start();
        this._componentManager.start();
        this._startTime = Date.now();
    }


    public init():Promise<any> {
        return super.init().then(() => {

            this._componentManager = new ComponentManager(this.getName()+"-components");
            return this._componentManager.init().then(() => {

                var runner:Runner = this.createRunner(() => this.doRun());
                if( !!runner ) {

                    // setting up a adapter for invoking #run of all Runnables that are registered in the ComponentManager
                    this._runnables = new ComponentManagerRunnable(this._componentManager);
                    this._componentManager.register(this._runnables);

                    // register the runner so that it will be managed by component manager,
                    //  e.g. it will be started when starting the ComponentManager!
                    this._componentManager.register(runner);
                }

                return Promise.resolve();
            });
        });
    }

    public destroy():Promise<any> {
        return super.destroy().then(() => {
            return this._componentManager.destroy();
        });
    }

    public stop():void {
        // order is important!
        this._componentManager.stop();
        super.stop();
    }

    public toString():string {
        return "Scene["+this.getName()+"]";
    }

// ===========

    /**
     * Runs the scene by executing all registered {@link Runnable}s. Will be invoked continuously.
     *  Note: This method is not named like Runnable#run because this would cause it to be invoked via ComponentManager as well
     *  @param lastTime The time when this method has been executed last. 0 = executed the first time.
     * @protected
     */
    public handleRun(lastTime:number):void {
        this._runnables.run();
    }


    /**
     * @return A container to register scene specific beans to. These beans will be managed automatically according
     * to their lifecycle (e.g. {@link Initializable} or {@link Startable}. In addition, all {@link Runnable} beans and/or
     * {@link Function} will be invoked continuously.
     * @protected
     */
    public getComponentManager():ComponentManager {
        return this._componentManager
    }


    /**
     *
     * @return Gets the time when this scene has been started
     * @protected
     */
    public getStartTime():number {
        return this._startTime;
    }

    /**
     * @return The duration in milliseconds since this scene has been started
     * @protected
     */
    public getDuration():number {
        return Date.now()-this.getStartTime();
    }

    /**
     * Indicates that this scene shall be turned into "finished" state. This might cause a "finish" animation
     * @see #finished
     * @protected
     */
    public finish():void {
        this.getLogger().info("Finishing ...");
        this.finished();
    }

    /**
     * Indicates that this scene has been finished and can be left
     * @see #finish
     * @protected
     */
    public finished():void {
        if( !this._finished ) {
            this._finished = true;
            this.getLogger().info("Finished ...");
            Components.publishFinished(this.getEventPublisher(), this);
        }
    }

    /**
     * @protected
     */
    public isFinished():boolean {
        return this._finished;
    }


    /**
     * Creates a runner instance to be used for this scene. Override this function for a scene specific instance.
     * @param executable The function to executed continuously by the runner.
     * @return The runner or null if this scene shouldn't use a runner.
     * @protected
     */
    public createRunner(executable:() => void):Runner {
        return new Runner(executable, 60, this.getName()+"-runner");
    }

    // =======

    private doRun():void {

        var lastRunTime:number = this._lastRunTime;
        var currentTime:number = Date.now();
        this._lastRunTime = currentTime;
        this.handleRun(lastRunTime > 0 ? currentTime-lastRunTime : 0);
    }
}
export = SceneBase;