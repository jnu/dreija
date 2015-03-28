/**
 * Home page
 */

'use strict';

var React = require('react');
var BlogConstants = require('../constants/BlogConstants');

var HOME_RESOURCE_ID = 'home';

var Home = React.createClass({

    statics: {
        getContentDescriptor: function() {
            return {
                id: HOME_RESOURCE_ID,
                type: BlogConstants.resource.STATIC
            };
        }
    },

    render: function() {
        var content = this.props.content || {};
        return (
            <div className="static-container">
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

module.exports = Home;
