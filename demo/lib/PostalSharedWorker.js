/**
 * PostalWorker String Constants
 * @type {string}
 */
const ON = 'ON';
const UN = 'UN';
const FIRE = 'FIRE';
const MESSAGE = 'message';
const PRIVATE = 'private';
const PUBLIC = 'public';
const BUFFERDROPPED = 'BUFFERDROPPED';
const ALL = 'ALL';
const LOAD = 'LOAD';
const RESPONSE = 'RESPONSE';
const SET_ADDRESS = 'SET_ADDRESS';

/**
 *  Postal Worker - Shared Worker Thread Engine
 *  @Description: Use web worker threading to fork threads and use postMessage to pass serialized data between threads and windows
 *  @Author: Russ Stratfull 2017-2018
 */

function uniqueNumber() {
    var date = Date.now();

    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }

    return date;
}
uniqueNumber.previous = 0;

postalSharedWorker = {
    ports: [],
    events: new Map(),
    scripts: new Set(),
    addresses: new Set(),
    /**
     *
     * @param msgClass
     * @param action
     */
    on: (msgClass, action) => {
        postalSharedWorker.events.set(msgClass, action);
    },

    /**
     *
     * @param msgClass
     */
    un: (msgClass) => {
        postalSharedWorker.events.delete(msgClass);
    },

    /**
     *
     * @param msgClass
     * @param msg
     */
    fire: (msgClass, msg) => {

    },

    /**
     * Process message events
     * @param event
     * @param port
     * @param ports
     * @private
     */
    _processMessage: (event, port, ports) => {

        if (event.data && event.type) {

            let msg = JSON.parse(event.data),
                range;

            switch (msg.type) {

                // Responses keep the worker aware of which connections are current
                case RESPONSE:
                    if (msg.status) {
                        let lastRequest = postalSharedWorker.ports.find(prt => prt.session === event.currentTarget);
                        if (lastRequest && lastRequest.tries) lastRequest.tries++;
                    }
                    break;

                case ON:
                    // todo: Not ported over from previous version yet
                    break;

                case UN:
                    // todo: Not ported over from previous version yet
                    break;

                case FIRE:

                    // Broadcast to windows/tabs
                    range = msg.data.audience || ALL; // public, private, ALL todo: direct port messaging...
                    postalSharedWorker._postMessenger(FIRE, range, msg.data, port);
                    if (postalSharedWorker.events.has(msg.data.msgClass)) {
                        postalSharedWorker.events.forEach(evt => {
                            let address,
                                index;
                            for (let p of postalSharedWorker.ports) {
                                if (p.session === event.currentTarget) {
                                    address = p.address;
                                    index = postalSharedWorker.ports.indexOf(p);
                                }
                            }
                            evt(msg.data.message, {index: index, address: address});
                        });
                    }
                    break;


                // todo...
                // case S.AJAX:
                //     break;
                // todo...
                case LOAD:

                    if (postalSharedWorker.scripts.has(msg.data)) {
                        return;
                    }
                    // Wrap importScripts in try catch to report errors back to the main window
                    // Attemp to load requested library
                    try {
                        importScripts(msg.data);
                        postalSharedWorker.scripts.add(msg.data);
                    }
                    catch(e) {
                        event.currentTarget.postMessage({
                            type: 'ERROR',
                            data: `PostalWorkerWorker Error: Unable to load file ${msg.data}`
                        });
                    }
                    break;

                case SET_ADDRESS: {
                    for (let p of postalSharedWorker.ports) {
                        if (p.session === event.currentTarget) {
                            p.address = msg.data;
                        }
                    }
                    let addressChange = {
                        type: SET_ADDRESS,
                        data: msg.data
                    };
                    event.currentTarget.postMessage(addressChange);
                }
            }
        }
    },
    // todo...
    // on: (msgClass, action) => {
    //
    // },
    // fire: (msgClass, msg) => {
    //
    // },

    /**
     * The messenger method used to post messages to the windows
     * @param type
     * @param audience
     * @param msg
     * @param port
     * @private
     */
    _postMessenger: (type, audience, msg, port) => {

        let notification;

        switch (audience) {

            case PRIVATE:
                notification = {
                    type: type,
                    data: msg
                };
                port.tries++;
                port.postMessage(notification);
                break;

            case PUBLIC:
                // Loop through ports
                for (let p of postalSharedWorker.ports) {
                    p.tries--;
                    if (port !== p.session) {
                        notification = {
                            // If buffer drops, send one last notification of type BUFFERDROPPED
                            type: (p.tries<1) ? BUFFERDROPPED : type,
                            data: msg
                        };
                        p.session.postMessage(notification);
                    }
                }

                // Remove entries that don't have any tries left
                postalSharedWorker.ports = postalSharedWorker.ports.filter(pr => pr.tries > 0);
                break;

            default: // ALL
                // Fallback to older version support in case of no scope being defined
                for (let p of postalSharedWorker.ports) {
                    p.tries--;
                    notification = {
                        // If buffer drops, send one last notification of type BUFFERDROPPED
                        type: (p.tries<1) ? BUFFERDROPPED : type,
                        data: msg
                    };
                    p.session.postMessage(notification);
                }

            // Remove entries that don't have any tries left
            postalSharedWorker.ports = postalSharedWorker.ports.filter(pr => pr.tries > 0);
        }

    }
};

/**
 * When windows connect to the worker,
 * register their source and start their messaging session
 * @param event
 */
onconnect = (event) => {

    let address = uniqueNumber();
    let src = event.source,
        port = {
            address: address,
            session: src,
            tries: 10
        };
    postalSharedWorker.ports.push(port);
    src.start();
    src.addEventListener(MESSAGE, (event) => {
        postalSharedWorker._processMessage(event, src, postalSharedWorker.ports);
    });
    let startup = {
        type: SET_ADDRESS,
        data: address
    };
    src.postMessage(startup);

};
