
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify-es';

export default {
    input: 'demo/src/StorageWorker.js',
    name: 'StorageWorker',
    output: {
        file: 'demo/lib/StorageWorker.js',
        format: 'iife',
        sourcemap: false
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
        uglify()
    ]

};