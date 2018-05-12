/**
 *  Entourage Web Application Bootstrap Creator Module
 *  @Author Russ Stratfull
 */

import * as S from "./Strings";
import Aeson from 'aeson';
import {Historian} from "./historian";
import {OauthHelper} from "./oauth-helper";
import {Logger} from "./logger";
// import {SessionStorageHelper} from "./session-storage-helper";
// import {LocalStorageHelper} from "./local-storage-helper";
import PostalWorker from "postalworker";
import {StorageManager} from "./storage-manager";

let configurationCache = null,
    assembly, start, unauthorized, authorized,
    aeson_, postalWorker_, oauthHelper_;

/**
 * Internal (hidden) functions
 * @private
 */
let _authorize = () => {
    let auth = false;
    if (typeof configurationCache.credentials.authorizer === S.FUNCTION) {
        auth = configurationCache.credentials.authorizer(configurationCache.credentials.configuration);
    }
    // todo: Russ - Add extendable credential option
    else if (configurationCache.credentials.extend) {}
    else {
        switch (configurationCache.credentials.type) {

            // basic authentication
            case S.BASIC:
                // todo...
                break;

            // Oauth
            case S.OAUTH:
                auth = oauthHelper_.processOauth(S.RESOLVE);
                break;
        }
    }
};

let // Synchronous loaders...
    _loadScriptsThen = (collection, callback) => {
        let lib = collection.filter((sc) => sc.type.toLowerCase() === S.SCRIPT || sc.type.toLowerCase() === S.JS),
            total = lib.length;
        let checkIfDoneThenCallback = () => {
            total--;
            if (!total) {
                callback();
            }
        };
        if (lib.length) {
            let total = lib.length,
                loadScript = (script) => {
                    let scrpt = document.createElement(S.SCRIPT);

                    // IE
                    if (scrpt.readyState) {
                        scrpt.onreadystatechange = function() {
                            if (scrpt.readyState.toLowerCase() === S.LOADED ||
                                scrpt.readyState.toLowerCase() === S.COMPLETE) {
                                scrpt.onreadyStatechange = null;
                                checkIfDoneThenCallback();
                            }
                        };
                    }
                    // Everybody else
                    else {
                        scrpt.onload = () => {
                            callback();
                        };
                    }
                    scrpt.src = script;

                    document.querySelector('body').appendChild(scrpt);
                };
            for (let s of lib) {
                loadScript(s.path);
            }
        }
        else {
            callback();
        }
    },
    _loadDictionariesThen = (collection, callback) => {

        let dicts = collection.filter(
            d => d.type.toLowerCase() === S.DICT ||
                d.type.toLowerCase() === S.DICTIONARY
        );
        if (dicts.length) {
            aeson_.loadJsons(
                dicts.map(j => {
                    return {
                        path: j.path,
                        id: j.key
                    };
                }),
                () => {
                    if (typeof callback === S.FUNCTION) {
                        callback();
                    }
                }
            );
        }
        else {
            callback();
        }

    },
    _loadStyleSheetsThen = (collection, callback) => {
        let sheets = collection.filter(
            sheet => sheet.type.toLowerCase() === S.CSS ||
                sheet.type.toLowerCase() === S.STYLESHEET
            ),
            total = sheets.length,
            checkIfDoneCallback = () => {
                total--;
                if (!total) {
                    callback();
                }
            };

        if (sheets.length) {
            for (let s of sheets) {
                let sheet = document.createElement(S.LINK);
                sheet.rel = S.STYLESHEET;
                sheet.type = S.TEXT_CSS;
                if (sheet.readyState) {
                    sheet.onreadyStatechange = function() {
                        if (sheet.readyState.toLowerCase() === S.LOADED ||
                            sheet.readyState.toLowerCase() === S.COMPLETE) {
                            sheet.onreadyStatechange = null;
                            checkIfDoneThenCallback();
                        }
                    };
                }
                else {
                    sheet.onload = () => {
                        checkIfDoneCallback();
                    };
                }
                sheet.href = s.path;
                document.querySelector(S.HEAD).appendChild(sheet);
            }
        }
        else {
            callback();
        }
    };

let // Assembly stages...
    /**
     * Start assembling before any state/session info has been determined
     * @private
     */
    _assembleStart = () => {
        if (assembly.start && assembly.start.length) {
            _loadDictionariesThen(assembly.start, () => {
                _loadStyleSheetsThen(assembly.start, () => {
                    _loadScriptsThen(assembly.start, () => {
                        _authorize();
                    });
                });
            });
        }
    },
    /**
     * Assemble environment elements when session is not authorized
     * @private
     */
    _assembleUnauthorized = () => {
        _loadDictionariesThen(assembly.unauthorized, () => {
            _loadStyleSheetsThen(assembly.unauthorized, () => {
                _loadScriptsThen(assembly.unauthorized, () => {
                    if (authorized) {
                        //this._assembleAuthorized(assembly);
                    }
                });
            });
        });
    },
    /**
     *
     * @private
     */
    _assembleAuthorized = () => {
        _loadDictionariesThen(assembly.authorized, () => {
            _loadStyleSheetsThen(assembly.authorized, () => {
                _loadScriptsThen(assembly.authorized, false); // For now, no final cb...
            });
        });
    };

export class Entourage {

    constructor(configuration) {

        configurationCache = configuration || false;
        aeson_ = new Aeson(fetch);
        oauthHelper_ = new OauthHelper(configuration.credentials.configuration);

        // Public modules & methods

        /**
         * Postal Worker is an event bus that allows windows, tabs, and worker threads to communicate
         */
        this.PostalWorker = new PostalWorker(configurationCache.postal);

        /**
         * Custom logging system
         * @type {Logger}
         */
        this.Logger = new Logger(configuration.logger);

        // Hook in postal forwarding here (cc)
        // todo: Make this more dynamic...
        if (configurationCache.postal &&
            this.PostalWorker) {
            this.Logger.subscribe(
                (level, logMessage) => {
                    this.PostalWorker.fire(S.LOGGER, {logLevel: level, logMessage: logMessage});
                }
            );

            this.PostalWorker.load(S.LOGWORKER);
        }

        /**
         * Translator has translate method which looks up entourage's dictionaries
         * (like i18n's, themes, etc...)
         * It uses the Aeson json mapping module by Ronan Quillévéré
         */
        this.Translator = {
            /**
             *
             * @param type
             * @param key
             * @param defaultValue
             * @return {string}
             */
            translate: (type, key, defaultValue) => {
                return aeson_.getProperty(type, key, defaultValue);
            }
        };

        /**
         * Historian keeps track of url browsing history (including queryparams and hashes)
         */
        this.Historian = new Historian(configuration.historian);

        /**
         *  Storage Manager interacts with session & local storage in the browser
         */
        this.StorageManager = new StorageManager(configuration.storage);

        // Configuration required to assemble...
        if (configurationCache) {
            assembly = configuration.assembly || false;
            if (assembly) {

                // Cache stages
                start = (assembly.start && assembly.start.length) ? assembly.start : false;
                unauthorized = (assembly.unauthorized && assembly.unauthorized.length) ? assembly.unauthorized : false;
                authorized = (assembly.authorized && assembly.authorized.length) ? assembly.authorized : false;

                // Synchronous start sequence...
                // Before anything else (Pre-Auth)
                if (start) {
                    _assembleStart();
                }
                else {
                    _authorize();
                }
            }
        }
    }

    // todo: Russ - temporary for debug
    _getConfig() {
        return configurationCache;
    }

}