import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

const env = process.env.NODE_ENV;

const config = {
    input: 'src/filterHelper.js',
    output: [
        {
            file: 'dist/umd/butterflyDataFilters.js',
            format: 'umd',
            sourcemap: true,
            name: 'ButterflyDataFilters',
            inlineDynamicImports: true,
            exports: 'auto',
        },
        {
            file: 'dist/esm/index.mjs',
            format: 'esm',
            sourcemap: true,
            name: 'butterflyDataFilters',
            inlineDynamicImports: true,
            exports: 'auto',
        },
    ],
    plugins: [
        babel({
            'babelHelpers': 'runtime',
            'exclude': 'node_modules/**',
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env === 'production' ? 'production' : 'development'),
            'preventAssignment': true,
        }),
    ],
};

export default config;
