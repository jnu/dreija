/**
 * Flux actions
 */

'use strict';

var BlogConstants = require('../constants/BlogConstants');
var BlogDispatcher = require('../dispatcher/BlogDispatcher');
var BlogClient = require('../util/BlogClient');
var defer = require('../util/defer');
var logger = require('../util/logger');


/**
 * Create an action that can execute asynchronously.
 * @param  {Function} loader    Function to load content. Should be able to
 *                              execute sync or async polymorphically. It should
 *                              take three args: id, a success / fail callbacks.
 *                              If success (and fail) are not provided, the
 *                              synchronous version should run, otherwise the
 *                              async version should run.
 * @param  {Function} [checker] Function that takes an id and returns whether
 *                              the async version of loader needs to run.
 * @param  {Object}   [ctx]     Execution context for loader / checker.
 * @return {Function}           Async action
 */
function asyncActionFactory(loader, checker, ctx) {
    if (!checker) {
        checker = function() { return false; };
    }

    // bind to context if it was provided
    if (ctx) {
        loader = loader.bind(ctx);
        checker = checker.bind(ctx);
    }

    /**
     * Asynchronous action
     * @param  {String} id Content identifier
     */
    return function asyncAction(id) {
        // Fill in post immediately, even though it might not be available
        BlogDispatcher.handleViewAction({
            type: BlogConstants.LOAD_PAGE,
            id: id,
            data: null
        });

        // Execute asynchronously
        if (!checker(id)) {
            loader(
                id,
                function(data) {
                    BlogDispatcher.handleServerAction({
                        type: BlogConstants.LOAD_PAGE_SUCCESS,
                        id: id,
                        data: data
                    });
                },
                function(err) {
                    BlogDispatcher.handleServerAction({
                        type: BlogConstants.LOAD_PAGE_FAIL,
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
                    type: BlogConstants.LOAD_PAGE_SUCCESS,
                    id: id,
                    data: loader(id)
                }
            );
        }
    };
}

/**
 * Create a preloading action
 * @param  {Function} preload Function to execute to preload
 * @param  {Object}   [ctx]   Context to execute preloader in
 * @return {Function}         Preload action
 */
function preloadActionFactory(preload, ctx) {
    if (ctx) {
        preload = preload.bind(ctx);
    }

    /**
     * Action to preload data
     * @param  {String} id   Content identifier
     * @param  {mixed}  data Content
     */
    return function preloadAction(id, data) {
        preload(id, data);
        BlogDispatcher.handleServerAction({
            type: BlogConstants.LOAD_PAGE_SUCCESS,
            id: id,
            data: data
        });
    };
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// BlogActions
//
// Object for keeping reference to actions
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * @typedef ActionSpec
 * @property {String} action Action name
 * @property {mixed[]} args  Arguments to call action with
 */

/**
 * Blog action registry
 * @type {Object}
 */
var BlogActions = {

    /**
     * Invoke the given action
     * @param  {String|ActionSpec} action Blog action
     * @param  {mixed...} [args]          Parameters to action
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
            logger.trace('Invoking action `' + action + '`');
            if (!BlogActions.hasOwnProperty(action)) {
                throw new Error("Unknown action: " + action);
            }
        }

        BlogActions[action].apply(this, args);
    }

};


/**
 * Register a new action
 * @private
 * @param  {String}   key Action identifier
 * @param  {Function} fn  Action
 */
function registerAction(key, fn) {
    var action = fn;

    if (process.env.NODE_ENV !== 'production') {
        if (BlogActions.hasOwnProperty(key)) {
            throw new Error("Tried to re-register action '" + key + "'");
        }

        action = function _actionDebugWrapper() {
            logger.debug('Executing action `' + key + '` with ', arguments);
            return fn.apply(this, arguments);
        };
    }

    BlogActions[key] = action;
}

if (process.env.NODE_ENV !== 'production') {
    BlogActions._register = registerAction;
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Actions
//
// Define and register specific actions here
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Preload data for the given post
 * @param  {String} id   Post ID
 * @param  {Object} data Post data
 */
registerAction(
    BlogConstants.actions.PRELOAD_POST,
    preloadActionFactory(
        BlogClient.preloadPost,
        BlogClient
    )
);

/**
 * Load a post by id
 * @param  {String} id Post id
 */
registerAction(
    BlogConstants.actions.LOAD_POST,
    asyncActionFactory(
        BlogClient.getPostById,
        BlogClient.postIsFullyLoaded,
        BlogClient
    )
);

/**
 * Preload a static page
 * @param  {String} id   Content ID
 * @param  {Object} data Content
 */
registerAction(
    BlogConstants.actions.PRELOAD_STATIC_PAGE,
    preloadActionFactory(
        BlogClient.preloadStaticPage,
        BlogClient
    )
);

/**
 * Load a static page
 * @param {String} id Content ID
 */
registerAction(
    BlogConstants.actions.LOAD_STATIC_PAGE,
    asyncActionFactory(
        BlogClient.getStaticPage,
        BlogClient.staticPageIsFullyLoaded,
        BlogClient
    )
);


module.exports = BlogActions;
