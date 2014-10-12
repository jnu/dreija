/**
 * Defer
 */

'use strict';

/**
 * Defer the execution of the provided function until the next event loop.
 * The execution context will be the same as defer.
 *
 * @example
 *    var ctx = { bar: 'bar' };
 *
 *    function foo(zap) {
 *        console.log(zap, this && this.bar);
 *    }
 *
 *     // output: "undefined, undefined"
 *     defer(foo);
 *
 *     // output: "zap, undefined"
 *     defer(foo, 'zap');
 *
 *     // output: "zap, bar"
 *     defer.call(ctx, foo, 'zap');
 *
 * @param  {Function} fn Function to execute
 */
function defer(fn) {
    /* jshint validthis: true */
    var ctx = this;
    var args = Array.prototype.slice.call(arguments, 1);
    setTimeout(function() {
        fn.apply(ctx, args);
    }, 0);
}

module.exports = defer;
