import Logger = require("../../logger/Logger");
import LoggerFactory = require("../../logger/LoggerFactory");
import Promises = require("../../Promises");
import Maps = require("../../Maps");
import ComponentProcessor = require("./ComponentProcessor");
import assert = require("../../assert");
/// <reference path="../../../es6-promises/es6-promises.d.ts"/>


/**
 * Helper methods that are related to {@link ComponentProcessor}
 */
class ComponentProcessors {

    private static LOG:Logger = LoggerFactory.getLogger(ComponentProcessors);

    /**
     * Invokes {@link ComponentProcessor#processBeforeInit} on several bean processors for a several bean
     * @param processors The processors to invoke
     * @param components The components to be applied to the processors
     * @param warnTimeout The timeout in milliseconds after which a warning shall be logged
     */
    public static processBeforeInit(processors:ComponentProcessor[], components:Map<string, Object>, warnTimeout:number = -1):Promise<any> {

        if( processors.length === 0 ) {
            return Promise.resolve();
        }

        var promises:Promise<any>[] = [];
        // iterate over all processors
        for( var j:number = 0; j<processors.length; j++ ) {

            var processor:ComponentProcessor = processors[j];

            // iterate through all components and invoke #processBeforeInit
            components.forEach((component:Object, name:string, components:Map<string, Object>) => {
                var p:Promise<any> = processor.processBeforeInit(name, component);
                promises.push(p);
            });
        }

        return Promises.withTimeout(Promise.all(promises), (resolve:(result:any) => void,reject:(error:any) => void) => {
            var keys:string[] = Maps.keys(components);
            ComponentProcessors.LOG.warn("Timeout on pre-init components: {0}", keys);
            reject("Timeout on pre-init components: "+keys);
        }, warnTimeout);
    }



    public static processAfterInit(processors:ComponentProcessor[], components:Map<string, Object>, warnTimeout:number = -1):Promise<any> {

        if( processors.length === 0 ) {
            return Promise.resolve();
        }

        var promises:Promise<any>[] = [];
        // iterate over all processors
        for( var j:number = 0; j<processors.length; j++ ) {

            var processor:ComponentProcessor = processors[j];

            // iterate through all components and invoke #processAfterInit
            components.forEach((component:Object, name:string, components:Map<string, Object>) => {
                var p:Promise<any> = processor.processAfterInit(name, component);
                promises.push(p);
            });
        }

        return Promises.withTimeout(Promise.all(promises), (resolve:(result:any) => void,reject:(error:any) => void) => {
            var keys:string[] = Maps.keys(components);
            ComponentProcessors.LOG.warn("Timeout on post-init components: {0}", keys);
            reject("Timeout on post-init components: "+keys);
        }, warnTimeout);
    }


    public static processBeforeDestroy(processors:ComponentProcessor[], components:Map<string, Object>, warnTimeout:number = -1):Promise<any> {

        if( processors.length === 0 ) {
            return Promise.resolve();
        }

        var promises:Promise<any>[] = [];
        // iterate over all processors (reverse order)
        for( var j:number = processors.length-1; j>=0; j-- ) {

            var processor:ComponentProcessor = processors[j];

            // iterate through all beans (reverse order) and invoke #processBeforeDestroy
            var componentNames:string[] = Maps.keys(components);
            for( var i:number = componentNames.length-1; i>=0; i-- ) {
                var p:Promise<any> = processor.processBeforeDestroy(componentNames[i], components.get(componentNames[i]));
                promises.push(p);
            }
        }

        return Promises.withTimeout(Promise.all(promises), (resolve:(result:any) => void,reject:(error:any) => void) => {
            ComponentProcessors.LOG.warn("Timeout on pre-destroying components: {0}", componentNames);
            reject("Timeout on pre-destroying components: "+componentNames);
        }, warnTimeout);
    }



    public static processAfterDestroy(processors:ComponentProcessor[], components:Map<string, Object>, warnTimeout:number = -1):Promise<any> {

        if( processors.length === 0 ) {
            return Promise.resolve();
        }

        var promises:Promise<any>[] = [];
        // iterate over all processors (reverse order)
        for( var j:number = processors.length-1; j>=0; j-- ) {

            var processor:ComponentProcessor = processors[j];

            // iterate through all beans (reverse order) and invoke #processAfterDestroy
            var componentNames:string[] = Maps.keys(components);
            for( var i:number = componentNames.length-1; i>=0; i-- ) {
                var p:Promise<any> = processor.processAfterDestroy(componentNames[i], components.get(componentNames[i]));
                promises.push(p);
            }
        }

        return Promises.withTimeout(Promise.all(promises), (resolve:(result:any) => void,reject:(error:any) => void) => {
            ComponentProcessors.LOG.warn("Timeout on post-destroying components: {0}", componentNames);
            reject("Timeout on post-destroying components: "+componentNames);
        }, warnTimeout);
    }
}

export = ComponentProcessors;
