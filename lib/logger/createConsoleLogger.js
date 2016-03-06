var noop = function(){};
var _console = typeof console !== 'undefined' && console;
var colors = require('./colors');

function createConsoleLogger(level, textColor, titleColor) {
    if (!_console) {
        return noop;
    }

    if (!level) {
        return (_console.log || noop).bind(_console);
    }

    var method = _console[level] || _console.log || noop;

    return function _logAtLevel(/* args */) {
        var msgs = [titleColor + level, '[' + (new Date()).toISOString() + ']>' + textColor].concat(
            Array.prototype.slice.call(arguments),
            colors.NONE
        );
        method.apply(_console, msgs);
    };
}

module.exports = createConsoleLogger;
