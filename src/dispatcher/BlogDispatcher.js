/**
 * Blog Dispatcher
 */

'use strict';

var copyProperties = require('react/lib/copyProperties');
var Dispatcher = require('flux').Dispatcher;

var VIEW_ACTION = 'view_action';
var SERVER_ACTION = 'server_action';

var BlogDispatcher = copyProperties(new Dispatcher(), {

    handleViewAction: function(action) {
        this.dispatch({
            source: VIEW_ACTION,
            action: action
        });
    },

    handleServerAction: function(action) {
        this.dispatch({
            source: SERVER_ACTION,
            action: action
        });
    }

});

module.exports = BlogDispatcher;