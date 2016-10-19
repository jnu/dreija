#!/usr/bin/env node

var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var deepMerge = require('../deepMerge');
var nodemon = require('nodemon');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('../../webpack.config');
var formatWebpackStats = require('../webpack/console-format-helpers').formatWebpackStats;
var logger = require('../logger');
var VirtualModulePlugin = require('virtual-module-webpack-plugin');
var _ = require('lodash');


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Constants
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var DEV_SERVER_PORT = 8080;
var CLIENT_BUNDLE_NAME = 'client.js';
var INITIAL_DEV_PUBLIC_PATH = config[0].output && config[0].output.publicPath || '/';
var CLIENT_PUBLIC_PATH = `http://localhost:8080${INITIAL_DEV_PUBLIC_PATH}`;
var STATIC_BUILD_PATH = path.resolve(process.cwd(), 'dist');



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Parse CLI
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var argv = process.argv.slice();
var dreijaConfig = path.resolve(__dirname, '..', '..', 'src', 'app', 'demo', 'app.js');
var env = {};
var arg;
var envValParts;
var secretFilePath;
var watch = false;


while (argv.length) {
    arg = argv.shift();
    switch (arg) {
        case '-a':
        case '--app':
            dreijaConfig = path.resolve(process.cwd(), argv.shift());
            break;
        case '-e':
        case '--env':
            envValParts = argv.shift().split('=');
            env[envValParts[0]] = envValParts[1];
            break;
        case '-s':
        case '--secrets':
            secretFilePath = path.resolve(process.cwd(), argv.shift());
            break;
        case '-w':
        case '--watch':
            watch = true;
            break;
        default:
            if (arg[0] === '-') {
                logger.warn(`Unexpected argument: ${arg}`);
            }
    }
}

logger.info(`Using config ${dreijaConfig}`);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Branding
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger.raw(logger.colors.BROWN);
logger.raw(fs.readFileSync(path.resolve(__dirname, 'brand.txt'), 'utf-8'));
logger.raw(logger.colors.YELLOW);
if (watch) {
    logger.raw('-- watch mode --\n\n');
} else {
    logger.raw('-- static build --\n\n');
    logger.raw('ENV:', process.env.NODE_ENV || 'development');
}
logger.raw(logger.colors.NONE);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Write dynamic modules
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var dreijaResolveAliasConfig = {
    resolve: {
        alias: {
            'dreija-config$': dreijaConfig
        }
    }
};


function generateEnvPlugin(envJson) {
    return new VirtualModulePlugin({
        moduleName: 'dreija-env',
        contents: `module.exports=${JSON.stringify(envJson)};`
    });
}

function generateRuntimePlugin(headScripts) {
    return new VirtualModulePlugin({
        moduleName: 'dreija-runtime',
        contents: `module.exports=${JSON.stringify({
            headScripts: headScripts
        })};`
    });
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Webpack config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Get base client config used for client compilation
 */
function getClientConfig(configs, watchMode) {

    // Load webpack config
    var clientConfig = deepMerge(configs[0], dreijaResolveAliasConfig, {
        output: {
            publicPath: watchMode ? CLIENT_PUBLIC_PATH : '/'
        }
    });

    if (!watchMode) {
        clientConfig.output.path = path.resolve(STATIC_BUILD_PATH, 'public');
    }

    return clientConfig;
}


/**
 * Get base server config to be used for server compilation.
 */
function getServerConfig(configs, watchMode) {
    var serverConfig = deepMerge(configs[1], dreijaResolveAliasConfig, {
        output: {
            path: watchMode ? path.join(__dirname, '..', '.dev') : STATIC_BUILD_PATH,
            publicPath: watchMode ? CLIENT_PUBLIC_PATH : '/'
        }
    });

    return serverConfig;
}


/**
 * Parse script entry chunk names from webpack output
 */
function parseScriptsFromOutputStats(stats) {
    return _.flatten(
        stats.toJson()
            .chunks
            .filter(chunk => chunk.entry)
            .map(chunk => chunk.files)
    )
    .filter(s => /\.js$/.test(s))
    .map(s => `/${s}`);
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Run build
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function runStaticBuild() {
    const clientConfig = getClientConfig(config, watch);
    clientConfig.plugins.push(generateEnvPlugin(env));
    webpack(clientConfig).run(function(err, stats) {
        if (err) {
            throw err;
        }

        logger.raw(formatWebpackStats('Dreija client', stats));

        if (stats.hasErrors()) {
            throw new Error('Errors occurred during client compilation');
        }

        const scripts = parseScriptsFromOutputStats(stats);
        const serverConfig = getServerConfig(config, watch);
        serverConfig.plugins.push(generateRuntimePlugin(scripts));
        serverConfig.plugins.push(generateEnvPlugin(env));

        webpack(serverConfig).run(function(err, stats) {
            if (err) {
                throw err;
            }

            logger.raw(formatWebpackStats('Dreija server', stats));

            if (stats.hasErrors()) {
                throw new Error('Errors occurred during server compilation');
            }
        });

    });
}




runStaticBuild();
