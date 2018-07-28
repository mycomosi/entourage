/**
 *  Historian keeps track of browser history
 *  Inspired and heavily influenced by Ronan
 */


import * as S from "./Strings";
const STRING = 'string';


export class Historian {
    constructor(configuration, querystring) {

        this.qs = querystring;
        this.onPopStateCallback = null;

        window.onpopstate = (event) => {
            if (event && event.state) {
                if (this.onPopStateCallback &&
                    typeof this.onPopStateCallback === S.FUNCTION) {
                    this.onPopStateCallback(event.state);
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
        this.onPopStateCallback = fn;

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
        let qs = this.qs.parse(window.location.search);

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
