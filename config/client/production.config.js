var config = require('./common.config');
var CompressionPlugin = require('compression-webpack-plugin');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

// Use chunkhash so the same file can be produced in different locations.
config.output.filename = `[name]-[chunkhash].js`;
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
