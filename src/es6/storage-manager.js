/**
 *  Manage local, session, & *shared* storage systems
 *  (Shared is user defined, although when used as part of entourage, it uses PostalWorker)
 *  @Author Russ Stratfull 2018
 */

import * as S from "./Strings";
import oo from "json8";
import uuidv4 from 'uuid';


const // Types as constants
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    MAP = 'map',
    SET = 'set',
    ARRAY = 'array',
    UNDEFINED = 'undefined';

const json8 = oo;

/**
 * Decode json8 serialized objects from base64 string
 * @param value
 * @return {string}
 */
export const decode64 = (value) => {
        try {
            return json8.parse(atob(value));
        }
        catch(e) {
            return atob(value);
        }
    },
    /**
     * Encode json8 serialized objects to base64 string
     * @param value
     * @return {string}
     */
    encode64 = (value) => {
        try {
            return btoa(json8.serialize(value));
        }
        catch(e) {
            return btoa(value);
        }
    };

/**
 *
 * @param obj
 * @return {string}
 */
export function es6Type(obj) {
    if (obj instanceof Map) return MAP;
    else if (obj instanceof Set) return SET;
    else if (obj instanceof Array) return ARRAY;
    else return OBJECT;
}

let sharedPut,
    sharedGet,
    sharedInfo,
    sharedDelete,
    sharedSerialize;

export class StorageManager {

