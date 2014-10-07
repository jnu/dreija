/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Link = require('react-router-component').Link;
var PostStore = require('../stores/PostStore');
var defer = require('../util/defer');

var Layout = React.createClass({

    getInitialState: function() {
        return {
            ready: PostStore.storeIsReady()
        };
    },

    componentDidMount: function() {
        PostStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PostStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        // Defer to prevent invariant violation
        defer.call(
            this,
            this.replaceState,
            { ready: PostStore.storeIsReady() }
        );
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
                            <Link href="/post/foo">
                                Foo Post
                            </Link>
                            <Link href="/post/bar">
                                Bar Post
                            </Link>
                        </nav>
                        {this.props.children}
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
