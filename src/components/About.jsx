/**
 * About page
 */

'use strict';

var React = require('react');
var AsyncContentMixin = require('../mixins/AsyncContentMixin');
var BlogActions = require('../actions/BlogActions');

var ABOUT_RESOURCE_ID = 'about';

var About = React.createClass({

    mixins: [AsyncContentMixin],

    load: function() {
        BlogActions.loadStaticPage(ABOUT_RESOURCE_ID);
    },

    render: function() {
        return this.isLoading() ? null : (
            <div className="static-container">
                <h1>
                    {this.state.title}
                </h1>
                <div>
                    {this.state.content}
                </div>
            </div>
        );
    }

});

module.exports = About;
