import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const env = process.env.NODE_ENV;

const config = {
    input: 'src/filterHelper.ts',
    output: [
        {
            file: 'dist/umd/butterflyDataFilters.js',
            format: 'umd',
            sourcemap: true,
            name: 'ButterflyDataFilters',
            inlineDynamicImports: true,
            exports: 'named',
        },
        {
            file: 'dist/esm/index.mjs',
            format: 'esm',
            sourcemap: true,
            name: 'butterflyDataFilters',
            inlineDynamicImports: true,
            exports: 'named',
        },
    ],
    plugins: [
        babel({
            'babelHelpers': 'runtime',
            'exclude': 'node_modules/**',
        }),
        typescript({tsconfig: './tsconfig.json'}),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env === 'production' ? 'production' : 'development'),
            'preventAssignment': true,
        }),
    ],
};

export default config;
