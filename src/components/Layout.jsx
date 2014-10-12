/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Link = require('./Link');
var ContentStore = require('../stores/ContentStore');
var defer = require('../util/defer');

var Layout = React.createClass({

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
        var closeCls = 'face close- ' + (this.state.ready ? 'hide' : '');
        var openCls = 'face open- ' + (this.state.ready ? '' : 'hide');

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
                        <article>
                            {this.props.children}
                        </article>
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
