/**
 * Base Store
 */

'use strict';

var _ = require('underscore');
var Immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';

function Store() {
    this._store = Immutable.Map({});
}

_.extend(Store.prototype, EventEmitter.prototype, {

    /**
     * Set an array of objects in this store
     * @param  {Object|Object[]} vals New contents
     */
    reset: function(vals) {
        var valsAsMap = _.isArray(vals) ?
            _.object(
                _.pluck(vals, 'id'),
                vals
            ) :
            vals;
        this._store = Immutable.Map(valsAsMap);
        this.emit(CHANGE_EVENT);
    },

    /**
     * Set an object in the store
     * @param {String|Object} id  Identifier, or object with `id` property
     * @param {Object} [val]      Object to store
     */
    set: function(id, val) {
        if (val === undefined) {
            val = id;
            id = val.id;
        }
        this._store = this._store.set(id, val);
        this.emit(CHANGE_EVENT);
    },

    /**
     * Get the object described by the id from the store
     * @param  {String} id Identifier
     * @return {Object}
     */
    get: function(id) {
        return this._store.get(id);
    }

});

Store.CHANGE_EVENT = CHANGE_EVENT;

module.exports = Store;