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
var _ = require('lodash');


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Constants
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var DEV_SERVER_PORT = 8080;
var CLIENT_BUNDLE_NAME = 'client.js';
var DEV_RUNTIME_DIR = path.resolve(__dirname, '..', '..', '.build');
mkdirp(DEV_RUNTIME_DIR);
var RUNTIME_PATH = path.resolve(DEV_RUNTIME_DIR, 'runtime.js');
var ENV_PATH = path.resolve(DEV_RUNTIME_DIR, 'env.js');
var INITIAL_DEV_PUBLIC_PATH = config[0].output && config[0].output.publicPath || '/';
var CLIENT_PUBLIC_PATH = `http://localhost:8080${INITIAL_DEV_PUBLIC_PATH}`;



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
            'dreija-config$': dreijaConfig,
            'dreija-runtime$': RUNTIME_PATH,
            'dreija-env$': ENV_PATH
        }
    }
};


function generateRuntime(headScripts) {
    fs.writeFileSync(RUNTIME_PATH, `module.exports=${JSON.stringify({
        headScripts: headScripts
    })};`, 'utf8');

    fs.writeFileSync(ENV_PATH, `module.exports=${JSON.stringify(env)}`);
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Webpack config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var STATIC_BUILD_PATH = path.resolve(process.cwd(), 'dist');

// Load webpack config
var clientConfig = deepMerge(config[0], dreijaResolveAliasConfig, {
    output: {
        publicPath: watch ? CLIENT_PUBLIC_PATH : '/'
    }
});
if (!watch) {
    clientConfig.output.path = path.resolve(STATIC_BUILD_PATH, 'public');
}

// TODO how to get the PORT config from dreija into here?
var clientCompiler = webpack(clientConfig);

var serverConfig = deepMerge(config[1], dreijaResolveAliasConfig, {
    output: {
        path: watch ? path.join(__dirname, '..', '.dev') : STATIC_BUILD_PATH,
        publicPath: watch ? CLIENT_PUBLIC_PATH : '/'
    }
});

var serverCompiler = webpack(serverConfig);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Servers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var clientDevServer;
function startClientDevServer() {
    if (!clientDevServer) {
        logger.info('Building client bundle and starting live reload server');

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

var serverStarted = false;
function startServer() {
    var scriptArgs;

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
            .on('quit', function() { logger.info('Quit server'); });

        serverStarted = true;
    }
}


if (watch) {
    generateRuntime([
        `http://localhost:${DEV_SERVER_PORT}/webpack-dev-server.js`,
        `${CLIENT_PUBLIC_PATH}${CLIENT_BUNDLE_NAME}`
    ]);

    serverCompiler.watch({
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
} else {
    clientCompiler.run(function(err, stats) {
        if (err) {
            throw err;
        }

        var scripts = _.flatten(
            stats.toJson()
                .chunks.filter(function(chunk) {
                    return chunk.entry;
                }).map(function(chunk) {
                    return chunk.files;
                })
        );

        var headScripts = scripts
            .map(function(s) { return '/' + s; })
            .filter(function(s) { return /\.js$/.test(s); });
        generateRuntime(headScripts);

        logger.raw(formatWebpackStats('Dreija client', stats));

        if (stats.hasErrors()) {
            throw new Error('Errors occurred during client compilation');
        }


        serverCompiler.run(function(err, stats) {
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
