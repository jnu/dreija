/**
 * Router - Isomorphic on client and server
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Router = require('react-router-component/lib/Router');
var Route = require('react-router-component/lib/Route');

// Local JSX Components
var Layout = require('./Layout');
var Home = require('./Home');
var NotFound = require('./NotFound');
var Post = require('./Post');

// Stores
var PostStore = require('../stores/PostStore');

// Create a router that renders components inside the custom Layout component.
// This isn't technically a part of the library's custom API, so we have to
// reach into the `lib/Router` for it. Brittle, but should be OK for now.
// XXX: Maybe submit a PR to expose `createRouter`?
var Pages = Router.createRouter('Pages', Layout);
var Page = Route.Route;
var NotFoundPage = Route.NotFound;

var stores = {
    'PostStore': PostStore
};


var AppRouter = React.createClass({

    propTypes: {
        path: React.PropTypes.string,
        data: React.PropTypes.object
    },

    componentWillMount: function() {
        var data = this.props.data;
        var store;
        var key;

        if (data) {
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    store = stores[key];
                    if (store) {
                        stores[key].reset(data[key]);
                    } else {
                        if (process.env.NODE_ENV !== 'production') {
                            console.warn("Can't inflate store: " + key);
                        }
                    }
                }
            }
        }
    },

    render: function() {
        return (
            <Pages path={this.props.path}>
                <Page path="/" handler={Home} />
                <Page path="/post/:id" handler={Post} />
                <NotFoundPage handler={NotFound} />
            </Pages>
        );
    }

});

module.exports = AppRouter;