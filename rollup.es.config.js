
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
//import uglify from 'rollup-plugin-uglify-es';

export default {
    input: 'src/es6/Entourage.js',
    name: 'Entourage',
    output: {
        file: 'dist/Entourage.es.js',
        format: 'es',
        sourcemap: false
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs()
    ]

};