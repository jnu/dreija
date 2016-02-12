var path = require('path');
var fs = require('fs');
var DefinePlugin = require('webpack/lib/DefinePlugin');
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
        root: APP_ROOT,
        extensions: ['', '.js', '.jsx']
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel'
            }
        ],
        noParse: [/node_modules[\/\\]tracer/]
    },

    output: {
        path: path.resolve(__dirname, '..', '..', 'dist'),
        publicPath: 'dist/',
        filename: '[name].js'
    },

    plugins: [

        new DefinePlugin({
            'process.env': {
                NODE_ENV: process.env.NODE_ENV
            }
        }),

        // Use banner plugin to inject source map support
        new BannerPlugin(
            'require("source-map-support").install();',
            { raw: true, entryOnly: false }
        )

    ],

    devtool: 'source-map',

    externals: externals

};

module.exports = config;
