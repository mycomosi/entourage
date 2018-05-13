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
            console.info(`[${src.index}] [${src.address}] [${msg.logLevel}] ${logMessage}`);
        });
    }
};

logWorker.init();