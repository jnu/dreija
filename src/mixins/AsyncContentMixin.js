/**
 * Async content mixin
 */

'use strict';

var ContentStore = require('../stores/ContentStore');

var AsyncContentMixin = {

    getInitialState: function() {
        return ContentStore.getCurrentPage();
    },

    componentWillReceiveProps: function(nextProps) {
        this.load(nextProps);
    },

    componentDidMount: function() {
        ContentStore.addChangeListener(this._onChange);
        this.load(this.props);
    },

    componentWillUnmount: function() {
        ContentStore.removeChangeListener(this._onChange);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return nextState !== this.state;
    },

    _onChange: function() {
        this.replaceState(ContentStore.getCurrentPage());
    }

};

module.exports = AsyncContentMixin;
