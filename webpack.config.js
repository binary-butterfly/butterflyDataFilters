const webpack = require('webpack');
const path = require('path');

module.exports = (env, argv) => {
    console.log(path.join(__dirname + '/dist'));
    return {
        target: 'web',
        entry: './src/filterHelper.js',
        output: {
            path: path.join(__dirname + '/dist'),
            filename: 'filterHelper.js',
            library: 'ButterflyFilterHelper',
            libraryTarget: 'umd',
            globalObject: 'this',
            umdNamedDefine: true,
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            ],
        },
    };
};
