/**
 * @jsx React.DOM
 */

"use strict";

var React = require('react');

var App = React.createClass({

    render: function() {
        return (
            <div id="app">
                {this.props.activeRouteHandler()}
            </div>
        );
    }

});

module.exports = App;