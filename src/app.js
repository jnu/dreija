/**
 * Blog server
 */

'use strict';

// util
var path = require('path');

// koa
var koa = require('koa');
var serve = require('koa-static');
var render = require('koa-swig');
var logger = require('koa-logger');
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
    // no-op generator
}

// -- Renderer ------------------------------------------------------------- //

render(app, {
    root: path.join(__dirname, 'views'),
    autoescape: true,
    cache: 'memory',
    ext: 'html',
    tags: { react: reactSwig.tag },
    extensions: { react: reactSwig.extension }
});


// -- API ------------------------------------------------------------------ //

function accessor(targetStore, gen) {
    return function *() {
        yield {
            store: targetStore,
            data: yield *gen.call(this)
        };
    };
}

v1 = new Router();

v1.get('/post/:id', accessor('PostStore', Blog.getPostById));

v1Middleware = v1.middleware();

function *getInitialData(path) {
    var gen = v1Middleware.call({
        path: path,
        method: 'GET'
    }, $noop());

    var output = {};

    for (var result of gen) {
        output[result.store] = result.data;
    }

    return output;
}


// -- Renderer ------------------------------------------------------------- //

function isStatic(path) {
    return /\.(js|css|png)$/.test(path);
}

function isApiRequest(path) {
    return /^\/v1\//.test(path);
}

renderer = function *() {
    var path = this.path;

    if (!isStatic(path) && !isApiRequest(path)) {
        yield this.render('index', {
            env: DEV ? 'dev' : 'min',
            title: 'Title',
            path: path,
            data: yield getInitialData(path)
        });
    }
};


// -- Install Middleware --------------------------------------------------- //

app.use(logger());
app.use(serve('.'));
app.use(mount('/v1', v1Middleware));
app.use(renderer);

// -- Start ---------------------------------------------------------------- //

app.listen(8008);