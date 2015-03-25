/**
 * Blog API
 */

'use strict';

var Promise = require('bluebird').Promise;
var showdown = require('showdown');

var BlogResource = {

    getPostById: function() {
        var id = this.params.id;
        return new Promise(function(resolve) {
            resolve({
                id: id,
                title: "",
                content: "not implemented"
            });
        });
    },

    getPostByCategory: function() {
        var cat = this.params.id;
        return new Promise(function(resolve) {
            resolve({
                id: cat,
                title: "",
                content: "definitely not implemented"
            });
        });
    },

    getStaticPage: function() {
        var id = this.params.id;
        return new Promise(function(resolve) {
            resolve({
                id: id,
                title: "",
                content: "not implemented"
            });
        });
    }

};

if (process.env.NODE_ENV !== 'production') {
    BlogResource._stub = require('./BlogResourceStub');
}

module.exports = BlogResource;
