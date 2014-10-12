/**
 * Posts Store
 */

'use strict';

var merge = require('react/lib/merge');
var EventEmitter = require('events').EventEmitter;
var BlogConstants = require('../constants/BlogConstants');
var BlogDispatcher = require('../dispatcher/BlogDispatcher');

var CHANGE_EVENT = 'change_event';
var EMPTY_POST = {};
var _post = EMPTY_POST;

var ContentStore = merge(EventEmitter.prototype, {

    getCurrentPost: function() {
        return _post;
    },

    storeIsReady: function() {
        return _post !== EMPTY_POST;
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    }

});

ContentStore.dispatchToken = BlogDispatcher.register(function(payload) {
    var action = payload.action;

    switch(action.type) {
        case BlogConstants.LOAD_POST:
            _post = EMPTY_POST;
            break;

        case BlogConstants.LOAD_POST_SUCCESS:
            _post = action.data;
            break;

        case BlogConstants.LOAD_POST_FAIL:
            _post = {
                id: action.id,
                error: action.data
            };
            break;

        default:
            return true;
    }

    ContentStore.emitChange();

    return true;
});

module.exports = ContentStore;
