
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify-es';

export default {
    input: 'demo/index.js',
    name: 'MycomosiEntourageDemo',
    output: {
        file: 'dist/demo.js',
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