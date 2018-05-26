/**
 *  Manage local, session, & *shared* storage systems
 *  @Author Russ Stratfull 2018
 */

import * as S from "./Strings";

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
                this._types.has(location.type)) {
                response = this._types().get(location.type).get(request, location);
            }
            return response;
        };

        /**
         * Add/Update entry in storage location
         * @param units - Units of stuff that need to be stored
         *
         {
            id: 'String',
            formats: '', // json, base64
            content: '*' // data...
         }
         *
         * @param location - Location to store the unit
         * @param options - (optional) Additional options object
         */
        this.put = (units, location, options = false) => {
            // Initialize response (fails with false, so set false as first value)
            let response = false;
            // A unit definition and location are both required fields
            if (units && Array.isArray(units) && units.length &&
                location && location.type &&
                this._types.has(location.type)) {
                response = this._types().get(location.type).put(units, options);
            }
            return response;
        };

    }

    // Private
    /**
     * Put units into localstorage
     * @param units
     * @param options
     * @return {boolean}
     * @private
     */
    _putLocalStorage(units, options) {
        let opts = options; // not implemented currently
        let result = false,
            addMeta = (unit) => {
                return `[${Date.now()}][${unit.formats}]//${unit.content}`;
            };
        if (Array.isArray(units)) {
            for (let unit of units) {
                if (unit.id && unit.content) {
                    window.localStorage.setItem(unit.id, addMeta(unit));
                }
            }
        }
        else {
            window.localStorage.setItem(units.id, addMeta(units));
        }

        return result;
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

    _putSessionStorage(units, options) {

    }

    _getSessionStorage() {

    }

    _putSharedStorage(units, options) {

    }

    _getSharedStorage() {

    }

    _putRemoteStorage(units, options) {

    }

    _getRemoteStorage() {

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
    _types() {
        return new Map([
            [S.LOCAL, {put: this._putLocalStorage, get: this._getLocalStorage}],
            [S.SESSION, {put: this._putSessionStorage, get: this._getSessionStorage}],
            [S.SHARED, {put: this._putSharedStorage, get: this._getSharedStorage}],
            [S.REMOTE, {put: this._putRemoteStorage, get: this._getRemoteStorage}]
        ]);
    }
}