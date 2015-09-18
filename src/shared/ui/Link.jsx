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
//var logger = require('../logger');

var Link = React.createClass({

    mixins: [Router.NavigatableMixin],

    render: function() {
        // XXX why doesn't this.getPath() work correctly?
        var env = this._getNavigable().getEnvironment();
        var currentPath = env.useHistoryApi ? env.path : this.getPath();
        //logger.debug(env)
        var cls = (currentPath === this.props.href) ? 'active' : '';
        return (
            <BaseLink {...this.props} className={cls}>
                {this.props.children}
            </BaseLink>
        );
    }

});

module.exports = Link;
