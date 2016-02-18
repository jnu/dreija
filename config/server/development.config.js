var config = require('./common.config');
var NodemonPlugin = require('../../lib/webpack/NodemonWebpackPlugin');

config.plugins.push(
    new NodemonPlugin()
);

config.debug = true;

module.exports = config;
