var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var deepMerge = require('../lib/deepMerge');
var nodemon = require('nodemon');
var path = require('path');


var DEV_SERVER_PORT = 8080;


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Load dreija config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const argv = process.argv.slice();
if (argv[0] === 'node') {
    argv.shift();
}
var dreijaConfig = path.resolve(__dirname, '..', 'dummyconfig.js');

var dreijaResolveAliasConfig = {
    resolve: {
        alias: {
            'dreija-config$': dreijaConfig
        }
    }
};



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Load & reconfigure Webpack config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// Load webpack config
var config = require('../webpack.config');
var clientConfig = deepMerge(config[0], dreijaResolveAliasConfig, {
    output: {
        publicPath: 'http://localhost:8080' + (config[0].output && config[0].output.publicPath || '/')
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
            inline: true
        });

        clientDevServer.listen(DEV_SERVER_PORT, 'localhost', function(err) {
            if (err) {
                throw err;
            }
            console.log('Dev server listening on port', DEV_SERVER_PORT)
        })
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
                console.log('Started server');
                startClientDevServer();
            })
            .on('restart', function() { console.log('Restarted server'); })
            .on('quit', function() { console.log('Quit server'); });

        serverStarted = true;
    }
}


var serverWatcher = serverCompiler.watch({
    aggregateTimeout: 300
}, function(err, stats) {
    if (err) {
        throw err;
    }

    console.log(stats.toString({ colors: true }));

    if (stats.hasErrors()) {
        throw new Error('Errors occurred during server compilation');
    }

    startServer();
});
