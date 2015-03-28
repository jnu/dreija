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
var ContentStore = require('../stores/ContentStore');
var ContentActionsMixin = require('../mixins/ContentActionsMixin');

// Router pieces
var Pages = CustomRouter.Pages;
var Page = CustomRouter.Page;
var NotFound = CustomRouter.NotFound;

var App = React.createClass({

    propTypes: {
        path: React.PropTypes.string,
        initialContent: React.PropTypes.object
    },

    mixins: [ContentActionsMixin],

    getDefaultProps: function() {
        return {
            path: '/'
        };
    },

    getInitialState: function() {
        return {
            content: this.props.initialContent
        };
    },

    componentDidMount: function() {
        ContentStore.addChangeListener(this.contentDidChange);
    },

    componentWillUnmount: function() {
        ContentStore.removeChangeListener(this.contentDidChange);
    },

    contentDidChange: function() {
        this.setState({
            content: ContentStore.get()
        });
    },

    requestNextContent: function(path, navigation) {
        // XXX this looks horribly intrusive, but it's just determining the
        // Handler defined below.
        var handler = navigation.match.route.props.handler;
        var nextContent;

        // The handlers with remote content should define this with a method
        // that accepts the named match parameters to come up with a content
        // descriptor that can be used to fetch the appropriate content.
        if (handler.getContentDescriptor) {
            nextContent = handler.getContentDescriptor(navigation.match.match);
            this.loadContentFromDescriptor(nextContent);
        } else {
            // XXX assertions?
        }
    },

    render: function() {
        return (
            <Pages
                path={this.props.path}
                content={this.state.content}
                onBeforeNavigation={this.requestNextContent}>
                <Page path="/" handler={Home} />
                <Page path="/about" handler={About} />
                <Page path="/post/:id" handler={Post} />
                <NotFound handler={NotFound} />
            </Pages>
        );
    }

});

module.exports = App;
