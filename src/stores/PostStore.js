/**
 * Posts Store
 */

'use strict';

var merge = require('react/lib/merge');
var EventEmitter = require('node-event-emitter').EventEmitter;
var BlogConstants = require('../constants/BlogConstants');
var BlogDispatcher = require('../dispatcher/BlogDispatcher');

var CHANGE_EVENT = 'change_event';
var _post = {};

var PostStore = merge(EventEmitter.prototype, {

    getCurrentPost: function() {
        return _post;
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

PostStore.dispatchToken = BlogDispatcher.register(function(payload) {
    var action = payload.action;

    switch(action.type) {
        case BlogConstants.LOAD_POST:
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

    PostStore.emitChange();

    return true;
});

module.exports = PostStore;