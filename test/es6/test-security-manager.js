/* eslint-env node, mocha */
/* global expect sinon*/

import {SecurityManager} from "../../src/es6/security-manager";

describe('Security Manager', function() {

    'use strict';

    // es6Type
    it(`should initialize security manager`, function () {

        // Given

        // When
        let sm = new SecurityManager();
        sm.processOauth();

        // Then

    });

});
