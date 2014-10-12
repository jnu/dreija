/**
 * Blog client
 */

'use strict';

var cache = require('./cache');
var reqwest;
if (typeof window !== 'undefined') {
    reqwest = require('reqwest');
}

var version = 'v1';

function getByIdURL(base, id) {
    return ['', version, base, id].join('/');
}

function defer(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    setTimeout(function() {
        fn.apply(null, args);
    }, 0);
}

var BlogClient = {

    /**
     * Check if a post is fully loaded locally
     * @param  {String} id Post ID
     * @return {Boolean}   Whether post is loaded
     */
    postIsFullyLoaded: function(id) {
        var p = cache.get(id, false);
        return !!p && ('title' in p) && ('content' in p);
    },

    /**
     * Get a post by ID. Caches internally. If callbacks are provided, function
     * will execute asynchronously, otherwise it will return immediately.
     * @param  {String}   id      Post ID
     * @param  {Function} [success] Success callback
     * @param  {Function} [fail]    Error callback
     */
    getPostById: function(id, success, fail) {
        var url = getByIdURL('post', id);
        fail = fail || function() {};

        var empty = {};
        var content = cache.get(url, empty);

        if (success) {
            if (content !== empty) {
                defer(success, content);
            } else if (reqwest) {
                reqwest({
                    url: url,
                    type: 'json',
                    success: function(resp) {
                        cache.set(url, resp);
                        success(resp);
                    },
                    error: fail
                });
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(
                        "Don't know how to access `" + url + "` in this " +
                        "environment."
                    );
                }
                fail({ content: "Can't access post `" + id + "`" });
            }
        } else {
            return content;
        }
    },

    /**
     * Preload data into the cache.
     * @param  {String} url  URL that would return the provided data
     * @param  {Object} data Data to cache
     */
    preload: function(url, data) {
        var key = '/' + version + url;
        cache.set(key, data);
    },

    /**
     * Preload post data into the cache. Delegates to #preload.
     * @param  {String} id   Post ID
     * @param  {Object} data Post data
     */
    preloadPost: function(id, data) {
        this.preload('/post/' + id, data);
    },

    /**
     * Clear the local cache
     */
    clearCache: function() {
        cache.clear();
    }

};

module.exports = BlogClient;
