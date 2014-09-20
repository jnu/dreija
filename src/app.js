/**
 * app.js
 * Blog server
 */

'use strict';

// util
var path = require('path');
var _ = require('underscore');

// koa
var koa = require('koa');
var serve = require('koa-static');
var render = require('koa-swig');
var kroute = require('kroute');

// swig extensions
var reactSwig = require('swig-react');


// -- Init ----------------------------------------------------------------- //

var app = koa();
var router = kroute();
var DEV = process.env.NODE_ENV === 'development';


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

router.get('/', function *() {
    yield this.render('home', vars({ title: 'Joe Noodles' }));
});


// -- Install Middleware --------------------------------------------------- //

app.use(router);

app.use(serve('.'));


// -- Start ---------------------------------------------------------------- //

app.listen(8008);