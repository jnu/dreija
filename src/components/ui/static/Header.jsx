/**
 * @jsx React.DOM
 */

var React = require('react');

var Header = React.createClass({

    propTypes: {
        ready: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            ready: false
        };
    },

    render: function() {
        var src = "/img/eye_" + (this.props.ready ? 'open' : 'close') + ".png";
        return (
            <header>
                <img src={src} />
            </header>
        );
    }

});

module.exports = Header;