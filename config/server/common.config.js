/**
 * Webpack config shared by server-side dev and prod bundles
 */
var path = require('path');
var fs = require('fs');
var deepMerge = require('../../lib/deepMerge');
var sharedConfig = require('../shared/shared.config');
var BannerPlugin = require('webpack/lib/BannerPlugin');


var APP_ROOT = path.resolve(__dirname, '..', '..', 'src', 'server');

// Use CommonJS requires for node modules. Everything else will be bundled.
var localNodeModulesDir = path.resolve(__dirname, '..', '..', 'node_modules');
var localNodeModules = fs.readdirSync(localNodeModulesDir);
// TODO(jnu) this should eventually search all `node_modules` for all parent directories
var projectNodeModulesDir = path.resolve(__dirname, '..', '..', 'node_modules');
var projectNodeModules = fs.readdirSync(projectNodeModulesDir);
var externals = fs.readdirSync(nodeModules.concat(projectNodeModules))
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
        server: './server.js'
    },

    resolve: {
        root: APP_ROOT
    },

    module: {
        loaders: [
            {
                test: /\.less$/,
                exclude: /node_modules[\.\\](?!dreija)/,
                loaders: ['css', 'less']
            }
        ]
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
