var path = require('path');
var fs = require('fs');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');


const APP_ROOT = path.resolve(__dirname, '..', 'src', 'server');

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
        fallback: path.resolve(__dirname, '..', 'src', 'shared'),
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
        path: path.resolve(__dirname, '..', 'dist'),
        filename: '[name].js'
    },

    plugins: [

        new DefinePlugin({
            'process.env': {
                NODE_ENV: process.env.NODE_ENV
            }
        }),

        new UglifyJsPlugin({
            mangle: {
                except: ['exports', 'module', 'require']
            }
        })

    ],

    externals: externals

};

module.exports = config;
