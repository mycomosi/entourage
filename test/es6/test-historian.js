/* eslint-env node, mocha */
/* global expect sinon*/

import {Historian} from "../../src/es6/historian";

describe('Historian', function() {

    'use strict';

    it(`should initialize historian, set onPopState callback, and then pop state`, function () {

        // Given
        global.window = {};
        let configuration = {},
            querystring = {};

        // When
        let h = new Historian(configuration, querystring);
        // Set popState
        let test = sinon.spy();
        h.onPopState(test);

        let event = {
            state: 'stateTest'
        };
        window.onpopstate(event);

        // Then
        sinon.assert.calledOnce(test);

    });

    it(`should pushState`, function () {

        // Given
        global.window = {};
        global.history = {
            pushState: sinon.spy()
        };
        let configuration = {},
            querystring = {};

        let state = 'test';

        // When
        let h = new Historian(configuration, querystring);
        h.pushState(state);

        // Then
        sinon.assert.calledWith(history.pushState, state, null, '');

    });
});
