/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var PostStore = require('../stores/PostStore');
var BlogActions = require('../actions/BlogActions');

var Post = React.createClass({

    propTypes: {
        id: React.PropTypes.string
    },

    getInitialState: function() {
        return PostStore.getCurrentPost();
    },

    componentWillMount: function() {
        BlogActions.loadPost(this.props.id);
    },

    componentWillReceiveProps: function(nextProps) {
        BlogActions.loadPost(nextProps.id);
    },

    componentDidMount: function() {
        PostStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PostStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(PostStore.getCurrentPost());
    },

    render: function() {
        var loading = !!this.state.loading;

        return (
            <div className="post-container">
                <h1>
                    {loading ? '' : this.state.title}</h1>
                <div>
                    {loading ? 'loading ...' : this.state.content}
                </div>
            </div>
        );
    }

});

module.exports = Post;