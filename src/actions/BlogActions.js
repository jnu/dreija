/**
 * Flux actions
 */

'use strict';

var BlogConstants = require('../constants/BlogConstants');
var BlogDispatcher = require('../dispatcher/BlogDispatcher');
var BlogClient = require('../util/BlogClient');

var BlogActions = {

    /**
     * Load a post by id
     * @param  {String} id Post id
     */
    loadPost: function(id) {
        // Fill in post immediately, even though it might not be available
        BlogDispatcher.handleViewAction({
            type: BlogConstants.LOAD_POST,
            id: id,
            data: BlogClient.getPostById(id)
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
    }

};

module.exports = BlogActions;