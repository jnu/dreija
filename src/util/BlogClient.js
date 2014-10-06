/**
 * Blog client
 */

'use strict';

var reqwest;
if (typeof window !== 'undefined') {
    reqwest = require('reqwest');
}

// XXX: Could use a more performant structure
var _local = {};
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
        var p = _local[id];
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

        if (success) {
            if (_local[url]) {
                defer(success, _local[url]);
            } else if (reqwest) {
                reqwest({
                    url: url,
                    type: 'json',
                    success: function(resp) {
                        // XXX: Caching should be done by listening to dispatcher LOAD_SUCCESS action?
                        _local[url] = resp;
                        success(_local);
                    },
                    error: fail
                });
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(
                        "Don't know how to access `" + url + "` in this " +
                        "environment. " + JSON.stringify(_local)
                    );
                }
                fail({ content: "Can't access post `" + id + "`" });
            }
        } else {
            return _local[url] || {};
        }
    },

    /**
     * Preload data into the cache.
     * @param  {String} url  URL that would return the provided data
     * @param  {Object} data Data to cache
     */
    preload: function(url, data) {
        _local['/' + version + url] = data;
    },

    preloadPost: function(id, data) {
        this.preload('/post/' + id, data);
    },

    /**
     * Clear the local cache
     */
    clearCache: function() {
        _local = {};
    }

};

if (process.env.NODE_ENV !== 'production') {
    BlogClient._local = _local;
}

module.exports = BlogClient;