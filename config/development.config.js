var config = require('./common.config');

config.output.filename = '[name].js';
config.debug = true;
config.devtool = 'source-map';

module.exports = config;
