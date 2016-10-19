



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
