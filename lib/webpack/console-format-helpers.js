/* eslint max-len:500 */
var c = require('../lib/logger').colors;

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
