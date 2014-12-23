import Components = require("../../main/component/Components");
import ComponentBase = require("../../main/component/ComponentBase");
/// <reference path="../../es6-promises/es6-promises.d.ts"/>


class TestComponent extends ComponentBase {

    private _events:string[] = [];

    constructor(name?:string) {
        super(name);
    }

    public init():Promise<any> {
        this._events.push("init");
        this.logState();
        return super.init();
    }

    public destroy():Promise<any> {
        this._events.push("destroy");
        this.logState();
        return super.destroy();
    }

    public start():void {
        this._events.push("start");
        this.logState();
        super.start();
    }

    public stop():void {
        this._events.push("stop");
        this.logState();
        super.stop();
    }

    public getEventsAsString():String {
        return this._events.join(",");
    }

    public notifyFinished():void {
        Components.publishFinished(this.getEventPublisher(), this);
    }

    private logState():void {
        this.getLogger().debug("State of {0} is: {1}", this, this._events);
    }

}
export = TestComponent;