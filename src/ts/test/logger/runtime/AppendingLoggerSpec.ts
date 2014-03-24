/// <reference path="../../../jasmine/jasmine.d.ts"/>

import AppendingLogger = require("../../../main/logger/runtime/appender/AppendingLogger");
import Appender = require("../../../main/logger/runtime/appender/Appender");
import Level = require("../../../main/logger/runtime/formatter/Level");
import BufferingAppender = require("./BufferingAppender");


/**
 * Tests {@link AppendingLogger}
 */
describe("AppendingLogger", function():void {

    /**
     * Tests that messages are formatted properly
     */
    it("Messages", function():void {

        var testAppender:BufferingAppender = new BufferingAppender();

        var testling:AppendingLogger = new AppendingLogger();
        testling.setLevel(Level.DEBUG);
        testling.setName("my-name");
        testling.setAppenders([testAppender]);

        testling.debug("my message 1={0}, 2={1}, 3={2}, 4={3}, 5={4}, 6={5}, 7={6}", "a", "b", "c", "d", "e", "f", "g");
        expect(testAppender.getMessages().length).toBe(1);
        expect(testAppender.getMessages()[0]).toMatch("DEBUG [0-9][0-9]:[0-9][0-9]:[0-9][0-9] \\[my-name\\] my message 1=a, 2=b, 3=c, 4=d, 5=e, 6=f, 7=g");

        testling.info("my message 1={0}, 2={1}, 3={2}, 4={3}, 5={4}, 6={5}, 7={6}", "a", "b", "c", "d", "e", "f", "g");
        expect(testAppender.getMessages().length).toBe(2);
        expect(testAppender.getMessages()[1]).toMatch("INFO [0-9][0-9]:[0-9][0-9]:[0-9][0-9] \\[my-name\\] my message 1=a, 2=b, 3=c, 4=d, 5=e, 6=f, 7=g");

        testling.warn("my message 1={0}, 2={1}, 3={2}, 4={3}, 5={4}, 6={5}, 7={6}", "a", "b", "c", "d", "e", "f", "g");
        expect(testAppender.getMessages().length).toBe(3);
        expect(testAppender.getMessages()[2]).toMatch("WARN [0-9][0-9]:[0-9][0-9]:[0-9][0-9] \\[my-name\\] my message 1=a, 2=b, 3=c, 4=d, 5=e, 6=f, 7=g");

        testling.error("my message 1={0}, 2={1}, 3={2}, 4={3}, 5={4}, 6={5}, 7={6}", "a", "b", "c", "d", "e", "f", "g");
        expect(testAppender.getMessages().length).toBe(4);
        expect(testAppender.getMessages()[3]).toMatch("ERROR [0-9][0-9]:[0-9][0-9]:[0-9][0-9] \\[my-name\\] my message 1=a, 2=b, 3=c, 4=d, 5=e, 6=f, 7=g");
    });

    /**
     * Tests that messages are logged/not logged according to the current log level
     */
    it("Levels", function():void {

        var testAppender:BufferingAppender = new BufferingAppender();

        var testling:AppendingLogger = new AppendingLogger();
        testling.setLevel(Level.DEBUG);
        testling.setName("my-name");
        testling.setAppenders([testAppender]);

        testling.debug("a");
        expect(testAppender.getMessages().length).toBe(1);
        testling.setLevel(Level.INFO);
        testling.debug("b");
        expect(testAppender.getMessages().length).toBe(1);

        testling.info("a");
        expect(testAppender.getMessages().length).toBe(2);
        testling.setLevel(Level.WARN);
        testling.info("b");
        expect(testAppender.getMessages().length).toBe(2);

        testling.warn("a");
        expect(testAppender.getMessages().length).toBe(3);
        testling.setLevel(Level.ERROR);
        testling.warn("b");
        expect(testAppender.getMessages().length).toBe(3);

        testling.error("a");
        expect(testAppender.getMessages().length).toBe(4);
        testling.setLevel(Level.OFF);
        testling.error("b");
        expect(testAppender.getMessages().length).toBe(4);
    });

    /**
     * Tests formatting of exceptions
     */
    it("Exception", function():void {

        var testAppender:BufferingAppender = new BufferingAppender();

        var testling:AppendingLogger = new AppendingLogger();
        testling.setLevel(Level.DEBUG);
        testling.setName("my-name");
        testling.setAppenders([testAppender]);

        testling.debug("my message 1={0}, 2={1}", "a", "b", new Error("error!"));
        expect(testAppender.getMessages()[0]).toMatch("DEBUG [0-9][0-9]:[0-9][0-9]:[0-9][0-9] \\[my-name\\] my message 1=a, 2=b\n(.*)error!(.*)");
    })
});