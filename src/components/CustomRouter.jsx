/**
 * Custom router
 */

'use strict';

var React = require('react');
var Router = require('react-router-component');
var Layout = require('./Layout');
var assign = require('react/lib/Object.assign');

/**
 * Create a router component
 */
var Pages = React.createClass({

    mixins: [Router.RouterMixin, Router.AsyncRouteRenderingMixin],

    getRoutes: function(props) {
        return props.children;
    },

    getDefaultProps: function() {
        return {
            component: Layout
        };
    },

    render: function() {
        // Render the Route's handler
        var handler = this.renderRouteHandler({

        });
        // Pass down props (sans component), with the activated path
        var props = assign(
            { activePath: this.getEnvironment().getPath() },
            this.props
        );
        delete props.component;
        return React.createElement(this.props.component, props, handler);
    }
});

/**
 * Export the same sort of package of goodies the original component does
 */
module.exports = {
    Pages: Pages,
    Page: Router.Page,
    NotFound: Router.NotFound
};
