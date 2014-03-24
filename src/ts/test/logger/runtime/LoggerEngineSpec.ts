/// <reference path="../../../jasmine/jasmine.d.ts"/>


import FormattingAppender = require("../../../main/logger/runtime/appender/FormattingAppender");
import ConsoleAppender = require("../../../main/logger/runtime/appender/ConsoleAppender");
import AppendingLogger = require("../../../main/logger/runtime/appender/AppendingLogger");
import Appender = require("../../../main/logger/runtime/appender/Appender");
import Level = require("../../../main/logger/runtime/formatter/Level");
import LoggerEngine = require("../../../main/logger/runtime/LoggerEngine");
import BufferingAppender = require("./BufferingAppender");


/**
 * Tests {@link LoggerEngine}
 */
describe("LoggerEngine", function():void {

    /**
     * Tests private #getParentLoggerName
     */
    it("ParentLoggerName", function() {

        // TRICKY: Adressing private static function
        var getParentLoggerName:Function = LoggerEngine['getParentLoggerName'];

        expect(getParentLoggerName("com.mycompany.mymodule")).toBe("com.mycompany");
        expect(getParentLoggerName("com.mycompany")).toBe("com");
        expect(getParentLoggerName("com")).toBe("");
        expect(getParentLoggerName("")).toBe("");
    });

    /**
     * Tests #configureLogger
     */
    it("Configuration", function():void {

        var testling:LoggerEngine = LoggerEngine.getInstance();
        testling.reset();

        var appenders1:Appender[] = [];
        appenders1.push(new ConsoleAppender());

        var appenders2:Appender[] = [];

        // test for an entirely uninitialized logging environment
        var l1:AppendingLogger = <AppendingLogger> testling.getLogger("com.mycompany.a");
        expect(l1.getName()).toBe("com.mycompany.a");
        expect(l1.getLevel()).toBe(Level.OFF);
        expect(l1.getAppenders().length).toBe(0);

        // do some configuration
        testling.configureLogger("com.mycompany", Level.INFO, appenders1);
        testling.configureLogger(LoggerEngine.ROOT_LOGGER, Level.ERROR, appenders2);

        var l2:AppendingLogger = <AppendingLogger> testling.getLogger("com.mycompany.b");
        expect(l2.getName()).toBe("com.mycompany.b");
        expect(l2.getLevel()).toBe(Level.INFO);
        expect(l2.getAppenders()).toBe(appenders1);

        var l3:AppendingLogger = <AppendingLogger> testling.getLogger("com");
        expect(l3.getName()).toBe("com");
        expect(l3.getLevel()).toBe(Level.ERROR);
        expect(l3.getAppenders()).toBe(appenders2);
    });


    /**
     * Tests #configureLogger with reconfiguration
     */
    it("Reconfiguration", function():void {

        var testling:LoggerEngine = LoggerEngine.getInstance();
        testling.reset();

        var appenders1:Appender[] = [];
        appenders1.push(new ConsoleAppender());

        var appenders2:Appender[] = [];
        appenders2.push(new BufferingAppender());

        testling.configureLogger("com.mycompany", Level.INFO, appenders1);

        var l1:AppendingLogger = <AppendingLogger> testling.getLogger("com.mycompany");
        var l2:AppendingLogger = <AppendingLogger> testling.getLogger("com.mycompany.myservice");

        expect(l1.getLevel()).toBe(Level.INFO);
        expect(l1.getAppenders()).toBe(appenders1);
        expect(l2.getLevel()).toBe(Level.INFO);
        expect(l2.getAppenders()).toBe(appenders1);

        // do reconfiguration
        testling.configureLogger("com.mycompany", Level.WARN, appenders2);

        // expecting that the same instance has changed
        expect(l1.getLevel()).toBe(Level.WARN);
        expect(l1.getAppenders()).toBe(appenders2);
        expect(l2.getLevel()).toBe(Level.WARN);
        expect(l2.getAppenders()).toBe(appenders2);
    });
});




