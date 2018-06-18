


const StorageWorker = {

    _start: () => {

        postalSharedWorker.on(
            'entourage-storage', (msg, src) => {
                console.info(msg);
            }
        );
    }
};

StorageWorker._start();