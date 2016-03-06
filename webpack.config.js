/**
 * Load webpack config for the given environment (default development).
 */
/* eslint-env node */

var env = process.env.NODE_ENV || 'development';

var clientBundleConfig = require('./config/client/' + env + '.config');
var serverBundleConfig = require('./config/server/' + env + '.config');

module.exports = [
    clientBundleConfig,
    serverBundleConfig
];
