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

// router
// XXX: Fork react-router to expose this?
var location = require('../node_modules/react-router/modules/locations/MemoryLocation');

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
        env: DEV ? 'dev' : 'min',
        location: location
    });
}


// -- Router --------------------------------------------------------------- //

function logRequest() {
    console.log('info', 'Location set to ' + location.getCurrentPath());
}

// Set MemoryLocation Store to serialize as "history" so that the browser gets
// gives the router the props { location: "history" }, causing it to take over
// with HTML5 PushState. Thus we have a single page app with completely
// isomorphic routing.
// XXX: Is there a less hacky way to do this?
location.toJSON = function() {
    return "history";
};

function setLocation(path) {
    // Override the store's change handlers with our own. Each request should
    // be treated as independent on the server.
    // XXX: Is there a less hacky way to do this? Right now there's some cruft
    // in setting up the Router - ideally we'd use a subset of it on the server.
    location.setup(logRequest);
    location.replace(path);
}

router = function *() {
    setLocation(this.path);
    yield this.render('index', vars({ title: 'Joe Noodles' }));
};


// -- Install Middleware --------------------------------------------------- //

app.use(serve('.'));
app.use(router);

// -- Start ---------------------------------------------------------------- //

app.listen(8008);