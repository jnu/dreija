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
var projectRoot = path.resolve(__dirname, '..', '..');
var modules = [];
var projectRootParts = projectRoot.split(path.sep);
var fsRoot = path.parse(projectRoot).root;
var cwd = process.cwd();
var testPath;
do {
    testPath = path.join.apply(projectRootParts.concat('node_modules'));
    if (fs.existsSync(testPath)) {
        modules.push.apply(
            fs.readdirSync(testPath)
        );
    }
} while (projectRootParts.pop());

var externals = modules.reduce(function(hash, dep) {
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
