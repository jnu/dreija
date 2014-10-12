/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var ContentStore = require('../stores/ContentStore');
var BlogActions = require('../actions/BlogActions');

var Post = React.createClass({

    propTypes: {
        id: React.PropTypes.string
    },

    getInitialState: function() {
        return ContentStore.getCurrentPost();
    },

    componentWillReceiveProps: function(nextProps) {
        BlogActions.loadPost(nextProps.id);
    },

    componentDidMount: function() {
        ContentStore.addChangeListener(this._onChange);
        BlogActions.loadPost(this.props.id);
    },

    componentWillUnmount: function() {
        ContentStore.removeChangeListener(this._onChange);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return nextState !== this.state;
    },

    _onChange: function() {
        this.setState(ContentStore.getCurrentPost());
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
