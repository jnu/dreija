/**
 * Router - Isomorphic on client and server
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Router = require('react-router-component');
var Location = Router.Location;
var Locations = Router.Locations;
var NotFound = Router.NotFound;

// components
var Home = require('./Home');
var NotFoundPage = require('./NotFound');
var Post = require('./Post');
var PostStore = require('../stores/PostStore');

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
                        console.log("CAn't set store: " + key)
                    }
                }
            }
        }
    },

    render: function() {
        return (
            <Locations path={this.props.path}>
                <Location path="/" handler={Home} />
                <Location path="/post/:id" handler={Post} />
                <NotFound handler={NotFoundPage} />
            </Locations>
        );
    }

});

module.exports = AppRouter;