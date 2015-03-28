'use strict';

var env = require('../env');

var logger;

// THESE SHOULD ALL WORK:
//
// logger.trace('hello', 'world');
// logger.debug('hello %s',  'world', 123);
// logger.info('hello %s %d',  'world', 123, {foo:'bar'});
// logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'});
// logger.error(
//     'hello %s %d %j',
//     'world',
//     123,
//     {foo:'bar'},
//     [1, 2, 3, 4],
//     Object
// );

function shimConsoleMethod(pfx) {
    return function _consoleShim() {
        var args = Array.prototype.slice.call(arguments);
        args[0] = pfx + ':' + (args[0] || '');
        console.log.apply(console, args);
    };
}

function getConsoleMethod(method) {
    return typeof console[method] === 'function' ?
        // TODO make consistent API
        console[method].bind(console) :
        shimConsoleMethod(method.toUpperCase());
}

if (env.hasNativeConsole) {
    logger = Object.create(null);
    [
        'log',
        'trace',
        'debug',
        'info',
        'warn',
        'error'
    ].forEach(function(method) {
        this[method] = getConsoleMethod(method);
    }, logger);
} else {
    logger = require('tracer').colorConsole();
}

module.exports = logger;
