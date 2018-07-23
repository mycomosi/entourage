/**
 * Shared Storage utilizes the SharedWorker thread to centralize a shared thread,
 * accessable by all windows/tabs running Entourage, or at least the PostalWorker module
 *
 * @Author Russ Stratfull 2018
 */

import * as S from '../../src/es6/Strings';
import oo from "json8";
const json8 = oo;
import uuidv4 from 'uuid';
import {encode64, decode64, es6Type, StorageManager} from "../../src/es6/storage-manager";

let store = new Map(),
    events = new Map();

class StorageWorker {

    constructor() {
        this.types = new Map([
            [S.PUT, this.put],
            [S.GET, this.get],
            [S.SERIALIZE, this.serialize],
            [S.DELETE, this.delete]
        ]);
    }

    /**
     *
     * @param request
     * @param source
     * @private
     */
    put(request, source) {
        for (let r of request) {
            if (events.has(S.PUT)) {
                let row = {};
                row[r.key] = r;
                events.get(S.PUT)(row, source);
            }
            store.set(r.key, r);
        }
    }

    /**
     *
     * @param request
     * @param source
     */
    get(request, source) {
        // todo: @Russ - Add support for iterable requests
        let response = store.get(request);
        if (events.has(S.GET)) {
            events.get(S.GET)(response, source);
        }
        postalSharedWorker.fire(S.ENTOURAGE_STORAGE_RESPONSE, response, source);
    }

    /**
     * Serialize entire storage and return it to main thread
     * @param request
     * @param source
     */
    serialize(request, source) {
        let exp = json8.serialize({action: S.SERIALIZE, store: store});
        if (events.has(S.SERIALIZE)) {
            events.get(S.SERIALIZE)(source);
        }
        postalSharedWorker.fire(S.ENTOURAGE_STORAGE_RESPONSE, exp, S.PRIVATE, source);
    }

    /**
     *
     * @param key
     */
    delete(key) {
        if (events.has(S.DELETE)) {
            events.get(S.DELETE)(key);
        }
        store.delete(key);
    }


    // Events

    /**
     *
     * @param event
     * @param callback
     */
    on(event, callback) { // put, get, info, serialize, delete, *un* on?
        events.set(event, callback);
    }

    /**
     *
     * @param event
     */
    un(event) {
        if (events.get(S.UN)) {
            events.get(S.UN)(event);
        }
        events.delete(event);
    }

    /**
     *
     * @private
     */
    _start() {
        postalSharedWorker.on(
            S.ENTOURAGE_STORAGE, (msg, source) => {
                let action = msg.action,
                    requests = msg.requests.map(r => decode64(r));
                // Map request to method
                if (this.types.get(action)) {
                    // Invoke
                    this.types.get(action)(requests, source);
                }
                else {
                    // todo: Show an error?
                }

            }
        );
    }
}

const StorageWorking = new StorageWorker();
StorageWorking._start();
self.getStorageWorker = () => {
    return StorageWorking;
};
self.getStore = () => {
    return store;
};
self.getEvents = () => {
    return events;
};
