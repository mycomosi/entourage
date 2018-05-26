/**
 * Demo of Entourage Runtime Assembly
 * @Author Russ Stratfull
 */
import {Entourage} from '../dist/Entourage.es';

// Demos...
import {historian} from './historian';
import {logger} from './logger';
import {postalworker} from "./postalworker";
import {securitymanager} from "./securitymanager";
import {storagemanager} from "./storagemanager";
import {translator} from "./translator";
const
    ENTOURAGE_DEMO = 'entourage-demo',
    HISTORIAN = 'historian',
    LOGGER = 'logger',
    POSTALWORKER = 'postalworker',
    SECURITYMANAGER = 'securitymanager',
    STORAGEMANAGER = 'storagemanager',
    TRANSLATOR = 'translator',

    NAME = 'name';
let demos = new Map();
demos // Map all the demos to their keys
    .set(HISTORIAN, historian)
    .set(LOGGER, logger)
    .set(POSTALWORKER, postalworker)
    .set(SECURITYMANAGER, securitymanager)
    .set(STORAGEMANAGER, storagemanager)
    .set(TRANSLATOR, translator);

// Show demo for each cast member
let _showMember = (member) => {
        let m = demos.get(member);
        let prev = document.querySelector(ENTOURAGE_DEMO);
        if (prev) {
            document.body.removeChild(prev);
        }
        let demowc = document.createElement(ENTOURAGE_DEMO);
        demowc.setAttribute(NAME, member);
        document.body.appendChild(demowc);
        let show = document.querySelector(ENTOURAGE_DEMO);
        show.innerHTML = `
    <h1>${m.name}</h1>
    <h2>${m.subtext}</h2>
    <div class="demo-content">${m.content || ''}</div>
    `;
    },
    createWebComponent = (demos) => {
        return class EntourageDemo extends HTMLElement {
            constructor() {
                super();
                this._init();
            }
            createdCallback() {
                this._init();
            }
            _init() {
                this.demos = demos;
            }
            attachedCallback() {
                if (this.getAttribute(NAME) &&
                    this.demos.get(this.getAttribute(NAME)).init) {
                    this.demos.get(this.getAttribute(NAME)).init(this);
                }
            }
            detachedCallback() {
                if (this.getAttribute(NAME) &&
                    this.demos.get(this.getAttribute(NAME)).end) {
                    this.demos.get(this.getAttribute(NAME)).end(this);
                }
            }
        }
    };

document.registerElement(ENTOURAGE_DEMO, createWebComponent(demos));

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
        info: false,
        warn: true,
        error: true,
        debug: false,
        cc: [] // Send copies to other places
    },

    storage: {

    }
});

window.onload = () => {
    let links = document.querySelectorAll('a.cast');
    for (let link of links) {
        link.onclick = () => {

            // Demo - log menu clicks to demonstrate logging capabilities
            window.console.info(`Menu Click: ${link.hash.replace(/#/, '')}`);

            // Demo - toggle display of demos
            _showMember(link.hash.replace(/#/, ''));

            return false;
        };
    }
};
