/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var AsyncContentMixin = require('../mixins/AsyncContentMixin');
var BlogActions = require('../actions/BlogActions');

var Post = React.createClass({

    propTypes: {
        id: React.PropTypes.string
    },

    mixins: [AsyncContentMixin],

    load: function(props) {
        BlogActions.loadPost(props.id);
    },

    render: function() {
        var loading = !!this.state.loading;

        return (
            <div className="post-container">
                <h1>
                    {loading ? '' : this.state.title}
                </h1>
                <div>
                    {loading ? 'loading ...' : this.state.content}
                </div>
            </div>
        );
    }

});

module.exports = Post;
