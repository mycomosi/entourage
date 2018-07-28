var FUNCTION = 'function';
var LOCAL = 'local';
var SESSION = 'session';
var SHARED = 'shared';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 *  Manage local, session, & *shared* storage systems
 *  (Shared is user defined, although when used as part of entourage, it uses PostalWorker)
 *  @Author Russ Stratfull 2018
 */

var OBJECT = 'object';
var MAP = 'map';
var SET = 'set';
var ARRAY = 'array';
// UNDEFINED = 'undefined';

/**
 * Decode json8 serialized objects from base64 string
 * @param value
 * @return {string}
 */
var decode64 = function decode64(value) {
    try {
        return json8.parse(atob(value));
    } catch (e) {
        return atob(value);
    }
};
var encode64 = function encode64(value) {
    try {
        return btoa(json8.serialize(value));
    } catch (e) {
        return btoa(value);
    }
};

/**
 *
 * @param obj
 * @return {string}
 */
function es6Type(obj) {
    if (obj instanceof Map) return MAP;else if (obj instanceof Set) return SET;else if (obj instanceof Array) return ARRAY;else return OBJECT;
}

var sharedPut = void 0;
var sharedGet = void 0;
var sharedDelete = void 0;
var sharedSerialize = void 0;

var json8 = void 0;
var uuid = void 0;

