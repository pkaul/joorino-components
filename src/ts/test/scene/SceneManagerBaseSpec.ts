/// <reference path="../../jasmine/jasmine.d.ts"/>

import SceneManagerBase = require("../../main/scene/SceneManagerBase");
import SceneBase = require("../../main/scene/SceneBase");
import Scene = require("../../main/scene/Scene");
import Errors = require("../../main/lang/Errors");

//import Configurator = require("../../main/logger/runtime/Configurator");

/**
 * Tests {@link SceneManagerBase}
 */
describe("SceneManagerBase", function() {

    it("test", function() {

        //Configurator.configure("debug");

        var destroyed:boolean = false;

        var events:string[] = [];
        var scene1:TestScene = new TestScene("s1", events);
        var scene2:TestScene = new TestScene("s2", events);

        var testling:TestSceneManager = new TestSceneManager([scene1, scene2]);


        testling.init();
        expect(events.join(",")).toBe("");
        // start the scene manager
        testling.start();

        waitsFor(() => {
            return events.indexOf("start(s1)") > -1;
        });
        runs(() => {
            expect(events.join(",")).toBe("init(s1),start(s1)");
            // simulate scene#1 finish itself
            scene1.doFinish();
        });
        waitsFor(() => {
            return events.indexOf("destroy(s1)") > -1;
        });
        runs(() => {
            expect(events.join(",")).toBe("init(s1),start(s1),init(s2),start(s2),stop(s1),destroy(s1)");
            testling.stop();
        });
        waitsFor(() => {
            return events.indexOf("stop(s2)") > -1;
        });


        runs(() => {
            expect(events.join(",")).toBe("init(s1),start(s1),init(s2),start(s2),stop(s1),destroy(s1),stop(s2)");
            testling.destroy().then(() => {
                expect(events.join(",")).toBe("init(s1),start(s1),init(s2),start(s2),stop(s1),destroy(s1),stop(s2),destroy(s2)");
                destroyed = true;
            });
        });

        waitsFor(() => {
            return destroyed;
        });

        runs(() => {
            expect(destroyed).toBe(true);
        });

    })
});


/**
 * A test scene
 */
class TestScene extends SceneBase {

    private _events:string[];

    constructor(name:string, events:string[]) {
        super(name);
        this._events = events;
    }

    public init():Promise<any> {
        return super.init().then(() => {
            this._events.push("init("+this.getName()+")");
        });
    }

    public destroy():Promise<any> {
        return super.destroy().then(() => {
            this._events.push("destroy("+this.getName()+")");
        });
    }

    public start():void {
        super.start();
        this._events.push("start("+this.getName()+")");
    }

    public stop():void {
        this._events.push("stop("+this.getName()+")");
        super.stop();
    }


    public doFinish():void {
        super.finish();
    }
}


/**
 * A test scene manager
 */
class TestSceneManager extends SceneManagerBase {

    private _scenes:Scene[];

    constructor(scenes:Scene[]) {
        super();
        this._scenes = scenes;
    }

    public getNextScene(current:Scene):Promise<Scene> {

        if( current === null ) {
            return Promise.resolve(this._scenes[0]);
        }
        else {

            for( var i:number = 0; i<this._scenes.length-1; i++ ) {
                if( current === this._scenes[i] ) {

                    return Promise.resolve(this._scenes[i+1]);
                }
            }
        }

        return Promise.reject(Errors.createIllegalArgumentError("No next scene available for "+current));
    }
}




