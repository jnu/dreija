/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Link = require('./Link');

var Layout = React.createClass({

    propTypes: {
        ready: React.PropTypes.bool
    },

    render: function() {
        var closeCls = 'face close- ' + (this.props.ready ? 'hide' : '');
        var openCls = 'face open- ' + (this.props.ready ? '' : 'hide');

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
                            <Link href="/post/foo" local={true}>
                                Foo Post
                            </Link>
                            <Link href="/post/bar" local={true}>
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