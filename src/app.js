/**
 * Blog server
 */

'use strict';

// util
var _ = require('underscore');
var path = require('path');
var Promise = require('bluebird').Promise;
var logger = require('tracer').colorConsole();

// koa
var koa = require('koa');
var serve = require('koa-static');
var render = require('koa-swig');
var requestLogger = require('koa-logger');
var mount = require('koa-mount');
var Router = require('koa-router');

// swig extensions
var reactSwig = require('swig-react');

// resources
var Blog = require('./BlogResource');


// -- Init ----------------------------------------------------------------- //

var app = koa();
var DEV = process.env.NODE_ENV === 'development';
var renderer;
var v1;
var v1Middleware;

function *$noop() {
    yield null;
}

// -- Renderer ------------------------------------------------------------- //

render(app, {
    root: path.join(__dirname, 'views'),
    autoescape: true,
    cache: 'memory',
    ext: 'html',
    tags: { react: reactSwig.tag },
    extensions: { react: reactSwig.extension },
    opts: {
        reactComponentRoot: path.join(__dirname, 'components')
    }
});


// -- API ------------------------------------------------------------------ //

function APIAccessorFactory(targetStore, getter) {
    return function *accessor() {
        var start = new Date();
        var data = yield getter.call(this);
        var ms = new Date() - start;

        logger.info("API Lookup for %s in %d ms", targetStore, ms);

        yield (this.body = {
            store: targetStore,
            data: _.isArray(data) ? data : [data]
        });
    };
}

v1 = new Router();

v1.get(
    '/post/:id',
    APIAccessorFactory('PostStore', Blog.getPostById)
);

v1.get(
    '/category/:id',
    APIAccessorFactory('PostStore', Blog.getPostByCategory)
);

v1Middleware = v1.middleware();

function getInitialData(path) {
    return new Promise(function(resolve, reject) {
        try {
            var it = v1Middleware.call({
                path: path,
                method: 'GET'
            }, $noop());

            var output = {};
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
                    if (val) {
                        output[val.store] = val.data;
                    }
                    resolve(output);
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

    if (!isStatic(path) && !isApiRequest(path)) {

        var start = new Date();
        var data = yield getInitialData(path);
        var time = new Date() - start;

        logger.info("Initial data compositing for %s: %d ms ", path, time);

        yield this.render('index', {
            env: DEV ? 'dev' : 'min',
            title: 'Title',
            path: path,
            data: data
        });
    } else {
        yield next;
    }
};


// -- Install Middleware --------------------------------------------------- //

app.use(requestLogger());
app.use(serve('.'));
app.use(mount('/v1', v1Middleware));
app.use(renderer);

// -- Start ---------------------------------------------------------------- //

app.listen(8008);