/**
 * Blog API
 */

'use strict';

var Promise = require('bluebird').Promise;

var BlogResource = {

    getPostById: function() {
        var id = this.params.id;
        return new Promise(function(resolve) {
            resolve({
                id: id,
                title: "title: " + id,
                content: "bla bla bla"
            });
        });
    },

    getPostByCategory: function() {
        var cat = this.params.id;
        return new Promise(function(resolve) {
            resolve({
                id: 'foo-id',
                title: "Post in category: " + cat,
                content: "bla bla bla bla bla"
            });
        });
    }

};

module.exports = BlogResource;