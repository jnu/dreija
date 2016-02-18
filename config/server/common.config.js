/**
 * Webpack config shared by server-side dev and prod bundles
 */
var path = require('path');
var fs = require('fs');
var deepMerge = require('../../lib/deepMerge');
var sharedConfig = require('../shared/shared.config');
var BannerPlugin = require('webpack/lib/BannerPlugin');


const APP_ROOT = path.resolve(__dirname, '..', '..', 'src', 'server');

// Use CommonJS requires for node modules. Everything else will be bundled.
const externals = fs.readdirSync('node_modules')
    .reduce(function(hash, dep) {
        if (['.bin'].indexOf(dep) === -1) {
            hash[dep] = 'commonjs ' + dep;
        }
        return hash;
    }, {});


var config = {

    context: APP_ROOT,

    target: 'node',

    entry: {
        server: './app.js'
    },

    resolve: {
        root: APP_ROOT
    },

    output: {
        path: path.resolve(__dirname, '..', '..', 'dist'),
        filename: '[name].js'
    },

    plugins: [

        // Use banner plugin to inject source map support
        new BannerPlugin(
            'require("source-map-support").install();',
            { raw: true, entryOnly: false }
        )

    ],

    devtool: 'source-map',

    externals: externals

};

module.exports = deepMerge({}, sharedConfig, config);
