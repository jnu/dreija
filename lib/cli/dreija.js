#!/usr/bin/env node

const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const deepMerge = require('../deepMerge');
const nodemon = require('nodemon');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const config = require('../../webpack.config');
const formatWebpackStats = require('../webpack/console-format-helpers').formatWebpackStats;
const logger = require('../logger');
const _ = require('lodash');


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Constants
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const DEV_SERVER_PORT = 8080;
const CLIENT_BUNDLE_NAME = 'client.js';
const INITIAL_DEV_PUBLIC_PATH = config[0].output && config[0].output.publicPath || '/';
const CLIENT_PUBLIC_PATH = `http://localhost:8080${INITIAL_DEV_PUBLIC_PATH}`;
const STATIC_BUILD_PATH = path.resolve(process.cwd(), 'dist');
const TMP_DIRECTORY = path.resolve(__dirname, '..', '..', 'tmp');
const DREIJA_ENV_MODULE_NAME = 'dreija-env$';
const DREIJA_RUNTIME_MODULE_NAME = 'dreija-runtime$';
mkdirp(TMP_DIRECTORY);




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Parse CLI
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const argv = process.argv.slice();
let dreijaConfig = path.resolve(__dirname, '..', '..', 'src', 'app', 'demo', 'app.js');
let dreijaAPIConfig = path.resolve(__dirname, '..', '..', 'src', 'app', 'demo', 'api.js');
const env = {};
let arg;
let envValParts;
let secretFilePath;
let watch = false;


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
        case '-a':
        case '--api':
            dreijaAPIConfig = path.resolve(process.cwd(), argv.shift());
            break;
        default:
            if (arg[0] === '-') {
                logger.warn(`Unexpected argument: ${arg}`);
            }
    }
}

logger.info(`Using config ${dreijaConfig}`);
logger.info(`Using API config ${dreijaAPIConfig}`);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Branding
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger.raw(logger.colors.BROWN);
logger.raw(fs.readFileSync(path.resolve(__dirname, 'brand.txt'), 'utf-8'));
logger.raw(logger.colors.YELLOW);
if (watch) {
    logger.raw('-- watch mode --\n');
} else {
    logger.raw('-- static build --\n');
    logger.raw('ENV:', process.env.NODE_ENV || 'development');
}
logger.raw(logger.colors.NONE);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Write dynamic modules
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const dreijaResolveAliasConfig = {
    resolve: {
        alias: {
            'dreija-config$': dreijaConfig,
            'dreija-api-config$': dreijaAPIConfig
        }
    }
};

function ensureTmpFile(contents, ext) {
    const hash = crypto.createHash('sha256');
    hash.update(contents);
    const hex = hash.digest('hex');
    const fileName = `${hex}.${ext}`;
    const p = path.join(TMP_DIRECTORY, fileName);
    if (fs.existsSync(p)) {
        return p;
    }
    fs.writeFileSync(p, contents);
    return p;
}


function generateEnvFile(envJson) {
    return ensureTmpFile(`module.exports=${JSON.stringify(envJson)};`, 'js');
}

function generateRuntimeFile(headScripts) {
    return ensureTmpFile(`module.exports=${JSON.stringify({
            headScripts: headScripts
        })};`, 'js');
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Webpack config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Get base client config used for client compilation
 */
function getClientConfig(configs, watchMode) {

    // Load webpack config
    const clientConfig = deepMerge(configs[0], dreijaResolveAliasConfig, {
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
    const serverConfig = deepMerge(configs[1], dreijaResolveAliasConfig, {
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
// Run Static build
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function runStaticBuild() {
    const clientConfig = getClientConfig(config, watch);
    clientConfig.resolve.alias[DREIJA_ENV_MODULE_NAME] = generateEnvFile(env);
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
        serverConfig.resolve.alias[DREIJA_RUNTIME_MODULE_NAME] = generateRuntimeFile(scripts);
        serverConfig.resolve.alias[DREIJA_ENV_MODULE_NAME] = generateEnvFile(env);

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



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Run watcher (TODO yikes! this is a mess, refactor!)
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function runWatchedBuild() {

    let clientDevServer;
    function startClientDevServer() {
        if (!clientDevServer) {
            logger.info('Building client bundle and starting live reload server');

            const clientConfig = getClientConfig(config, true);
            clientConfig.resolve.alias[DREIJA_ENV_MODULE_NAME] = generateEnvFile(env);
            const clientCompiler = webpack(clientConfig);

            clientCompiler.plugin("done", function onFinishedCompile(stats) {
                logger.raw(formatWebpackStats('Dreija client', stats));

                logger.info('Finished building client');
            });

            clientDevServer = new WebpackDevServer(clientCompiler, {
                historyApiFallback: true,
                filename: CLIENT_BUNDLE_NAME,
                stats: false,
                publicPath: INITIAL_DEV_PUBLIC_PATH
            });

            clientDevServer.listen(DEV_SERVER_PORT, 'localhost', function(err) {
                if (err) {
                    throw err;
                }
                logger.info('Dev server listening on port', DEV_SERVER_PORT);
            });
        }
    }

    let serverStarted = false;
    function startServer() {
        let scriptArgs;

        if (!serverStarted) {
            scriptArgs = [];

            // Load secrets if they were provided
            if (secretFilePath) {
                scriptArgs.push.apply(scriptArgs, ['-s', secretFilePath]);
            }

            nodemon({
                args: scriptArgs,
                script: path.join(__dirname, '..', '.dev', 'server.js'),
                ext: 'js json'
            });

            nodemon
                .on('start', function() {
                    logger.info('Started server');
                    startClientDevServer();
                })
                .on('restart', function() {
                    logger.info('Restarted server');
                })
                .on('quit', function() {
                    logger.info('Quit server');
                });

            serverStarted = true;
        }
    }

    const serverConfig = getServerConfig(config, true);
    serverConfig.resolve.alias[DREIJA_RUNTIME_MODULE_NAME] = generateRuntimeFile([
        `http://localhost:${DEV_SERVER_PORT}/webpack-dev-server.js`,
        `${CLIENT_PUBLIC_PATH}${CLIENT_BUNDLE_NAME}`
    ]);
    serverConfig.resolve.alias[DREIJA_ENV_MODULE_NAME] = generateEnvFile(env);

    webpack(serverConfig).watch({
        aggregateTimeout: 300
    }, function(err, stats) {
        if (err) {
            throw err;
        }

        logger.raw(formatWebpackStats('Dreija server', stats));

        if (stats.hasErrors()) {
            throw new Error('Errors occurred during server compilation');
        }

        startServer();
    });
}




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Init
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (!watch) {
    runStaticBuild();
} else {
    runWatchedBuild();
}



function quit() {
    process.exit(1);
}

process.on('SIGINT', quit);
process.on('SIGTERM', quit);
