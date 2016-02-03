'use strict';

if (process.env.NODE_ENV !== 'server') {
    require('babel/register');
}

var logger = process.env.NODE_ENV === 'server' ?
    require('tracer').dailyfile({ root: './log' }) :
    require('tracer').colorConsole();
var path = require('path');
var React = require('react/addons');
var koa = require('koa');
var serveStatic = require('koa-static');
var server = koa();
var router = require('router');

const mode = process.env.NODE_ENV !== 'server' ? 'dev' : 'prod';
const PORT = process.argv[2] || 3030;

logger.info(`Bringing up server in ${ mode } mode on port ${ PORT }`);

function renderFullPage(Root, data) {
    return new Promise(function(resolve, reject) {
        var props = { data: data };
        var markup = React.renderToString(
            React.createElement(Root, props)
        );
        var html = `
<!doctype html>
<html>
    <head>
        <title>JoeNoodles</title>
    </head>
    <body>
        <div id="app">${markup}</div>
        <script type="text/javascript" src="/client.js"></script>
        <script type="text/javascript">
        JN(${JSON.stringify(props)});
        </script>
    </body>
</html>`;
        resolve(html);
    });
}

function fetchContent(contentDescriptor) {
    return new Promise(function(resolve, reject) {
        // Todo - fetch this stuff from DB
        resolve({
            id: contentDescriptor.id,
            content: "foo bar " + contentDescriptor.id,
            title: "Title " + contentDescriptor.id
        });
    });
}

function *getDataForMatchedRoutes(state) {
    var routesNeedingData = state.routes
        .filter(route => route.handler.getContentDescriptor);

    var data = {};

    console.log(routesNeedingData)

    for (let i = 0; i < routesNeedingData.length; i++) {
        let route = routesNeedingData[i];
        console.log(state)
        let cd = route.handler.getContentDescriptor(state.query);
        data[route.name] = yield fetchContent(cd);
    }

    return data;
}


function isStatic(activePath) {
    return /\.(js|png|svg|css|ico)$/.test(activePath);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Koa Middleware
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Request processing timer
server.use(function *(next) {
    var start = Date.now();
    yield next;
    var delta = Date.now() - start;
    logger.info(`${this.path}\t${delta}ms`);
});

// Static assets
const staticPath = path.resolve(__dirname, '..', '..', 'dist');
logger.info("Serving static assets from " + staticPath);
server.use(serveStatic(staticPath));

// React full-page server-side rendering middleware
server.use(function *(next) {
    var activePath = this.path;
    if (!isStatic(activePath)) {
        var args = yield router(activePath);
        var data = yield* getDataForMatchedRoutes(args[1]);
        var html = yield renderFullPage(args[0], data);
        this.body = html;
    }
    yield next;
});


server.listen(PORT, function(err) {
    if (err) {
        logger.error(`Failed to bring up server on ${PORT}. Error: ${err}`);
        return;
    }
    logger.info(`Listening on ${PORT}`);
});
