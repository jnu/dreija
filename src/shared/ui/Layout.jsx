/**
 * Main layout container
 */

'use strict';

var React = require('react/addons');
var Link = require('./Link');
var ContentStore = require('../stores/ContentStore');
var defer = require('../util/defer');
var env = require('../env');

var Layout = React.createClass({

    propTypes: {
        activePath: React.PropTypes.string
    },

    getInitialState: function() {
        return {
            ready: ContentStore.isFullyLoaded()
        };
    },

    componentDidMount: function() {
        ContentStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ContentStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        // Defer to prevent invariant violation
        defer.call(
            this,
            this.setState,
            { ready: ContentStore.isFullyLoaded() }
        );
    },

    render: function() {
        var isReady = this.state.ready;
        var closeCls = 'face close- ' + (isReady ? 'hide' : '');
        var openCls = 'face open- ' + (isReady ? '' : 'hide');
        var content = this.props.content;
        var articleId = content && content.id || '__none';
        var TransitionContainer = 'div';

        return (
            <div id="layout">
                <div className="flex">
                    <section id="left">
                        {/* render both open and close so images preload */}
                        <div className={closeCls} />
                        <div className={openCls} />
                    </section>
                    <section id="right">
                        <nav>
                            <Link href="/">
                                My Thoughts
                            </Link>
                            <Link href="/about">
                                Me
                            </Link>
                            <Link href="/post/foo">
                                Foo post
                            </Link>
                            <Link href="/post/bar">
                                Bar post
                            </Link>
                        </nav>
                        <TransitionContainer
                            component="div"
                            transitionName="slide-forward">
                            <article key={ articleId }>
                                {this.props.children}
                            </article>
                        </TransitionContainer>
                    </section>
                </div>
                <footer>
                    By Joe Nudell, 2014-15
                </footer>
            </div>
        );
    }

});

module.exports = Layout;
