/**
 * Blog Dispatcher
 */

'use strict';

var assign = require('react/lib/Object.assign');
var Dispatcher = require('flux').Dispatcher;

var VIEW_ACTION = 'view_action';
var SERVER_ACTION = 'server_action';

var BlogDispatcher = assign(new Dispatcher(), {

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
