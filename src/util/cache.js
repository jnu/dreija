/**
 * Simple key-value cache for the blog
 */

'use strict';


// TODO: Use local storage? More performant structure?
var _cache = {};

var Cache = {

    /**
     * Get value from cache. Optionally return default value.
     * @param  {String} id       ID of object to retrieve
     * @param  {mixed}  default_ Value to present if object is not present
     * @return {mixed}           Value, or fallback value
     */
    get: function(id, default_) {
        return _cache[id] || default_;
    },

    /**
     * Set the key to the given value. Overwrites existing values.
     * @param {String} id  Key of item to set
     * @param {mixed}  val Item to set
     */
    set: function(id, val) {
        _cache[id] = val;
    },

    /**
     * Clear the cache
     */
    clear: function() {
        _cache = {};
    }

};

if (process.env.NODE_ENV !== 'production') {
    Cache._cache = _cache;
}

module.exports = Cache;
