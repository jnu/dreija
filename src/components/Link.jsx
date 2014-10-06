/**
 * Link
 * @jsx React.DOM
 */
/* jshint browser: true */

'use strict';

var React = require('react');

var Link = React.createClass({

    propTypes: {
        local: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            local: false
        };
    },

    handleClick: function() {
        // dispatch action
    },

    render: function() {
        return this.transferPropsTo(
            <a onClick={this.handleClick}>{this.props.children}</a>
        );
    }

});

module.exports = Link;