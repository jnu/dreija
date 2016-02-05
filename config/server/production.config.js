var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var config = require('common.config');

config.plugins.push(
    new UglifyJsPlugin({
        mangle: {
            except: ['exports', 'module', 'require']
        }
    })
);

module.exports = config;
