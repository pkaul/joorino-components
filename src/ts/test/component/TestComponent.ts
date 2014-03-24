import Components = require("../../main/component/Components");
import ComponentBase = require("../../main/component/ComponentBase");
/// <reference path="../../es6-promises/es6-promises.d.ts"/>


class TestComponent extends ComponentBase {

    private _events:string[] = [];

    public init():Promise<any> {
        this._events.push("init");
        return super.init();
    }

    public destroy():Promise<any> {
        this._events.push("destroy");
        return super.destroy();
    }

    public start():void {
        this._events.push("start");
        super.start();
    }

    public stop():void {
        this._events.push("stop");
        super.stop();
    }

    public getEventsAsString():String {
        return this._events.join(",");
    }

    public notifyFinished():void {
        Components.publishFinished(this.getEventPublisher(), this);
    }

}
export = TestComponent;