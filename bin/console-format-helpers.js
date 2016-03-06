
var ESC = function(code) {
    return `\u001b[${code}m`;
}

var c = {
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




function formatWebpackStats(banner, stats) {
    var json = stats.toJson();


    // Format errors
    var errors = json.errors.length ?
        `${c.LIGHT_RED}ERRORS${c.NONE}
${c.RED}${[''].concat(json.errors).join('\n  - ')}${c.NONE}` :
        `${c.LIGHT_RED}no errors${c.NONE}`;

    // Format warnings
    var warnings = json.warnings.length ?
        `${c.BROWN}ERRORS${c.NONE}
${c.YELLOW}${[''].concat(json.errors).join('\n  - ')}${c.NONE}` :
        `${c.BROWN}no warnings${c.NONE}`;

    // Format assets
    var assets = json.assets.map(function(asset) {
        return `  ${c.LIGHT_GRAY}- ${c.LIGHT_GREEN}${asset.name} ${c.CYAN}${asset.size.toLocaleString()}${c.LIGHT_BLUE}kb`;
    }).join('\n');

    // Format entry chunks
    var entryChunks = json.chunks.filter(function(chunk) {
        return chunk.entry;
    });
    var chunks = entryChunks.map(function(chunk) {
        return `\
  ${c.LIGHT_GRAY}- ${c.LIGHT_GREEN}${chunk.names.join(`${c.GREEN}, ${c.LIGHT_GREEN}`)} ${c.CYAN}${chunk.size.toLocaleString()}${c.LIGHT_BLUE}kb
${c.LIGHT_GREEN}${[''].concat(chunk.files).join(`${c.GREEN}\n    > ${c.LIGHT_GREEN}`)}${c.NONE}`;
    }).join('\n');
    var otherChunkCount = json.chunks.length - entryChunks.length;

    return `

${c.LIGHT_GRAY}${banner}${c.NONE}
${c.DARK_GRAY}${banner.split('').map(function() { return '-' }).join('')}${c.NONE}

${c.LIGHT_BLUE}Finished in ${c.CYAN}${json.time.toLocaleString()}${c.LIGHT_BLUE}ms${c.NONE}

${c.GREEN}Assets${c.NONE}
${assets}

${c.GREEN}Entry Chunks${c.NONE}
${chunks}

${c.LIGHT_GRAY}Hiding ${c.CYAN}${otherChunkCount.toLocaleString()}${c.LIGHT_GRAY} other chunks.

${errors}

${warnings}

${c.LIGHT_GRAY}That's it!${c.NONE}
`;
}

module.exports = {
    formatWebpackStats: formatWebpackStats,
    colors: c
};
