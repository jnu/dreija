/**
 * Posts Store
 */

var _ = require('underscore');
var ActiveStore = require('./ActiveStore');
var APIClient = require('../util/APIClient');

var PostStore = _.extend(new ActiveStore(), {

    getURL: APIClient.getByIdUrl.bind(null, 'post'),

    name: 'PostStore'

});

module.exports = PostStore;