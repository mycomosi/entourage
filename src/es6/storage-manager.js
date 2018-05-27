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

export class StorageManager {

    constructor(configuration) {

        // Public
        /**
         * Get entry from storage location
         * @param request
         * @param location
         */
        this.get = (request, location) => {
            let response = false;
            if (request &&
                request.type &&
                location && location.type &&
                this._storageTypes().has(location.type)) {
                response = this._storageTypes().get(location.type).get(request, location);
            }
            return response;
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
                let update = btoa(JSON.stringify({
                    type: unit.type,
                    created: cache.created,
                    lastModified: Date.now(),
                    value: unit.value
                }));
                // puts.set(unit.key, update);
                console.info('update');
                console.info(atob(update));
                window.localStorage.setItem(unit.key, update);
            }
            else {
                let update = btoa(JSON.stringify({
                    type: unit.type,
                    created: unit.created,
                    lastModified: unit.lastModified,
                    value: unit.value
                }));
                // puts.set(unit.key, update);
                window.localStorage.setItem(unit.key, update);
            }
        }

        console.info(puts);
    }

    /**
     *
     * @param request
     * @param options
     * @return {string | null}
     * @private
     */
    _getLocalStorage(request, options) {
        let opts = options; // not implemented currently
        if (Array.isArray(request)) {
            let results = [];
            for (let unit of request) {
                results.push(
                    window.localStorage.getItem(unit)
                );
            }
            return results;
        }
        else {
            return window.localStorage.getItem(request.key);
        }
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
     * Generate a random key (RFC4122 UUID
     * https://www.npmjs.com/package/uuid
     * @return {string} - Example: '416ac246-e7ac-49ff-93b4-f7e94d997e6b'
     * @private
     */
    _getUniqueKey() {
        return uuidv4();
    }

    /**
     *  Decode encrypted object from base64 encoded string
     *  @param value
     *  @return {*}
     *  @private
     */
    _decode64(value) {
        try {
            return JSON.parse(atob(value));
        }
        catch(e) {
            return atob(value);
        }
    }

    /**
     *  Encode object into base64 encoded string
     *  @param value
     *  @return {string}
     *  @private
     */
    _encode64(value) {
        try {
            return btoa(JSON.stringify(value));
        }
        catch(e) {
            return btoa(value);
        }
    }

    /**
     *
     * @return {Map<any, any>}
     * @private
     */
    _storageTypes() {
        return new Map([
            [S.LOCAL, {put: this._putLocalStorage, get: this._getLocalStorage}],
            [S.SESSION, {put: this._putSessionStorage, get: this._getSessionStorage}],
            [S.SHARED, {put: this._putSharedStorage, get: this._getSharedStorage}],
            [S.REMOTE, {put: this._putRemoteStorage, get: this._getRemoteStorage}]
        ]);
    }
}