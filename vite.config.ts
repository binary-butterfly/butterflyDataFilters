import {defineConfig} from 'vite';
import {resolve} from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: './tsconfig.json',
            outDir: 'dist',
            exclude: ['**/__tests__/**'],
            entryRoot: 'src',
        }),
    ],
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, 'src/filterHelper.ts'),
            name: 'ButterflyDataFilters',
            fileName: (format) => format === 'es' ? 'index.mjs' : 'butterflyDataFilters.js',
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                exports: 'named',
                preserveModules: false,
            },
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV === 'production' ? 'production' : 'development'),
        'preventAssignment': true,
    },
});
