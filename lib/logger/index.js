var createConsoleLogger = require('./createConsoleLogger');
var colors = require('./colors');

module.exports = {
    colors: colors,
    log: createConsoleLogger('log', colors.DARK_GRAY, colors.LIGHT_GRAY),
    info: createConsoleLogger('info', colors.BLUE, colors.LIGHT_BLUE),
    warn: createConsoleLogger('warn', colors.BROWN, colors.YELLOW),
    error: createConsoleLogger('error', colors.RED, colors.LIGHT_RED),
    trace: createConsoleLogger('trace', colors.PURPLE, colors.LIGHT_PURPLE),
    raw: createConsoleLogger()
};
