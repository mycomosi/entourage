/**
 *  Manage local, session, & *shared* storage systems
 *  @Author Russ Stratfull 2018
 */

import * as S from "./Strings";

import uuidv4 from 'uuid';

const // Types as constants
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    UNDEFINED = 'undefined';

let decode64 = (value) => {
        try {
            return JSON.parse(atob(value));
        }
        catch(e) {
            return atob(value);
        }
    },
    encode64 = (value) => {
        try {
            return btoa(JSON.stringify(value));
        }
        catch(e) {
            return btoa(value);
        }
    };

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
                response = this._storageTypes().get(location.type).get(request, options);
            }
            return response;
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
            }
            return {
                type: response.type,
                created: response.created,
                lastModified: response.lastModified
            };
        };

        /**
         * Add/Update entry in storage location
         * @param units - Units of stuff that need to be stored
         *
         {
            id: 'String', // *optional*
            content: '*' // data...
         }
         *
         * @param location - Location to store the unit
         * @param options - (optional) Additional options object
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
                response = this._storageTypes().get(location.type).del(iUnits, options);
            }
            return response;
        };

    }

    // Private

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
        let result = false,
            puts = new Map();
        for (let unit of units) {
            // Is it already in storage?
            if (!!window.localStorage.getItem(unit.key)) {
                let cache = JSON.parse(atob(window.localStorage.getItem(unit.key)));
                let update = encode64({
                    type: unit.type,
                    created: cache.created,
                    lastModified: Date.now(),
                    value: unit.value
                });

                window.localStorage.setItem(unit.key, update);
            }
            else {
                let update = encode64({
                    type: unit.type,
                    created: unit.created,
                    lastModified: unit.lastModified,
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
            let parsed = decode64(result);
            return parsed.value;
        }
        else return false;
    }

    /**
     *
     * @param units
     * @param options
     * @private
     */
    _putSessionStorage(units, options) {

    }

    /**
     *
     * @private
     */
    _getSessionStorage() {

    }

    /**
     *
     * @param units
     * @param options
     * @private
     */
    _putSharedStorage(units, options) {

    }

    /**
     *
     * @private
     */
    _getSharedStorage() {

    }

    /**
     *
     * @param units
     * @param options
     * @private
     */
    _putRemoteStorage(units, options) {

    }

    /**
     *
     * @private
     */
    _getRemoteStorage() {

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

    _removeSessionStorage() {

    }

    _removeSharedStorage() {

    }

    _removeRemoteStorage() {

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
            [S.LOCAL, {put: this._putLocalStorage, get: this._getLocalStorage, del: this._removeLocalStorage}],
            [S.SESSION, {put: this._putSessionStorage, get: this._getSessionStorage, del: this._removeSessionStorage}],
            [S.SHARED, {put: this._putSharedStorage, get: this._getSharedStorage, del: this._removeSharedStorage}],
            [S.REMOTE, {put: this._putRemoteStorage, get: this._getRemoteStorage, del: this._removeRemoteStorage}]
        ]);
    }
}