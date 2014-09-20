/**
 * Router - Isomorphic on client and server
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Router = require('react-router-component');
var Page = Router.Page;
var Pages = Router.Pages;
var NotFound = Router.NotFound;

// components
var Home = require('./Home');
var NotFoundPage = require('./NotFound');

var AppRouter = React.createClass({

    propTypes: {
        path: React.PropTypes.string
    },

    render: function() {
        return (
            <Pages path={this.props.path}>
                <Page path="/" handler={Home} />
                <NotFound handler={NotFoundPage} />
            </Pages>
        );
    }

});

module.exports = AppRouter;