var StorageManager = function () {
    function StorageManager(configuration, oo, uuidv4) {
        var _this = this;

        classCallCheck(this, StorageManager);


        json8 = oo;
        uuid = uuidv4;

        this.errors = [];

        // Public
        /**
         * Get entry from storage location
         * @param request
         * @param location
         * @param options *optional*
         */
        this.get = function (request, location, options) {
            var response = false;
            if (request && location && location.type && _this._storageTypes().has(location.type)) {
                response = _this._storageTypes().get(location.type).get(request, options).value;
            }
            return response || false;
        };

        /**
         *
         * @param request
         * @param location
         * @return {{type, created: *, lastModified: *|number|string}}
         */
        this.info = function (request, location) {
            var response = false;
            if (request && location && location.type && _this._storageTypes().has(location.type)) {
                response = _this._storageTypes().get(location.type).get(request);
                return response ? {
                    type: response.type,
                    created: response.created,
                    lastModified: response.lastModified
                } : false;
            } else {
                return false;
            }
        };

        /**
         * Add/Update entry in storage location
         * @param {object | array} units - Units of stuff that need to be stored
         *
         {
            key: 'String',
            value: '*'
         }
         *
         * @param {object} location - Location to store the unit
         * @param {object} options - (optional) Additional options object
         */
        this.put = function (units, location) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            // Initialize response (fails with false, so set false as first value)
            var response = false;
            // A unit definition(s) and location are both required arguments
            if (units && location && location.type && _this._storageTypes().has(location.type)) {
                var iUnits = _this._prePackUnits(Array.isArray(units) ? units : [units]);
                response = _this._storageTypes().get(location.type).put(iUnits, options);
            }
            return response;
        };

        /**
         *
         * @param units
         * @param location
         * @param options
         * @return {boolean}
         */
        this.delete = function (units, location, options) {
            if (units && location && location.type && _this._storageTypes().has(location.type)) {
                var iUnits = Array.isArray(units) ? units : [units];
                _this._storageTypes().get(location.type).del(iUnits, options);

                // todo: To return validity of request, a potential solution could be to:
                // Do a query, by type of course (local, shared, etc...)
                // and if a validation callback is defined for that type
                // use it to check if the request succeeded and return true/false
                // (not currently sure how to address displaying failure info though...)
            }
        };

        /**
         * Serialize the repository by type
         * @param location
         * @param options
         * @return {string | boolean} - Returns json string of current repository data
         */
        this.serialize = function (location /*, options*/) {
            var response = false;
            if (location && location.type && _this._storageTypes().has(location.type)) {
                response = _this._storageTypes().get(location.type).serialize();
            }
            return response;
        };

        /**
         * Inject shared functions
         */
        if (_typeof(configuration.put) === FUNCTION) {
            sharedPut = configuration.put || function () {}; // todo
        }
        if (_typeof(configuration.get) === FUNCTION) {
            sharedGet = configuration.get || function () {}; // todo
        }
        if (_typeof(configuration.delete) === FUNCTION) {
            sharedDelete = configuration.delete || function () {}; // todo
        }
        if (_typeof(configuration.serialize) === FUNCTION) {
            sharedSerialize = configuration.serialize || function () {}; // todo
        }
    }

    // Private

    // LocalStorage
    /**
     *
     * @param units
     * @private
     */


    createClass(StorageManager, [{
        key: '_prePackUnits',
        value: function _prePackUnits(units /*, options*/) {
            return units.map(function (unit) {
                var u = {},
                    dataType = _typeof(unit.value),
                    now = Date.now();
                // All the interesting types show as "object"
                if (dataType === OBJECT) {
                    dataType = es6Type(unit.value);
                }

                u.key = unit.key;
                u.type = dataType.toLowerCase();
                u.value = unit.value;
                u.created = now;
                u.lastModified = now;
                return u;
                // Save original type
                // switch (dataType.toLowerCase()) {
                //
                //     case STRING:
                //         if (dataType === '') {
                //             window.console.warn(`storage-manager skipped packaging unit ${unit.key} - invalid type`);
                //             break;
                //         }
                //         u.value = btoa(unit.value);
                //         break;
                //
                //     case NUMBER:
                //         u.value = btoa(unit.value);
                //         break;
                //
                //     case BOOLEAN:
                //
                //         break;
                //
                //     case OBJECT:
                //         if (dataType === null) {
                //             window.console.warn(`storage-manager skipped packaging unit ${unit.key} - invalid type`);
                //             break;
                //         }
                //
                //         break;
                //
                //     default:
                //         // functions, undefined, null end up here
                //         window.console.warn(`storage-manager skipped packaging unit ${unit.key} - invalid type`);
                // }
            });
        }

        /**
         * Put units into localstorage
         * @param units
         * @return {boolean}
         * @private
         */

    }, {
        key: '_putLocalStorage',
        value: function _putLocalStorage(units /*, options*/) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = units[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var unit = _step.value;

                    // Is it already in storage?
                    /*eslint no-extra-boolean-cast: "error"*/
                    var item = !!window.localStorage.getItem(unit.key);
                    item = Boolean(item);
                    if (item) {
                        var cache = json8.parse(atob(window.localStorage.getItem(unit.key)));
                        var update = encode64({
                            type: unit.type,
                            created: cache.created,
                            lastModified: Date.now(),
                            value: unit.value
                        });

                        window.localStorage.setItem(unit.key, update);
                    } else {
                        var create = Date.now();
                        var _update = encode64({
                            type: unit.type,
                            created: create,
                            lastModified: create,
                            value: unit.value
                        });

                        window.localStorage.setItem(unit.key, _update);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        /**
         *
         * @param request
         * @return {string | null}
         * @private
         */

    }, {
        key: '_getLocalStorage',
        value: function _getLocalStorage(request /*, options*/) {
            var result = window.localStorage.getItem(request);
            if (result) {
                return decode64(result);
            } else return false;
        }

        /**
         *
         * @param keys
         * @private
         */

    }, {
        key: '_removeLocalStorage',
        value: function _removeLocalStorage(keys) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var key = _step2.value;

                    window.localStorage.removeItem(key);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        /**
         *
         * @return {string}
         * @private
         */

    }, {
        key: '_serializeLocalStorage',
        value: function _serializeLocalStorage() {
            var _this2 = this;

            var repository = window.localStorage;
            var out = {};
            Object.keys(repository).forEach(function (key) {
                try {
                    window.atob(repository[key]);
                    out[key] = decode64(repository[key]);
                } catch (e) {
                    _this2.errors.push(e);
                }
            });
            return JSON.stringify(out);
        }

        // SessionStorage
        /**
         *
         * @param units
         * @private
         */

    }, {
        key: '_putSessionStorage',
        value: function _putSessionStorage(units /*, options*/) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = units[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var unit = _step3.value;

                    // Is it already in storage?
                    var item = !!window.sessionStorage.getItem(unit.key);
                    item = Boolean(item);
                    if (item) {
                        var cache = json8.parse(atob(window.sessionStorage.getItem(unit.key)));
                        var update = encode64({
                            type: unit.type,
                            created: cache.created,
                            lastModified: Date.now(),
                            value: unit.value
                        });

                        window.sessionStorage.setItem(unit.key, update);
                    } else {
                        var create = Date.now();
                        var _update2 = encode64({
                            type: unit.type,
                            created: create,
                            lastModified: create,
                            value: unit.value
                        });

                        window.sessionStorage.setItem(unit.key, _update2);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }

        /**
         *
         * @param request
         * @return {*}
         * @private
         */

    }, {
        key: '_getSessionStorage',
        value: function _getSessionStorage(request /*, options*/) {
            var result = window.sessionStorage.getItem(request);
            if (result) {
                return decode64(result);
            } else return false;
        }

        /**
         *
         * @param keys
         * @private
         */

    }, {
        key: '_removeSessionStorage',
        value: function _removeSessionStorage(keys) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = keys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var key = _step4.value;

                    window.sessionStorage.removeItem(key);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }

        /**
         *
         * @return {string}
         * @private
         */

    }, {
        key: '_serializeSessionStorage',
        value: function _serializeSessionStorage() {
            var _this3 = this;

            var repository = window.sessionStorage;
            var out = {};
            Object.keys(repository).forEach(function (key) {
                try {
                    window.atob(repository[key]);
                    out[key] = decode64(repository[key]);
                } catch (e) {
                    _this3.errors.push(e);
                }
            });
            return JSON.stringify(out);
        }

        // SharedStorage
        /**
         * Put units into shared storage (worker thread)
         * @param units
         * @param options
         * @private
         */

    }, {
        key: '_putSharedStorage',
        value: function _putSharedStorage(units, options) {
            if (sharedPut) return sharedPut(units, options);
        }

        /**
         * Get units from shared storage
         * @private
         */

    }, {
        key: '_getSharedStorage',
        value: function _getSharedStorage(request, options) {
            if (sharedGet) return sharedGet(request, options);
        }

        /**
         *
         * @param keys
         * @return {*}
         * @private
         */

    }, {
        key: '_removeSharedStorage',
        value: function _removeSharedStorage(keys) {
            if (sharedDelete) return sharedDelete(keys);
        }

        /**
         *
         * @return {*}
         * @private
         */

    }, {
        key: '_serializeSharedStorage',
        value: function _serializeSharedStorage() {
            if (sharedSerialize) return sharedSerialize();
        }

        /**
         * Generate a random key (RFC4122 UUID
         * https://www.npmjs.com/package/uuid
         * @return {string} - Example: '416ac246-e7ac-49ff-93b4-f7e94d997e6b'
         * @private
         */

    }, {
        key: '_getUniqueKey',
        value: function _getUniqueKey() {
            return uuid();
        }

        /**
         *
         * @return {Map<any, any>}
         * @private
         */

    }, {
        key: '_storageTypes',
        value: function _storageTypes() {
            return new Map([[LOCAL, {
                put: this._putLocalStorage,
                get: this._getLocalStorage,
                del: this._removeLocalStorage,
                serialize: this._serializeLocalStorage
            }], [SESSION, {
                put: this._putSessionStorage,
                get: this._getSessionStorage,
                del: this._removeSessionStorage,
                serialize: this._serializeSessionStorage
            }], [SHARED, {
                put: this._putSharedStorage,
                get: this._getSharedStorage,
                del: this._removeSharedStorage,
                serialize: this._serializeSharedStorage
            }]]);
        }

        /**
         *
         * @param unit
         * @return {string}
         */

    }, {
        key: 'encode',
        value: function encode(unit) {
            return encode64(unit);
        }

        /**
         *
         * @param unit
         * @return {string}
         */

    }, {
        key: 'decode',
        value: function decode(unit) {
            return decode64(unit);
        }
    }]);
    return StorageManager;
}();

/*eslint no-unused-vars: "off"*/

/* eslint-env node, mocha */
/* global expect sinon*/

describe('Entourage', function () {

    it('should return types: map, set, array, and object', function () {

        // Given
        var map = new Map(),
            set = new Set(),
            array = [],
            other = {};

        // When
        var test1 = es6Type(map),
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
    it('should initialize module and run GET (null - condition should never happen)', function () {

        // Given
        var configuration = {},
            oo = {},
            uuidv4 = {};

        // When
        var sw = new StorageManager(configuration, oo, uuidv4);
        var test = sw.get();

        // Then
        expect(test).to.equal(false);
    });
    it('should initialize module and run GET from local storage', function () {

        // Given
        global.window = {
            localStorage: {
                getItem: sinon.spy(function (r) {
                    return r;
                })
            }
        };
        global.atob = sinon.spy(function (r) {
            return r;
        });
        var config = {},
            oo = {
            parse: sinon.spy(function () {
                return 'decoded';
            })
        },
            uuidv4 = {};
        var request = 'request',
            location = { type: 'local' },
            options = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        sw.get(request, location, options);

        // Then
        sinon.assert.calledOnce(oo.parse);
    });
    it('should initialize module and run GET from session storage', function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(function (r) {
                    return r;
                })
            }
        };
        global.atob = sinon.spy(function (r) {
            return r;
        });
        var config = {},
            oo = {
            parse: sinon.spy(function () {
                return 'decoded';
            })
        },
            uuidv4 = {};
        var request = 'request',
            location = { type: 'session' },
            options = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        sw.get(request, location, options);

        // Then
        sinon.assert.calledOnce(oo.parse);
    });
    it('should initialize module and run GET from shared storage', function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(function (r) {
                    return r;
                })
            }
        };
        global.atob = sinon.spy(function (r) {
            return r;
        });
        var config = {
            get: sinon.spy(function () {
                return {
                    value: 'testValue'
                };
            })
        },
            oo = {
            parse: sinon.spy(function () {
                return 'decoded';
            })
        },
            uuidv4 = {};
        var request = 'request',
            location = { type: 'shared' },
            options = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        var response = sw.get(request, location, options);

        // Then
        expect(response).to.equal('testValue');
    });

    // INFO
    it('should initialize module and run INFO (null - condition should never happen)', function () {

        // Given
        var configuration = {},
            oo = {},
            uuidv4 = {};

        // When
        var sw = new StorageManager(configuration, oo, uuidv4);
        var test = sw.info();

        // Then
        expect(test).to.equal(false);
    });
    it('should initialize module and run INFO from local storage', function () {

        // Given
        global.window = {
            localStorage: {
                getItem: sinon.spy(function () {
                    return {
                        type: 'response',
                        created: 'now',
                        lastModified: 'lastmodified'
                    };
                })
            }
        };
        global.atob = sinon.spy(function () {
            return {
                type: 'response',
                created: 'now',
                lastModified: 'lastmodified'
            };
        });
        var config = {},
            oo = {
            parse: sinon.spy(function () {
                return {
                    type: 'response',
                    created: 'now',
                    lastModified: 'lastmodified'
                };
            })
        },
            uuidv4 = {};
        var request = 'request',
            location = { type: 'local' },
            options = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        var test = sw.info(request, location, options);
        var expected = {
            type: 'response',
            created: 'now',
            lastModified: 'lastmodified'
        };

        // Then
        expect(test).to.deep.equal(expected);
    });
    it('should initialize module and run INFO from session storage', function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(function (r) {
                    return r;
                })
            }
        };
        global.atob = sinon.spy(function (r) {
            return r;
        });
        var config = {},
            oo = {
            parse: sinon.spy(function () {
                return {
                    type: 'response',
                    created: 'now',
                    lastModified: 'lastmodified'
                };
            })
        },
            uuidv4 = {};
        var request = 'request',
            location = { type: 'session' },
            options = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        var test = sw.info(request, location, options);
        var expected = {
            type: 'response',
            created: 'now',
            lastModified: 'lastmodified'
        };

        // Then

        expect(test).to.deep.equal(expected);
    });
    it('should initialize module and run INFO from shared storage', function () {

        // Given
        global.window = {
            sessionStorage: {
                getItem: sinon.spy(function (r) {
                    return r;
                })
            }
        };
        global.atob = sinon.spy(function (r) {
            return r;
        });
        var config = {
            info: sinon.spy(function () {
                return {
                    value: 'testValue'
                };
            })
        },
            oo = {
            parse: sinon.spy(function () {
                return 'decoded';
            })
        },
            uuidv4 = {};
        var request = 'request',
            location = { type: 'shared' },
            options = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        var response = sw.get(request, location, options);

        // Then
        expect(response).to.equal('testValue');
    });

    // PUT


    // DELETE

    // SERIALIZE

    // encode() todo: needs then condition
    it('should initialize module and run encode', function () {

        // Given
        global.btoa = sinon.spy(function (r) {
            return r;
        });
        var config = {},
            oo = {
            parse: sinon.spy(function () {
                return 'decoded';
            })
        },
            uuidv4 = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        sw.encode('string');

        // Then

    });

    // decode() todo: needs then condition
    it('should initialize module and run decode', function () {

        // Given
        global.atob = sinon.spy(function (r) {
            return r;
        });
        var config = {},
            oo = {
            parse: sinon.spy(function () {
                return 'decoded';
            })
        },
            uuidv4 = {};

        // When
        var sw = new StorageManager(config, oo, uuidv4);
        sw.decode('string');

        // Then

    });
});
