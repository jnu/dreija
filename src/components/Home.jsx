/**
 * Home page
 */

'use strict';

var React = require('react');
var AsyncContentMixin = require('../mixins/AsyncContentMixin');
var BlogActions = require('../actions/BlogActions');

var HOME_RESOURCE_ID = 'home';

var Home = React.createClass({

    mixins: [AsyncContentMixin],

    load: function() {
        BlogActions.loadStaticPage(HOME_RESOURCE_ID);
    },

    render: function() {
        return this.isLoading() ? null :(
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

module.exports = Home;
