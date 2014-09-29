/**
 * @jsx React.DOM
 */

var React = require('react');

var Header = require('./Header');
var Footer = require('./Footer');

var Layout = React.createClass({

    render: function() {
        return (
            <div id="layout">
                <Header/>
                <div id="content">
                    {this.props.children}
                </div>
                <Footer/>
            </div>
        );
    }

});

module.exports = Layout;