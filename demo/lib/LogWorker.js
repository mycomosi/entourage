/**
 * Create a logging manager for multiple windows by subscribing to broadcast notifications from entourage logger
 * @type {{init: function()}}
 */


let logWorker = {
    init: () => {
        postalSharedWorker.on('entourage-logger', (msg, src) => {

            let logMessage = (typeof msg.logMessage === "object") ?
                JSON.stringify(msg.logMessage) :
                msg.logMessage;

            // Example of a log message that is converted to readable form:
            // (logs by provided "type" - info, debug, error, etc...)
            let lvl;
            switch (msg.logLevel) {
                case 'log':
                    lvl = console.log;
                    break;
                case 'info':
                    lvl = console.info;
                    break;
                case 'warn':
                    lvl = console.warn;
                    break;
                case 'error':
                    lvl = console.error;
                    break;
                case 'debug':
                    lvl = console.debug;
                    break;
            }
            lvl(`[${src.index}] [${src.address}] [${msg.logLevel}] ${logMessage}`);
        });
    }
};

logWorker.init();