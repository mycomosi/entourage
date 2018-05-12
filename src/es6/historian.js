/**
 *  Historian keeps track of browser history
 *  Inspired and heavily influenced by Ronan
 */


import querystring from "query-string";
import * as S from "./Strings";

let onPopStateCallback = false;

export class Historian {
    constructor(configuration) {
        window.onpopstate = (event) => {
            if (event && event.state) {
                if (this._onPopStateCb &&
                    typeof this._onPopStateCb === S.FUNCTION) {
                    this._onPopStateCb(event.state);
                }
                // pushSessionStorage here...
            }
        };
    }

    /**
     *  Registers a callback to be executed on window.onpopstate event.
     *  @param {onPopStateCb} fn - Callback to be executed on 'onpopstate' event
     */
    onPopState(fn) {
        onPopStateCallback = fn;
    }

    pushState(state) {
        let url = '';
        history.pushState(state, null, url);
    }


    // _buildUrl(state) {
    //     let url = window.location.pathname;
    //
    //     return url;
    // }

    /**
     *
     * @param param - Querystring parameter to parse object from
     * @param decript - (optional) decript from base64
     * @return {object | boolean} - Returns decoded object or false if no object found
     */
    _getObjectFromUrlParam(param, decript = false) {
        let qs = querystring.parse(location.search);

        if (decript) {
            return (typeof param === STRING &&
                qs &&
                qs[param.toLowerCase()]) ?
                JSON.parse(atob(qs[param.toLowerCase()])) :
                false;
        }
        else return (qs[param.toLowerCase()]) ? qs[param.toLowerCase()] : false;

    }

}