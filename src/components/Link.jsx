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

    render: function() {
        // XXX why doesn't this.getPath() work correctly?
        var currentPath = this._getNavigable().getEnvironment().path;
        var cls = (currentPath === this.props.href) ? 'active' : '';
        return (
            <BaseLink {...this.props} className={cls}>
                {this.props.children}
            </BaseLink>
        );
    }

});

module.exports = Link;
