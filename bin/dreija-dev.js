var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var deepMerge = require('../lib/deepMerge');
var nodemon = require('nodemon');
var path = require('path');
var fs = require('fs');
var config = require('../webpack.config');
const logger = require('tracer').colorConsole();


const DEV_SERVER_PORT = 8080;
const CLIENT_BUNDLE_NAME = 'client.js';
const RUNTIME_PATH = path.resolve(__dirname, '..', '.dev', 'runtime.js');
const INITIAL_DEV_PUBLIC_PATH = config[0].output && config[0].output.publicPath || '/';
const CLIENT_PUBLIC_PATH = `http://localhost:8080${INITIAL_DEV_PUBLIC_PATH}`;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Load dreija config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const argv = process.argv.slice();
if (argv[0] === 'node') {
    argv.shift();
}
const dreijaConfig = path.resolve(__dirname, '..', 'dummyconfig.js');

const dreijaResolveAliasConfig = {
    resolve: {
        alias: {
            'dreija-config$': dreijaConfig,
            'dreija-runtime$': RUNTIME_PATH
        }
    }
};

fs.writeFileSync(RUNTIME_PATH, `module.exports=${JSON.stringify({
    headScripts: [
        `http://localhost:${DEV_SERVER_PORT}/webpack-dev-server.js`,
        `${CLIENT_PUBLIC_PATH}${CLIENT_BUNDLE_NAME}`
    ]
})};`, 'utf8');



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Load & reconfigure Webpack config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// Load webpack config
var clientConfig = deepMerge(config[0], dreijaResolveAliasConfig, {
    output: {
        publicPath: CLIENT_PUBLIC_PATH
    }
});

// TODO how to get the PORT config from dreija into here?
var clientCompiler = webpack(clientConfig);

var serverConfig = deepMerge(config[1], dreijaResolveAliasConfig, {
    output: {
        path: path.join(__dirname, '..', '.dev')
    }
});


var serverCompiler = webpack(serverConfig);




var clientDevServer;
function startClientDevServer() {
    if (!clientDevServer) {
        clientDevServer = new WebpackDevServer(clientCompiler, {
            historyApiFallback: true,
            filename: CLIENT_BUNDLE_NAME,
            stats: {
                colors: true
            },
            publicPath: INITIAL_DEV_PUBLIC_PATH
        });

        clientDevServer.listen(DEV_SERVER_PORT, 'localhost', function(err) {
            if (err) {
                throw err;
            }
            logger.trace('Dev server listening on port', DEV_SERVER_PORT);
        });
    }
}


var serverStarted = false;
function startServer() {
    if (!serverStarted) {
        nodemon({
            script: path.join(__dirname, '..', '.dev', 'server.js'),
            ext: 'js json'
        });

        nodemon
            .on('start', function() {
                logger.trace('Started server');
                startClientDevServer();
            })
            .on('restart', function() {
                logger.trace('Restarted server');
            })
            .on('quit', function() { logger.trace('Quit server'); });

        serverStarted = true;
    }
}


serverCompiler.watch({
    aggregateTimeout: 300
}, function(err, stats) {
    if (err) {
        throw err;
    }

    logger.trace(stats.toString({ colors: true }));

    if (stats.hasErrors()) {
        throw new Error('Errors occurred during server compilation');
    }

    startServer();
});
