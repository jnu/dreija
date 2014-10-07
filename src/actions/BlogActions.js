/**
 * Flux actions
 */

'use strict';

var BlogConstants = require('../constants/BlogConstants');
var BlogDispatcher = require('../dispatcher/BlogDispatcher');
var BlogClient = require('../util/BlogClient');
var defer = require('../util/defer');

/**
 * @typedef Action
 * @property {String} action Action name
 * @property {mixed[]} args  Arguments to call action with
 */

var BlogActions = {

    /**
     * Invoke the given action
     * @param  {String|Action} action Blog action
     * @param  {mixed...} [args]      Parameters to action
     */
    invoke: function(action) {
        var args;
        if (typeof action !== 'string') {
            args = action.args;
            action = action.action;
        } else {
            args = Array.prototype.slice.call(arguments, 1);
        }

        if (process.env.NODE_ENV !== 'production') {
            if (!BlogActions.hasOwnProperty(action)) {
                throw new Error("Unknown action: " + action);
            }
        }

        BlogActions[action].apply(this, args);
    }

};


/**
 * Preload data for the given post
 * @param  {String} id   Post ID
 * @param  {Object} data Post data
 */
BlogActions[BlogConstants.actions.PRELOAD_POST] = function(id, data) {
    BlogClient.preloadPost(id, data);
    BlogDispatcher.handleServerAction({
        type: BlogConstants.LOAD_POST,
        id: id,
        data: data
    });
};

/**
 * Load a post by id
 * @param  {String} id Post id
 */
BlogActions[BlogConstants.actions.LOAD_POST] = function(id) {
    // Fill in post immediately, even though it might not be available
    BlogDispatcher.handleViewAction({
        type: BlogConstants.LOAD_POST,
        id: id,
        data: null
    });

    // Execute server request if post needs to update
    if (!BlogClient.postIsFullyLoaded(id)) {
        BlogClient.getPostById(
            id,
            function(data) {
                BlogDispatcher.handleServerAction({
                    type: BlogConstants.LOAD_POST_SUCCESS,
                    id: id,
                    data: data
                });
            },
            function(err) {
                BlogDispatcher.handleServerAction({
                    type: BlogConstants.LOAD_POST_FAIL,
                    id: id,
                    data: err
                });
            }
        );
    }
    // Otherwise update post store from local cache
    else {
        defer.call(
            BlogDispatcher,
            BlogDispatcher.handleViewAction,
            {
                type: BlogConstants.LOAD_POST_SUCCESS,
                id: id,
                data: BlogClient.getPostById(id)
            }
        );
    }
};

module.exports = BlogActions;
