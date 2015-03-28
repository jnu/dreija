/**
 * Posts Store
 */

'use strict';

var assign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var BlogConstants = require('../constants/BlogConstants');
var BlogDispatcher = require('../dispatcher/BlogDispatcher');

var CHANGE_EVENT = 'change_event';
var EMPTY_CONTENT = {};
var _content = EMPTY_CONTENT;
var _waiting = false;

var ContentStore = assign({}, EventEmitter.prototype, {

    get: function() {
        return _content;
    },

    isActiveContent: function(id) {
        return _content && _content.id === id;
    },

    isEmpty: function() {
        return _content === EMPTY_CONTENT;
    },

    isExpectingData: function() {
        return _waiting;
    },

    isFullyLoaded: function() {
        return !this.isEmpty() && !this.isExpectingData();
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

    switch (action.type) {
        case BlogConstants.LOAD_PAGE:
            // Allow for pages to set temporary content
            _content = action.data || EMPTY_CONTENT;
            _waiting = true;
            break;

        case BlogConstants.LOAD_PAGE_SUCCESS:
            _content = action.data;
            _waiting = false;
            break;

        case BlogConstants.LOAD_PAGE_FAIL:
            _content = {
                id: action.id,
                error: action.data
            };
            _waiting = false;
            break;

        default:
            return true;
    }

    ContentStore.emitChange();

    return true;
});

module.exports = ContentStore;
