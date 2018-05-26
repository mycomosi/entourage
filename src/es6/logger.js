/**
 Logger entourage logging system
 Overrides window.console methods,
 offering console suppression, carbon copying,
 and routing to sharedWorker
 @Author Russ Stratfull 2018
 */

import * as S from "./Strings";

let _log = window.console.log,
    _info = window.console.info,
    _warn = window.console.warn,
    _error = window.console.error,
    _debug = window.console.debug,
    _levels = {},
    _carbonCopies = new Set();

export class Logger {

    constructor(configuration) {

        // Log levels
        _levels = {
            log: configuration.log || false,
            info: configuration.info || false,
            warn: configuration.warn || false,
            error: configuration.error || false,
            debug: configuration.debug || false
        };

        /**
         *  Get current logger log level settings
         * @param level - log, info, warn, error, debug, all (defaults to "all" if no level is provided)
         * @return {boolean | object}
         */
        this.get = (level) => {
            return (level && level.toLowerCase() !== S.ALL) ? _levels[level] : _levels;
        };
        this.get.info = `Use this method to view a log level setting`;

        /**
         *  Set current logger log level settings (toggles current setting if no change provided)
         * @param level
         * @param change (optional)
         * @return {object | boolean}
         */
        this.set = (level, change) => {
            if (level && _levels[level] !== undefined) {
                _levels[level] = change || (!_levels[level]);
                return _levels;
            }
            else return false;
        };
        this.set.info = `Use this method to change a log level setting`;

        this.subscribe = this._subscribe;

        // Override window console methods
        window.console = {};
        window.console.log = (logMessage) => {
            if (!_levels.log) {

            }
            else {
                this._cc(S.LOG, logMessage);
                _log(logMessage);
            }
        };
        window.console.info = (logMessage) => {
            if (!_levels.info) {

            }
            else {
                this._cc(S.INFO, logMessage);
                _info(logMessage);
            }
        };
        window.console.warn = (logMessage) => {
            if (!_levels.warn) {

            }
            else {
                this._cc(S.WARN, logMessage);
                _warn(logMessage);
            }
        };
        window.console.error = (logMessage) => {
            if (!_levels.error) {

            }
            else {
                this._cc(S.ERROR, logMessage);
                _error(logMessage);
            }
        };
        window.console.debug = (logMessage) => {
            if (!_levels.debug) {

            }
            else {
                this._cc(S.DEBUG, logMessage);
                _debug(logMessage);
            }
        };

        // Carbon Copy the log messages somewhere
        let cc = configuration.cc || configuration.callbacks || false;
        if (cc) {
            if (typeof cc === S.FUNCTION) {
                _carbonCopies.add(cc);
            }
            else if (typeof cc === S.OBJECT && cc.forEach) {
                cc.forEach(cb => {
                    _carbonCopies.add(cb);
                });
            }
        }

    }

    /**
     * Send CC of current log message to all carbon copies
     * @param level
     * @param logMessage
     * @private
     */
    _cc(level, logMessage) {
        if (_carbonCopies.size) {
            _carbonCopies.forEach(copy => {
                copy(level, logMessage);
            });
        }
    }

    /**
     * Subscribe addtitional carbon copy callbacks
     * @param fn {function}
     * @public
     */
    _subscribe(fn) {
        if (typeof fn === S.FUNCTION) {
            _carbonCopies.add(fn);
        }
        else if (typeof fn === S.OBJECT && fn.forEach) {
            fn.forEach(cb => {
                _carbonCopies.add(cb);
            })
        }
    }

    /**
     *  Original window.console.log
     * @param logMessage
     */
    log(logMessage) {
        _log(logMessage);
    }

    /**
     * Original window.console.info
     * @param logMessage
     */
    info(logMessage) {
        _info(logMessage);
    }

    /**
     * Original window.console.warn
     * @param logMessage
     */
    warn(logMessage) {
        _warn(logMessage);
    }

    /**
     * Original window.console.error
     * @param logMessage
     */
    error(logMessage) {
        _error(logMessage);
    }

    /**
     * Original window.console.debug
     * @param logMessage
     */
    debug(logMessage) {
        _debug(logMessage);
    }

    /**
     * http://2ality.com/2015/08/logging-variables-tagged-template.html
     * @param templateStrings
     * @param substitutions
     * @return {*}
     * Example:
     let foo = 123;
     let bar = 'abc';
     let baz = true;
     console.log(vars`Variables: ${{foo, bar, baz}}`);
     */
    // addKeys(templateStrings, ...substitutions) {
    //     let result = templateStrings[0];
    //     for (let [i, obj] of substitutions.entries()) {
    //         let propKeys = Object.keys(obj);
    //         for (let [j, propKey] of propKeys.entries()) {
    //             if (j > 0) {
    //                 result = result.concat(', ');
    //             }
    //             result = result.concat(`{${propKey}="${obj[propKey]}"}`);
    //         }
    //         result = result.concat(templateStrings[i+1]);
    //     }
    //     return result;
    // }

}