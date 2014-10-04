/**
 * App entry point
 */
/* jshint browser: true */

'use strict';

var React = require('react');
var PostStore = require('./stores/PostStore');
// XXX: need to include here so browserify bundles dependencies. Is there a
// better way of doing this?
require('./components/Router');

module.exports = {

    _cmp: [],

    _stores: {
        'PostStore': PostStore
    },

    start: function() {
        var rootNodes = document.querySelectorAll('[data-react-class]');

        this._cmp = Array.prototype.map.call(rootNodes, function(node) {
            var cls = node.getAttribute('data-react-class');
            var strProps = node.getAttribute('data-react-props');
            var props = JSON.parse(strProps);
            var path = './components/' + cls;
            var Cmp = require(path.replace('/./', '/'));

            var activeCmp = Cmp(props);

            React.renderComponent(activeCmp, node);

            return activeCmp;
        });
    }


};

// Expose some stuff in require mode
if (process.env.NODE_ENV !== 'production') {
    global.React = React;
    global.ajax = require('./util/ajax');
} else {
    console.log(
        "Welcome! The full, unminified source of this page is availble at: " +
        "https://github.com/jnu/blogmachine"
    );
}