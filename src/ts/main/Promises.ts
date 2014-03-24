
import DelayedExecution = require("./execution/DelayedExecution");
/// <reference path="../es6-promises/es6-promises.d.ts"/>

/**
 * Promises related utilities. It provides a thin wrapper around an existing promise implementation.
 */
class Promises {



    /**
     * Wraps a given promise into a timeout handler. If the promise isn't resolved or rejected within the given time interval, a handler is called.
     * Any rejects/resolves that occur after the timeout will be ignored.
     *
     *
     * @param promise The promise to be wrapped
     * @param timeoutHandler The handler to be called in case of a timeout. A function for sending a "resolve" to the original promise is passed here as well as a reject function.
     * @param timeoutMillis The timeout in millis
     * @return The wrapped promise
     */
    public static withTimeout<T>(promise:Promise<any>, timeoutHandler:(resolve:(result:T) => void, reject:(error:any) => void) => void, timeoutMillis:number):Promise<T> {

        if( timeoutHandler === null || timeoutMillis < 0 ) {
            // not timeout callback necessary
            return promise;
        }

        // construct deferred promise
        var deferredPromise:Deferred<T> = new Deferred<T>();

        // start timeout
        var timedOut:boolean = false;
        var timeoutInvoker:DelayedExecution = new DelayedExecution(() => {
            // mark as "timed out"
            timedOut = true;
            // call timeout handler
            timeoutHandler(deferredPromise.resolve, deferredPromise.reject);
        }, timeoutMillis);

        promise.then(
            function(value:T):void {
                if( !timedOut ) {
                    // if not already timed out: notify promise
                    timeoutInvoker.cancel();
                    deferredPromise.resolve(value);
                }
            },
            function(error:any):void {
                if( !timedOut ) {
                    // if not already timed out: notify promise
                    timeoutInvoker.cancel();
                    deferredPromise.reject(error);
                }
            }
        );

        return deferredPromise.promise;
    }
}

/**
 * A simple "deferred" implementation
 */
class Deferred<T> {

    public promise: Promise<T>;
    public resolve: (result:any) => void;
    public reject: (error:any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve:(result:any) => void, reject:(error:any) => void) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

export = Promises;