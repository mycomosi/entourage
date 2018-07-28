/* eslint-env node, mocha */
/* global expect sinon*/

import {Logger} from "../../src/es6/logger";

describe('Logger', function() {

    'use strict';

    let win = {
        console: {
            log: sinon.spy(),
            info: sinon.spy(),
            warn: sinon.spy(),
            error: sinon.spy(),
            debug: sinon.spy()
        }
    };


    it(`should initialize Logger, overriding all console logging by configuration`, function () {

        // Given
        let configuration = {
            log: false,
            info: false,
            warn: false,
            error: false,
            debug: false
        };

        // When
        let l = new Logger(configuration, win);

        // Then
        let testLog = win.console.log('test');
        expect(testLog).to.equal(false);
        let testInfo = win.console.log('test');
        expect(testInfo).to.equal(false);
        let testWarn = win.console.warn('test');
        expect(testWarn).to.equal(false);
        let testError = win.console.error('test');
        expect(testError).to.equal(false);
        let testDebug = win.console.debug('test');
        expect(testDebug).to.equal(false);

    });

    it(`should initialize Logger and then get current log setting for info level`, function () {

        // Given
        let configuration = {
            log: false,
            info: false,
            warn: false,
            error: false,
            debug: false
        };

        // When
        let l = new Logger(configuration, win);
        let test = l.get('info');

        // Then
        expect(test).to.equal(false);

    });

    it(`should initialize Logger and then get current log setting for all levels`, function () {

        // Given
        let configuration = {
            log: false,
            info: false,
            warn: false,
            error: false,
            debug: false
        };

        // When
        let l = new Logger(configuration, win);
        let test = l.get('all');

        // Then
        expect(test).to.deep.equal(configuration);

    });

    it(`should initialize Logger and set log level for warn`, function () {

        // Given
        let configuration = {
            log: false,
            info: false,
            warn: false,
            error: false,
            debug: false
        };

        // When
        let l = new Logger(configuration, win);
        let test = l.set('warn');

        // Then
        expect(test).to.deep.equal({
            log: false,
            info: false,
            warn: true,
            error: false,
            debug: false
        });

        // for coverage...
        l.set();


    });

    it(`should initialize Logger with cc in configuration as function`, function () {

        // Given
        let copy = sinon.spy();
        let configuration = {
            log: false,
            info: false,
            warn: false,
            error: false,
            debug: false,
            cc: function(msg) {
                copy(msg);
            }
        };

        // When
        let l = new Logger(configuration, win);
        l.log('msg');
        l.info('msg');
        l.warn('msg');
        l.error('msg');
        l.debug('msg');
        l._cc('info', 'test'); // Hack to test cc

        // Then
        sinon.assert.calledOnce(copy);

    });

    it(`should subscribe a function to Logger`, function () {

        // Given
        let configuration = {
            log: false,
            info: false,
            warn: false,
            error: false,
            debug: false
        };

        // When
        let l = new Logger(configuration, win);
        let singleFunction = sinon.spy();
        l.subscribe(singleFunction);

        // Then
        l._cc('debug', 'debug message');
        sinon.assert.calledWith(singleFunction, 'debug', 'debug message');

    });

    it(`should subscribe multiple functions to Logger`, function () {

        // Given
        let configuration = {
            log: false,
            info: false,
            warn: false,
            error: false,
            debug: false
        };

        // When
        let l = new Logger(configuration, win);
        let f1 = sinon.spy(),
            f2 = sinon.spy();
        let functions = [f1, f2];
        l.subscribe(functions);

        // Then
        l._cc('debug', 'debug message');
        sinon.assert.calledWith(f1, 'debug', 'debug message');
        sinon.assert.calledWith(f2, 'debug', 'debug message');

    });

});
