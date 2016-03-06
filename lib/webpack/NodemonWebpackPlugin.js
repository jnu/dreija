var nodemon = require('nodemon');
var logger = require('../logger');


/**
 * Execute an emitted asset with nodemon when Webpack is running in watch mode.
 * @class NodemonWebpackPlugin
 * @param {Object} options
 * @param {String} options.target - entry file to run with nodemon
 */
function NodemonWebpackPlugin(options) {
    options = options || {};

    /**
     * Entry ID of file to start, specified in options.file
     * @type {String?}
     */
    this.targetFile = options.target || null;

    /**
     * Full path of currently running asset
     * @type {String}
     */
    this.targetPath = null;

    /**
     * Indicates whether Webpack is running in a watch cycle
     * @type {Boolean}
     */
    this.isWatchRun = false;

    // NB: can't do a proper exit here, just notify nodemon that it should quit.
    process.on('exit', function handleProcessExit() {
        nodemon.emit('quit');
    });
}


/**
 * Given a Webpack complilation instance's assets path, find the path of the
 * target asset.
 *
 * If the plugin is configured with an explicit asset name, try to find it.
 * Otherwise, the heustic is to find the first javascript asset encountered.
 * Could be more clever, but this will suffice for most cases.
 *
 * @private
 * @name NodemonWebpackPlugin#_findTargetAssetPath
 * @param {Object} assets - Webpack compilation assets, i.e. c.assets
 * @returns {String} full path to target asset
 */
NodemonWebpackPlugin.prototype._findTargetAssetPath = function(assets) {
    var assetKey = this.targetFile;

    if (!assetKey) {
        assetKey = Object.keys(assets).find(function(name) {
            return /\.js$/.test(name);
        });
    }

    var asset = assets[assetKey];
    return asset && asset.existsAt;
};


/**
 * Properly shutdown nodemon
 * @private
 * @name NodemonWebpackPlugin#_stopNodemon
 * @param {Function} callback - called when nodemon exits
 */
NodemonWebpackPlugin.prototype._stopNodemon = function(callback) {
    // Do a proper shutdown of the current task, then notify caller
    nodemon.on('exit', function handleNodemonExit() {
        nodemon.removeAllListeners();
        nodemon.reset();
        callback();
    });

    nodemon.emit('quit');
};


/**
 * Run the target asset with nodemon
 * @private
 * @name NodemonWebpackPlugin#_startNodemon
 */
NodemonWebpackPlugin.prototype._startNodemon = function() {
    var targetPath = this.targetPath;

    nodemon({
        script: targetPath,
        ext: 'js'
    });

    nodemon
        .on('start', function handleNodemonStart() {
            logger.info('Started `' + targetPath + '`');
        })
        .on('quit', function handleNodemonQuit() {
            logger.info('Stopped the `' + targetPath + '`');
        })
        .on('restart', function handleNodemonRestart() {
            logger.info('Restarting the `' + targetPath + '`');
        });
};


/**
 * Webpack plugin interface
 * @name NodemonWebpackPlugin#apply
 */
NodemonWebpackPlugin.prototype.apply = function(compiler) {
    var plugin = this;

    compiler.plugin('watch-run', function handleWebpackWatchRun(watching, callback) {
        logger.info('Nodemon is watching the bundle and will reboot on changes');
        plugin.isWatchRun = true;
        callback();
    });

    compiler.plugin('after-emit', function handleWebpackAfterEmit(c, callback) {
        // Don't do anything for non-watch-runs
        if (!plugin.isWatchRun) {
            return callback();
        }

        var targetPath = plugin._findTargetAssetPath(c.assets);

        // If nodemon is not watching any path, start it
        if (!plugin.targetPath) {
            plugin.targetPath = targetPath;
            plugin._startNodemon();
            return callback();
        }

        // If nodemon is already watching this path, nothing to be done, since
        // Nodemon itself is watching the bundle to refresh if necessary.
        else if (targetPath === plugin.targetPath) {
            return callback();
        }
        // If nodemon is already setup on a different path, reset it
        else {
            plugin.targetPath = targetPath;
            plugin._stopNodemon(function() {
                plugin._startNodemon();
                callback();
            });
        }
    });

};


module.exports = NodemonWebpackPlugin;
