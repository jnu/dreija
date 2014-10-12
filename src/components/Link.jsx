/**
 * Custom link component
 *
 * Based on:
 * http://strml.viewdocs.io/react-router-component/recipes/custom-link
 */

'use strict';

var React = require('react');
var Router = require('react-router-component');
var BaseLink = Router.Link;

var Link = React.createClass({

    mixins: [Router.NavigatableMixin],

    isActive: function() {
        return this.getPath() === this.props.href;
    },

    render: function() {
        var cls = this.isActive() ? 'active' : '';
        return this.transferPropsTo(
            <BaseLink className={cls}>{this.props.children}</BaseLink>
        );
    }

});

module.exports = Link;
