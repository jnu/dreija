/**
 * Post page
 */

'use strict';

var React = require('react');
var BlogConstants = require('../constants/BlogConstants');

var Post = React.createClass({

    propTypes: {
        id: React.PropTypes.string
    },

    statics: {
        getContentDescriptor: function(match) {
            return {
                id: match.id,
                type: BlogConstants.resource.POST
            };
        }
    },

    render: function() {
        var content = this.props.content;

        return (
            <div className="post-container">
                <h1>
                    {content.title}
                </h1>
                <div>
                    {content.content}
                </div>
            </div>
        );
    }

});

module.exports = Post;
