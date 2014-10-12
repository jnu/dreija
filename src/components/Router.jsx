/**
 * Router - Isomorphic on client and server
 * @jsx React.DOM
 */
/* jshint browser: true */

'use strict';

var React = require('react');
var Router = require('react-router-component/lib/Router');
var Route = require('react-router-component/lib/Route');

// Local JSX Components
var Layout = require('./Layout');
var Home = require('./Home');
var About = require('./About');
var NotFound = require('./NotFound');
var Post = require('./Post');


// Create a router that renders components inside the custom Layout component.
// This isn't technically a part of the library's custom API, so we have to
// reach into the `lib/Router` for it. Brittle, but should be OK for now.
// XXX: Maybe submit a PR to expose `createRouter`?
var Pages = Router.createRouter('Pages', Layout);
var Page = Route.Route;
var NotFoundPage = Route.NotFound;


var AppRouter = React.createClass({

    propTypes: {
        path: React.PropTypes.string
    },

    render: function() {
        return (
            <Pages path={this.props.path}>
                <Page path="/" handler={Home} />
                <Page path="/about" handler={About} />
                <Page path="/post/:id" handler={Post} />
                <NotFoundPage handler={NotFound} />
            </Pages>
        );
    }

});

module.exports = AppRouter;
