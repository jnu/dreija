var config = require('./common.config');
var CompressionPlugin = require('compression-webpack-plugin');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

config.output.filename = '[name]-[hash].js';
config.debug = false;
config.plugins = config.plugins.concat([

    new UglifyJsPlugin({
        mangle: {
            except: ['exports', 'require']
        }
    }),

    new CompressionPlugin({
        asset: '{file}.gz',
        algorithm: 'gzip',
        minRatio: 0.8
    })

]);

module.exports = config;