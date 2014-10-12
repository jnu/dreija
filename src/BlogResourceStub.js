/**
 * Stub API loader
 */

'use strict';

var Promise = require('bluebird').Promise;
var sleep = require('sleep');

var BlogResourceStub = {

    getPostById: function() {
        var id = this.params.id;
        return new Promise(function(resolve) {
            sleep.sleep(1);
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
    },

    getStaticPage: function() {
        var id = this.params.id;
        return new Promise(function(resolve) {
            sleep.sleep(1);
            resolve({
                id: id,
                title: "Static Page: " + id,
                content: "Glory me I'm loadin " + id
            });
        });
    }

};

module.exports = BlogResourceStub;
