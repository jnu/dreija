/**
 * @jsx React.DOM
 */

var React = require('react');

var Header = React.createClass({

    render: function() {
        return (
            <div className="head-inside">
                Hello, {this.props.name}! (from the header)
            </div>
        );
    }

});

module.exports = Header;