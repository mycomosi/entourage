/**
 * Demo of Entourage Runtime Assembly
 * @Author Russ Stratfull
 */

import {Entourage} from '../dist/Entourage.es';

window.demo = new Entourage({

    // Assembly details...
    assembly: {

        // Before authorization is resolved
        start: [
            {
                type: 'dictionary',
                key: 'i18n',
                path: 'json/lang.json'
            },
            {
                type: 'dictionary',
                key: 'theme',
                path: 'json/theme.json'
            }
        ],

        // Used to to hook in before oauth redirects
        unauthorized: [
            // {
            //     type: 'js',
            //     path: 'lib/goldenlayout.js'
            // },
            {
                type: 'css',
                path: 'css/sheet1.css'
            }
        ],

        // Load the dependencies needed after authorization
        authorized: [
            // {
            //     type: 'js',
            //     path: 'lib/goldenlayout.js'
            // }
        ]
    },

    // Authorization details...
    credentials: {
        type: 'oauth',
        configuration: {

        }
    },

    // Postal communication details...
    postal: {
        PostalRoute: 'lib/', // todo: @Russ - Make this not static!!!
        worker: {
            assembly: {}
        }
    },


    historian: {

    },

    logger: {
        // all: true
        log: false,
        info: true,
        warn: true,
        error: true,
        debug: false,
        cc: [] // Send copies to other places
    },

    storage: {
        
    }
});

