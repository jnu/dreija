var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var deepMerge = require('../lib/deepMerge');
var nodemon = require('nodemon');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('../webpack.config');
var formatWebpackStats = require('./console-format-helpers').formatWebpackStats;



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Constants
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var DEV_SERVER_PORT = 8080;
var CLIENT_BUNDLE_NAME = 'client.js';
var DEV_RUNTIME_DIR = path.resolve(__dirname, '..', '.dev');
mkdirp(DEV_RUNTIME_DIR);
var RUNTIME_PATH = path.resolve(DEV_RUNTIME_DIR, 'runtime.js');
var ENV_PATH = path.resolve(DEV_RUNTIME_DIR, 'env.js');
var INITIAL_DEV_PUBLIC_PATH = config[0].output && config[0].output.publicPath || '/';
var CLIENT_PUBLIC_PATH = `http://localhost:8080${INITIAL_DEV_PUBLIC_PATH}`;



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Parse CLI
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var argv = process.argv.slice();
var dreijaConfig = path.resolve(__dirname, '..', 'src', 'app', 'dummyconfig.js');
var startedParse = false;
var arg;

while (argv.length) {
    arg = argv.shift();
    switch (arg) {
        case '-a':
        case '--app':
            startedParse = true;
            dreijaConfig = path.resolve(process.cwd(), argv.shift());
            break;
        default:
            if (startedParse) {
                console.error(`Unexpected argument: ${arg}`);
            }
    }
}

console.info(`Using config ${dreijaConfig}`);



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

fs.writeFileSync(RUNTIME_PATH, `module.exports=${JSON.stringify({
    headScripts: [
        `http://localhost:${DEV_SERVER_PORT}/webpack-dev-server.js`,
        `${CLIENT_PUBLIC_PATH}${CLIENT_BUNDLE_NAME}`
    ]
})};`, 'utf8');

fs.writeFileSync(ENV_PATH, `module.exports=${JSON.stringify({
    DBHOSTNAME: process.env.DBHOSTNAME
})}`);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Webpack config
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
        path: path.join(__dirname, '..', '.dev'),
        publicPath: CLIENT_PUBLIC_PATH
    }
});

var serverCompiler = webpack(serverConfig);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Servers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var clientDevServer;
function startClientDevServer() {
    if (!clientDevServer) {
        console.info('\nBuilding client bundle and starting live reload server');

        clientCompiler.plugin("done", function onFinishedCompile(stats) {
            console.log(formatWebpackStats('Dreija client', stats));

            console.info('\nFinished building client');
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
            console.info('Dev server listening on port', DEV_SERVER_PORT);
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
                console.info('Started server');
                startClientDevServer();
            })
            .on('restart', function() {
                console.info('Restarted server');
            })
            .on('quit', function() { console.info('Quit server'); });

        serverStarted = true;
    }
}



serverCompiler.watch({
    aggregateTimeout: 300
}, function(err, stats) {
    if (err) {
        throw err;
    }

    console.log(formatWebpackStats('Dreija server', stats));

    if (stats.hasErrors()) {
        throw new Error('Errors occurred during server compilation');
    }

    startServer();
});
