/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var PostStore = require('../stores/PostStore');

var Post = React.createClass({

    propTypes: {
        id: React.PropTypes.string
    },

    getInitialState: function() {
        return {
            title: "",
            content: ""
        };
    },

    componentWillMount: function() {
        var cmp = this;

        PostStore.get(this.props.id, function(post) {
            cmp.setState(post || {});
        });
    },

    render: function() {
        return (
            <div className="post-container">
                <h1>{this.state.title}</h1>
                <div>{this.state.content}</div>
            </div>
        );
    }

});

module.exports = Post;