    constructor(configuration) {

        // Public
        /**
         * Get entry from storage location
         * @param request
         * @param location
         * @param options *optional*
         */
        this.get = (request, location, options) => {
            let response = false;
            if (request &&
                location && location.type &&
                this._storageTypes().has(location.type)) {
                response = this._storageTypes().get(location.type).get(request, options).value;
            }
            return response || false;
        };

        /**
         *
         * @param request
         * @param location
         * @return {{type, created: *, lastModified: *|number|string}}
         */
        this.info = (request, location) => {
            let response = false;
            if (request &&
                location && location.type &&
                this._storageTypes().has(location.type)) {
                response = this._storageTypes().get(location.type).get(request);
                return (response) ? {
                    type: response.type,
                    created: response.created,
                    lastModified: response.lastModified
                } : false;
            }
            else {
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
        this.put = (units, location, options = false) => {
            // Initialize response (fails with false, so set false as first value)
            let response = false;
            // A unit definition(s) and location are both required arguments
            if (units &&
                location && location.type &&
                this._storageTypes().has(location.type)) {
                let iUnits = this._prePackUnits((Array.isArray(units)) ? units : [units]);
                response = this._storageTypes().get(location.type).put(iUnits, options);
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
        this.delete = (units, location, options) => {
            let response = false;
            if (units &&
                location && location.type &&
                this._storageTypes().has(location.type)) {
                let iUnits = (Array.isArray(units)) ? units : [units];
                this._storageTypes().get(location.type).del(iUnits, options);

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
        this.serialize = (location, options) => {
            let response = false;
            if (location && location.type &&
                this._storageTypes().has(location.type)) {
                response = this._storageTypes().get(location.type).serialize();
            }
            return response;
        };

        /**
         * Inject shared functions
         */
        if (typeof configuration.put === S.FUNCTION) {
            sharedPut = configuration.put || function () {
            }; // todo
        }
        if (typeof configuration.get === S.FUNCTION) {
            sharedGet = configuration.get || function () {
            }; // todo
        }
        if (typeof configuration.info === S.FUNCTION) {
            sharedInfo = configuration.info || function () {
            }; // todo
        }
        if (typeof configuration.delete === S.FUNCTION) {
            sharedDelete = configuration.delete || function () {
            }; // todo
        }
        if (typeof configuration.serialize === S.FUNCTION) {
            sharedSerialize = configuration.serialize || function () {
            }; // todo

        }

    }

    // Private

    // LocalStorage
    /**
     *
     * @param units
     * @param options
     * @private
     */
    _prePackUnits(units, options) {
        return units.map(unit => {
            let u = {},
                dataType = typeof unit.value,
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
     * @param options
     * @return {boolean}
     * @private
     */
    _putLocalStorage(units, options) {
        let result = false;
        for (let unit of units) {
            // Is it already in storage?
            if (!!window.localStorage.getItem(unit.key)) {
                let cache = json8.parse(atob(window.localStorage.getItem(unit.key)));
                let update = encode64({
                    type: unit.type,
                    created: cache.created,
                    lastModified: Date.now(),
                    value: unit.value
                });

                window.localStorage.setItem(unit.key, update);
            }
            else {
                let create = Date.now();
                let update = encode64({
                    type: unit.type,
                    created: create,
                    lastModified: create,
                    value: unit.value
                });

                window.localStorage.setItem(unit.key, update);
            }
        }
    }

    /**
     *
     * @param request
     * @param options
     * @return {string | null}
     * @private
     */
    _getLocalStorage(request, options) {
        let result = window.localStorage.getItem(request);
        if (result) {
            return decode64(result);
        }
        else return false;
    }

    /**
     *
     * @param keys
     * @private
     */
    _removeLocalStorage(keys) {
        for (let key of keys) {
            window.localStorage.removeItem(key);
        }
    }

    /**
     *
     * @return {string}
     * @private
     */
    _serializeLocalStorage() {
        let repository = window.localStorage;
        let out = {};
        Object.keys(repository).forEach(key => {
            try {
                window.atob(repository[key]);
                out[key] = decode64(repository[key]);
            }
            catch(e) {}
        });
        return JSON.stringify(out);
    }

    // SessionStorage
    /**
     *
     * @param units
     * @param options
     * @private
     */
    _putSessionStorage(units, options) {
        let result = false;
        for (let unit of units) {
            // Is it already in storage?
            if (!!window.sessionStorage.getItem(unit.key)) {
                let cache = json8.parse(atob(window.sessionStorage.getItem(unit.key)));
                let update = encode64({
                    type: unit.type,
                    created: cache.created,
                    lastModified: Date.now(),
                    value: unit.value
                });

                window.sessionStorage.setItem(unit.key, update);
            }
            else {
                let create = Date.now();
                let update = encode64({
                    type: unit.type,
                    created: create,
                    lastModified: create,
                    value: unit.value
                });

                window.sessionStorage.setItem(unit.key, update);
            }
        }
    }

    /**
     *
     * @param request
     * @param options
     * @return {*}
     * @private
     */
    _getSessionStorage(request, options) {
        let result = window.sessionStorage.getItem(request);
        if (result) {
            return decode64(result);
        }
        else return false;
    }

    /**
     *
     * @param keys
     * @private
     */
    _removeSessionStorage(keys) {
        for (let key of keys) {
            window.sessionStorage.removeItem(key);
        }
    }

    /**
     *
     * @return {string}
     * @private
     */
    _serializeSessionStorage() {
        let repository = window.sessionStorage;
        let out = {};
        Object.keys(repository).forEach(key => {
            try {
                window.atob(repository[key]);
                out[key] = decode64(repository[key]);
            }
            catch(e) {}
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
    _putSharedStorage(units, options) {
        if (sharedPut) return sharedPut(units, options);
    }

    /**
     * Get units from shared storage
     * @private
     */
    _getSharedStorage(request, options) {
        if (sharedGet) return sharedGet(request, options)
    }

    /**
     *
     * @param keys
     * @return {*}
     * @private
     */
    _removeSharedStorage(keys) {
        if (sharedDelete) return sharedDelete(keys);
    }

    /**
     *
     * @return {*}
     * @private
     */
    _serializeSharedStorage() {
        if (sharedSerialize) return sharedSerialize();
    }

    /**
     * Generate a random key (RFC4122 UUID
     * https://www.npmjs.com/package/uuid
     * @return {string} - Example: '416ac246-e7ac-49ff-93b4-f7e94d997e6b'
     * @private
     */
    _getUniqueKey() {
        return uuidv4();
    }

    /**
     *
     * @return {Map<any, any>}
     * @private
     */
    _storageTypes() {
        return new Map([
            [S.LOCAL, {
                put: this._putLocalStorage,
                get: this._getLocalStorage,
                del: this._removeLocalStorage,
                serialize: this._serializeLocalStorage
            }],
            [S.SESSION, {
                put: this._putSessionStorage,
                get: this._getSessionStorage,
                del: this._removeSessionStorage,
                serialize: this._serializeSessionStorage
            }],
            [S.SHARED, {
                put: this._putSharedStorage,
                get: this._getSharedStorage,
                del: this._removeSharedStorage,
                serialize: this._serializeSharedStorage
            }]
        ]);
    }

    /**
     *
     * @param unit
     * @return {string}
     */
    encode(unit) {
        return encode64(unit);
    }

    /**
     *
     * @param unit
     * @return {string}
     */
    decode(unit) {
        return decode64(unit);
    }
}
