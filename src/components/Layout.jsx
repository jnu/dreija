/**
 * Main layout container
 */

'use strict';

var React = require('react/addons');
var Link = require('./Link');
var ContentStore = require('../stores/ContentStore');
var defer = require('../util/defer');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Layout = React.createClass({

    propTypes: {
        activePath: React.PropTypes.string
    },

    getInitialState: function() {
        return {
            ready: ContentStore.storeIsReady()
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
            this.replaceState,
            { ready: ContentStore.storeIsReady() }
        );
    },

    _isReady: function() {

    },

    render: function() {
        var isReady = this.state.ready;
        var closeCls = 'face close- ' + (isReady ? 'hide' : '');
        var openCls = 'face open- ' + (isReady ? '' : 'hide');

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
                        </nav>
                        <ReactCSSTransitionGroup
                            component="article"
                            transitionName="Layout-article">
                            {this.props.children}
                        </ReactCSSTransitionGroup>
                    </section>
                </div>
                <footer>
                    By Joe Nudell, 2014
                </footer>
            </div>
        );
    }

});

module.exports = Layout;
