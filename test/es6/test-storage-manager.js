/* eslint-env node, mocha */
/* global expect sinon*/

import {es6Type, StorageManager} from "../../src/es6/storage-manager";

describe('Storage Manager', function() {

    'use strict';

    // es6Type
    it(`should return types: map, set, array, and object`, function () {

        // Given
        let map = new Map(),
            set = new Set(),
            array = [],
            other = {};

        // When
        let test1 = es6Type(map),
            test2 = es6Type(set),
            test3 = es6Type(array),
            test4 = es6Type(other);

        // Then
        expect(test1).to.equal('map');
        expect(test2).to.equal('set');
        expect(test3).to.equal('array');
        expect(test4).to.equal('object');

    });

    // GET
    it(`should initialize module and run GET (null - condition should never happen)`, function () {

        // Given
        let configuration = {},
            oo = {},
            uuidv4 = {};

        // When
        let sw = new StorageManager(configuration, oo, uuidv4);
        let test = sw.get();

        // Then
        expect(test).to.equal(false);

    });
    it(`should initialize module and run GET from local storage`, function () {

        // Given
        global.window = {
            localStorage: {
                getItem: sinon.spy(r => {return r;})
            }
        };
        global.atob = sinon.spy(r => {return r;});
        let config = {},
            oo = {
                parse: sinon.spy(() => {return 'decoded';})
            },
            uuidv4 = {};
        let request = 'request',
            location = {type: 'local'},
            options = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        sw.get(request, location, options);

        // Then
        sinon.assert.calledOnce(oo.parse);
    });
    it(`should initialize module and run GET from session storage`, function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(r => {return r;})
            }
        };
        global.atob = sinon.spy(r => {return r;});
        let config = {},
            oo = {
                parse: sinon.spy(() => {return 'decoded';})
            },
            uuidv4 = {};
        let request = 'request',
            location = {type: 'session'},
            options = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        sw.get(request, location, options);

        // Then
        sinon.assert.calledOnce(oo.parse);
    });
    it(`should initialize module and run GET from shared storage`, function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(r => {return r;})
            }
        };
        global.atob = sinon.spy(r => {return r;});
        let config = {
                get: sinon.spy(() => {
                    return {
                        value: 'testValue'
                    };
                })
            },
            oo = {
                parse: sinon.spy(() => {return 'decoded';})
            },
            uuidv4 = {};
        let request = 'request',
            location = {type: 'shared'},
            options = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        let response = sw.get(request, location, options);

        // Then
        expect(response).to.equal('testValue');
    });

    // INFO
    it(`should initialize module and run INFO (null - condition should never happen)`, function () {

        // Given
        let configuration = {},
            oo = {},
            uuidv4 = {};

        // When
        let sw = new StorageManager(configuration, oo, uuidv4);
        let test = sw.info();

        // Then
        expect(test).to.equal(false);

    });
    it(`should initialize module and run INFO from local storage`, function () {

        // Given
        global.window = {
            localStorage: {
                getItem: sinon.spy(() => {return {
                    type: 'response',
                    created: 'now',
                    lastModified: 'lastmodified'
                };})
            }
        };
        global.atob = sinon.spy(() => {return {
            type: 'response',
            created: 'now',
            lastModified: 'lastmodified'
        };});
        let config = {},
            oo = {
                parse: sinon.spy(() => {return {
                    type: 'response',
                    created: 'now',
                    lastModified: 'lastmodified'
                };})
            },
            uuidv4 = {};
        let request = 'request',
            location = {type: 'local'},
            options = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        let test = sw.info(request, location, options);
        let expected = {
            type: 'response',
            created: 'now',
            lastModified: 'lastmodified'
        };

        // Then
        expect(test).to.deep.equal(expected);
    });
    it(`should initialize module and run INFO from session storage`, function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(r => {return r;})
            }
        };
        global.atob = sinon.spy(r => {return r;});
        let config = {},
            oo = {
                parse: sinon.spy(() => {return {
                    type: 'response',
                    created: 'now',
                    lastModified: 'lastmodified'
                };})
            },
            uuidv4 = {};
        let request = 'request',
            location = {type: 'session'},
            options = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        let test = sw.info(request, location, options);
        let expected = {
            type: 'response',
            created: 'now',
            lastModified: 'lastmodified'
        };

        // Then

        expect(test).to.deep.equal(expected);
    });
    it(`should initialize module and run INFO from shared storage`, function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(r => {return r;})
            }
        };
        global.atob = sinon.spy(r => {return r;});
        let config = {
                info: sinon.spy(() => {
                    return {
                        value: 'testValue'
                    };
                })
            },
            oo = {
                parse: sinon.spy(() => {return 'decoded';})
            },
            uuidv4 = {};
        let request = 'request',
            location = {type: 'shared'},
            options = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        let response = sw.get(request, location, options);

        // Then
        expect(response).to.equal('testValue');
    });

    // PUT
    it(`should initialize module and PUT (null - condition should never happen)`, function () {

        // Given
        let configuration = {},
            oo = {},
            uuidv4 = {};

        // When
        let sw = new StorageManager(configuration, oo, uuidv4);
        let test = sw.put();

        // Then
        expect(test).to.equal(false);

    });
    it(`should initialize module and PUT to local storage`, function () {

        // Given
        global.window = {
            localStorage: {
                getItem: sinon.spy(() => { return true;}),
                setItem: sinon.spy()
            }
        };
        global.btoa = sinon.spy(() => {return 'base64';});
        let config = {},
            oo = {
                parse: sinon.spy(() => {return {
                    type: 'response',
                    created: 'now',
                    lastModified: 'lastmodified'
                };})
            },
            uuidv4 = {};
        let units = [{
                key: 'key',
                value: 'value'
            }],
            location = {type: 'local'},
            options = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        let test = sw.put(units, location, options);

        // Then
        sinon.assert.calledOnce(window.localStorage.setItem);
    });
    // it(`should initialize module and run INFO from session storage`, function () {
    //
    //     // Given
    //     global.window = {
    //         sessionStorage: {
    //             getItem: sinon.spy(r => {return r;})
    //         }
    //     };
    //     global.atob = sinon.spy(r => {return r;});
    //     let config = {},
    //         oo = {
    //             parse: sinon.spy(() => {return {
    //                 type: 'response',
    //                 created: 'now',
    //                 lastModified: 'lastmodified'
    //             };})
    //         },
    //         uuidv4 = {};
    //     let request = 'request',
    //         location = {type: 'session'},
    //         options = {};
    //
    //     // When
    //     let sw = new StorageManager(config, oo, uuidv4);
    //     let test = sw.info(request, location, options);
    //     let expected = {
    //         type: 'response',
    //         created: 'now',
    //         lastModified: 'lastmodified'
    //     };
    //
    //     // Then
    //
    //     expect(test).to.deep.equal(expected);
    // });
    // it(`should initialize module and run INFO from shared storage`, function () {
    //
    //     // Given
    //     global.window = {
    //         sessionStorage: {
    //             getItem: sinon.spy(r => {return r;})
    //         }
    //     };
    //     global.atob = sinon.spy(r => {return r;});
    //     let config = {
    //             info: sinon.spy(() => {
    //                 return {
    //                     value: 'testValue'
    //                 };
    //             })
    //         },
    //         oo = {
    //             parse: sinon.spy(() => {return 'decoded';})
    //         },
    //         uuidv4 = {};
    //     let request = 'request',
    //         location = {type: 'shared'},
    //         options = {};
    //
    //     // When
    //     let sw = new StorageManager(config, oo, uuidv4);
    //     let response = sw.get(request, location, options);
    //
    //     // Then
    //     expect(response).to.equal('testValue');
    // });


    // DELETE

    // SERIALIZE

    // encode() todo: needs then condition
    it(`should initialize module and run encode`, function () {

        // Given
        global.btoa = sinon.spy(r => {return r;});
        let config = {},
            oo = {
                parse: sinon.spy(() => {return 'decoded';})
            },
            uuidv4 = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        sw.encode('string');

        // Then


    });

    // decode() todo: needs then condition
    it(`should initialize module and run decode`, function () {

        // Given
        global.atob = sinon.spy(r => {return r;});
        let config = {},
            oo = {
                parse: sinon.spy(() => {return 'decoded';})
            },
            uuidv4 = {};

        // When
        let sw = new StorageManager(config, oo, uuidv4);
        sw.decode('string');

        // Then


    });

});
