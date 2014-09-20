/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var Routes = Router.Routes;
// components
var App = require('./App');
var Home = require('./Home');

var AppRouter = React.createClass({

    render: function() {
        return (
            <Routes location={this.props.location}>
                <Route path="/" handler={App}>
                    <DefaultRoute handler={Home} />
                </Route>
            </Routes>
        );
    }

});

module.exports = AppRouter;