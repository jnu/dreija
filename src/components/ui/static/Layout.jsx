/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var ajax = require('../../../util/ajax');
var Header = require('./Header');
var Footer = require('./Footer');

function setReadyStatus(status) {
    if (this.isMounted()) {
        this.setState({ ready: status });
    }
}

var Layout = React.createClass({

    getInitialState: function() {
        return {
            ready: true
        };
    },

    componentWillMount: function() {
        ajax.on('start', setReadyStatus.bind(this, false));
        ajax.on('end', setReadyStatus.bind(this, true));
    },

    render: function() {
        return (
            <div id="layout">
                <Header ready={this.state.ready} />
                <div id="content">
                    {this.props.children}
                </div>
                <Footer/>
            </div>
        );
    }

});

module.exports = Layout;