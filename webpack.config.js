/**
 * Load webpack config for the given environment (default development).
 */
var env = process.env.NODE_ENV || 'development';

module.exports = require('./config/' + env + '.config');