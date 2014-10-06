/**
 * App entry point
 */
/* jshint browser: true */

'use strict';

var React = require('react');
var BlogActions = require('./actions/BlogActions');
// XXX: need to include here so browserify bundles dependencies. Is there a
// better way of doing this?
require('./components/Router');

var Blog = {

    start: function(action) {
        if (action) {
            action = Array.isArray(action) ? action : [action];
            action.forEach(function(a) {
                BlogActions.invoke(a);
            });
        }
        var rootNodes = document.querySelectorAll('[data-react-class]');

        Array.prototype.map.call(rootNodes, function(node) {
            var cls = node.getAttribute('data-react-class');
            var strProps = node.getAttribute('data-react-props');
            var props = strProps && JSON.parse(strProps);
            var Cmp = require('./components/' + cls);

            React.renderComponent(Cmp(props), node);
        });
    }

};

// Expose some stuff in debug mode
if (process.env.NODE_ENV !== 'production') {
    global.React = React;
    Blog._client = require('./util/BlogClient');
    Blog._PostStore = require('./stores/PostStore');
} else {
    console.log(
        "Welcome! The full, unminified source of this page is availble at: " +
        "https://github.com/jnu/blogmachine"
    );
}

module.exports = Blog;