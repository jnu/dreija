/**
 * Blog server
 */

'use strict';

// util
var path = require('path');
var _ = require('underscore');
var winston = require('winston');
var logger = new winston.Logger();

// koa
var koa = require('koa');
var serve = require('koa-static');
var render = require('koa-swig');

// swig extensions
var reactSwig = require('swig-react');


// -- Init ----------------------------------------------------------------- //

var app = koa();
var DEV = process.env.NODE_ENV === 'development';
var router;


// -- Renderer ------------------------------------------------------------- //

render(app, {
    root: path.join(__dirname, 'views'),
    autoescape: true,
    cache: 'memory',
    ext: 'html',
    tags: { react: reactSwig.tag },
    extensions: { react: reactSwig.extension }
});

function vars(obj) {
    return _.extend({}, obj, {
        env: DEV ? 'dev' : 'min'
    });
}


// -- Router --------------------------------------------------------------- //

function logRequest(path) {
    logger.log('info', 'Location set to ', path);
}

router = function *() {
    logRequest(this.path);
    yield this.render('index', vars({
        title: 'Joe Noodles',
        path: this.path
    }));
};


// -- Install Middleware --------------------------------------------------- //

app.use(serve('.'));
app.use(router);

// -- Start ---------------------------------------------------------------- //

app.listen(8008);