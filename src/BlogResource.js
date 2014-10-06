/**
 * Blog API
 */

'use strict';

var Promise = require('bluebird').Promise;
var BlogConstants = require('./constants/BlogConstants');
var sleep = require('sleep');

var BlogResource = {

    getPostById: function() {
        var id = this.params.id;
        return new Promise(function(resolve) {
            var data= {
                id: id,
                title: "title: " + id,
                content: "bla bla bla"
            };
            sleep.sleep(1);
            resolve({
                action: BlogConstants.actions.PRELOAD_POST,
                args: [id, data]
            });
        });
    },

    getPostByCategory: function() {
        var cat = this.params.id;
        return new Promise(function(resolve) {
            var data = {
                id: 'foo-id',
                title: "Post in category: " + cat,
                content: "bla bla bla bla bla"
            };

            resolve({
                action: BlogConstants.actions.PRELOAD_POST,
                args: ['foo-id',  data]
            });
        });
    }

};

module.exports = BlogResource;