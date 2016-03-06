var ESC = function(code) {
    return `\u001b[${code}m`;
};

module.exports = {
    NONE        : ESC('0'),
    BLACK       : ESC('0;30'),
    DARK_GRAY   : ESC('1;30'),
    BLUE        : ESC('0;34'),
    LIGHT_BLUE  : ESC('1;34'),
    GREEN       : ESC('0;32'),
    LIGHT_GREEN : ESC('1;32'),
    CYAN        : ESC('0;36'),
    LIGHT_CYAN  : ESC('1;36'),
    RED         : ESC('0;31'),
    LIGHT_RED   : ESC('1;31'),
    PURPLE      : ESC('0;35'),
    LIGHT_PURPLE: ESC('1;35'),
    BROWN       : ESC('0;33'),
    YELLOW      : ESC('1;33'),
    LIGHT_GRAY  : ESC('0;37'),
    WHITE       : ESC('1;37')
};
