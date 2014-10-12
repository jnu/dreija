/**
 * Blog client
 */

'use strict';

var cache = require('./cache');
var defer = require('./defer');
var reqwest;
if (typeof window !== 'undefined') {
    reqwest = require('reqwest');
}

var version = 'v1';

function getByIdURL(base, id) {
    return ['', version, base, id].join('/');
}


function asyncAccessorFactory(getUrl, ctx) {
    // Use identity function if url generator was not passed
    if (!getUrl) {
        getUrl = function identity() {};
    }

    // Bind to context if it was passed
    if (ctx) {
        getUrl = getUrl.bind(ctx);
    }

    /**
     * Access remote content. Execute asynchronously if success callback was
     * not passed, otherwise execute synchronously.
     * @param  {String}   id        Content identifier
     * @param  {Function} [success] Success callback
     * @param  {Function} [fail]    Fail callback
     * @return {mixed|undefined}    Content in synchronous path, else undefined
     */
    return function asyncAccessor(id, success, fail) {
        var url = getUrl(id);
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
                fail({ content: "Can't access content at `" + url + "`" });
            }
        } else {
            return content;
        }
    };

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
     * Check whether static page is fully loaded
     * @param  {String} id Page identifier
     * @return {Boolean}   Whether page is loaded
     */
    staticPageIsFullyLoaded: function(id) {
        var p = cache.get(id, false);
        return !!p;
    },

    /**
     * Get a post by ID.
     * @param  {String}   id        Post ID
     * @param  {Function} [success] Success callback
     * @param  {Function} [fail]    Error callback
     */
    getPostById: asyncAccessorFactory(getByIdURL.bind(null, 'post')),

    /**
     * Get a static page.
     * @param  {String}   id        Page ID
     * @param  {Function} [success] Success callback
     * @param  {Function} [fail]    Error callback
     */
    getStaticPage: asyncAccessorFactory(getByIdURL.bind(null, 'static')),

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
     * Preload static page
     * @param  {String} id   Page ID
     * @param  {Object} data Page data
     */
    preloadStaticPage: function(id, data) {
        this.preload('/static/' + id, data);
    },

    /**
     * Clear the local cache
     */
    clearCache: function() {
        cache.clear();
    }

};

module.exports = BlogClient;
