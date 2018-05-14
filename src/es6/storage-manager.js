/**
 *  Manage local, session, & *shared* storage systems
 *  @Author Russ Stratfull 2018
 */

import * as S from "./Strings";


export class StorageManager {

    constructor(configuration) {
        this._types = new Map([
            [S.LOCAL, {put: this._putLocalStorage, get: this._getLocalStorage}],
            [S.SESSION, {put: this._putSessionStorage, get: this._getSessionStorage}],
            [S.SHARED, {put: this._putSharedStorage, get: this._getSharedStorage}],
            [S.REMOTE, {put: this._putRemoteStorage, get: this._getRemoteStorage}]
        ]);

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
                response = this._types.get(location.type).get(request, location);
            }

            return response;
        };

        /**
         * Add/Update entry in storage location
         * @param units - Units of stuff that need to be stored
         * @param location - Location to store the unit
         * @param options - (optional) Additional options object
         */
        this.put = (units, location, options = false) => {
            // Initialize response (fails with false, so set false as first value)
            let response = false;
            // formats = new Set([S.JSON, S.BASE64, S.FUNCTION]);

            // A unit definition and location are both required fields
            if (units && units.length &&
                location && location.type &&
                this._types.has(location.type)) {
                response = this._types.get(location.type).put(units, options);
            }

            return response;
        };
    }


    // Private


    _putLocalStorage(units, options) {
        let size_ = units.length,
            completes_ = [],
            fails_ = [];

        for (let unit of units) {
            window.localStorage.setItem(unit.key, unit.value);
        }

        return true;
    }

    _getLocalStorage() {

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


}