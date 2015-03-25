/**
 * Router - Isomorphic on client and server
 */
/* jshint browser: true */

'use strict';

var React = require('react');


// Local JSX Components
var CustomRouter = require('./CustomRouter');
var Home = require('./Home');
var About = require('./About');
var NotFound = require('./NotFound');
var Post = require('./Post');

// Router pieces
var Pages = CustomRouter.Pages;
var Page = CustomRouter.Page;
var NotFound = CustomRouter.NotFound;

var App = React.createClass({

    propTypes: {
        path: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            path: '/'
        };
    },

    render: function() {
        return (
            <Pages path={this.props.path}>
                <Page path="/" handler={Home} />
                <Page path="/about" handler={About} />
                <Page path="/post/:id" handler={Post} />
                <NotFound handler={NotFound} />
            </Pages>
        );
    }

});

module.exports = App;
