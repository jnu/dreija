/**
 * Defer
 */

'use strict';

function defer(fn) {
    /* jshint validthis: true */
    var ctx = this;
    var args = Array.prototype.slice.call(arguments, 1);
    setTimeout(function() {
        fn.apply(ctx, args);
    }, 0);
}

module.exports = defer;
