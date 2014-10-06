/**
 * Blog server
 */

'use strict';

// util
var path = require('path');
var Promise = require('bluebird').Promise;
var logger = require('tracer').colorConsole();
var fs = require('fs');
var dot = require('dot');

// koa
var koa = require('koa');
var serve = require('koa-static');
var requestLogger = require('koa-logger');
var mount = require('koa-mount');
var Router = require('koa-router');

// react
var React = require('react');
var MainCmp = require('./components/Router');

// resources
var Blog = require('./BlogResource');
var BlogClient = require('./util/BlogClient');


// -- Init ----------------------------------------------------------------- //

var app = koa();
var DEV = process.env.NODE_ENV === 'development';
var layoutStr = fs.readFileSync(
    path.join(__dirname, './views/index.html'), 'utf8'
);
var layout = dot.template(layoutStr);
var renderer;
var v1;
var v1Middleware;

function *$noop() {
    yield null;
}


// -- API ------------------------------------------------------------------ //

function APIAccessorFactory(getter) {
    return function *accessor() {
        var start = new Date();
        var data = yield getter.call(this);
        var ms = new Date() - start;

        logger.info("API Lookup in %d ms", ms);

        yield (this.body = data);
    };
}

v1 = new Router();

v1.get(
    '/post/:id',
    APIAccessorFactory(Blog.getPostById)
);

v1.get(
    '/category/:id',
    APIAccessorFactory(Blog.getPostByCategory)
);

v1Middleware = v1.middleware();

function getInitialData(path) {
    return new Promise(function(resolve, reject) {
        try {
            var it = v1Middleware.call({
                path: path,
                method: 'GET'
            }, $noop());

            var ret;
            var newVal;

            // The middleware is designed to support asynchronous retrievals,
            // so iterate over it and resolve the promise when possible.
            // XXX: Library function available for this?
            (function iterate(val){
                ret = it.next(val);
                newVal = ret.value;

                if (!ret.done) {
                    // poor man's "is it a promise?" test
                    if (newVal && "then" in newVal) {
                        // wait on the promise
                        newVal.then(iterate);
                    }
                    // immediate value: just send right back in
                    else {
                        // avoid synchronous recursion
                        setTimeout(function(){
                            iterate(newVal);
                        }, 0);
                    }
                } else {
                    resolve(val);
                }
            })();
        } catch (err) {
            reject(err);
        }
    });
}


// -- Renderer ------------------------------------------------------------- //

function isStatic(path) {
    return /\.(js|css|png|ico)$/.test(path);
}

function isApiRequest(path) {
    return /^\/v1\//.test(path);
}

renderer = function *(next) {
    var path = this.path;
    var start, data, time, html, props;

    if (!isStatic(path) && !isApiRequest(path)) {

        start = new Date();
        data = yield getInitialData(path);
        time = new Date() - start;

        logger.info("Initial data compositing for %s: %d ms ", path, time);

        BlogClient.preload(path, data);
        props = { path: path };
        html = layout({
            debug: DEV,
            title: 'title',
            props: JSON.stringify(props),
            react: React.renderComponentToString(MainCmp(props)),
            preload: JSON.stringify({
                data: data,
                url: path
            })
        });
        BlogClient.clearCache();

        this.body = html;
    }

    yield next;
};


// -- Install Middleware --------------------------------------------------- //

app.use(requestLogger());
app.use(serve(__dirname));
app.use(mount('/v1', v1Middleware));
app.use(renderer);

// -- Start ---------------------------------------------------------------- //

app.listen(8008);