/**
 * Webpack config shared by client-side dev and prod bundles
 */
var path = require('path');
var deepMerge = require('../../lib/deepMerge');
var sharedConfig = require('../shared/shared.config');


const APP_ROOT = path.resolve(__dirname, '..', '..', 'src', 'client');

var config = {

    context: APP_ROOT,

    entry: {
        client: ['./index.js']
    },

    output: {
        path: path.resolve(__dirname, '..', '..', 'dist', 'public'),
        library: 'JN',
        libraryTarget: 'var'
    },

    resolve: {
        root: APP_ROOT
    },

    module: {
        loaders: [
            {
                test: /\.less$/,
                exclude: /node_modules[\.\\](?!dreija)/,
                loaders: ['style', 'css', 'less']
            }
        ]
    }

};

module.exports = deepMerge({}, sharedConfig, config);
