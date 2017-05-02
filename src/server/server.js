import path from 'path';
import fs from 'fs';
import express from 'express';
import spiderDetector from 'spider-detector';
import bodyParser from 'body-parser';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { match } from 'react-router';
import proxy from 'express-http-proxy';
import { encode } from '../shared/lib/encoding';
import Immutable from 'immutable';
import dreija from '../../';
import configureStore from '../shared/configureStore';
import template from '../template/index.html';
import runtime from 'dreija-runtime';
import logger from '../../lib/logger';
import expressSession from 'express-session';
import uuid from 'node-uuid';
import ensureArray from '../shared/lib/util/ensureArray';
import csurf from 'csurf';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import redis from 'redis';
import CouchClient from './couch';
import RedisStoreFactory from 'connect-redis';
import User from './user';
import DREIJA_VIEWS from './views';
import DREIJA_AUTH from './auth';


const RedisStore = RedisStoreFactory(expressSession);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Runtime config
//
// Dynamic module injected by the build
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const { headScripts } = runtime;
const headScriptBlock = headScripts ?
    ensureArray(headScripts).map(s => `<script src="${s}"></script>`).join('\n') : '';



/**
 * Create a compiled template that fills in values from an input object. This
 * is much faster than string replace.
 *
 * The compiled template parameter names are derived from <!-- --> comments in
 * the HTML string. So, a comment like <!-- FOO --> will be replaced by a
 * reference to params['foo'] when the template function is called. This works
 * as well for JavaScript block-style comments in block style: */
// I.e., like this: /** FOO */
 /*
 * Missing values are silently ignored when the template function is called,
 * but note that the resulting template can be recompiled from the output.
 *
 * For example,
 * const tpl1 = `
 * <div>
 *     <div><!-- FOO --></div>
 *     <div><!-- BAR --></div>
 * </div>
 * `;
 *
 * const cTpl1 = compileTemplate(tpl1);
 * const tpl2 = cTpl1({ FOO: 'hello' });
 *
 * tpl2 === `
 * <div>
 *     <div>hello</div>
 *     <div><!-- BAR --></div>
 * </div>
 * `
 *
 * Now, tpl2 can itself be compiled into a new template.
 * @return {Function}
 */
function compileTemplate(tpl) {
    const fromObj = tpl.replace(/([^\\])?"/g, '$1\\"')
                     // TODO could preserve newlines. Right now just prevent
                     // them from busting the compiled template.
                     .replace(/([^\\])?\n/g, '$1\\\n')
                     .replace(/\<\!\-\-\s*(\w+)\s*\-\-\>/g, '" + (o.hasOwnProperty("$1") ? o["$1"] : "<!-- $1 -->") + "')
                     .replace(/\/\*\*\s*(\w+)\s*\*\//g, '" + (o.hasOwnProperty("$1") ? o["$1"] : "/** $1 */") + "');
    const script = 'return "' + fromObj + '";';
    return new Function('o', script);
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Constants
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const title = dreija.title();

const Root = dreija.root();

const DB_HOST = dreija.dbhost() || 'localhost';

const DB_PORT = dreija.dbport() || '5984';

const DB_NAME = dreija.dbname();

const PORT = dreija.port();

const REDIS_HOST = dreija.redishost() || 'localhost';

const REDIS_PORT = dreija.redisport() || 6379;

const DB_PATH = `http://${DB_HOST}:${DB_PORT}`;

const DREIJA_DESIGN_DOC = 'dreija_v0';

const DREIJA_CUSTOM_DOC = 'app';

// Bind certain static initial variables to the template.
const initialTemplate = compileTemplate(template);

const injectHead = [];
const injectBody = [];

dreija.injections().forEach(function(spec) {
    let dest;

    if (spec.location === 'head') {
        dest = injectHead;
    } else if (spec.location === 'body') {
        dest = injectBody;
    } else {
        throw new Error('Invalid injection destination: ' + spec.location);
    }

    let attrs = [];
    if (spec.attrs) {
        for (let key in spec.attrs) {
            if (spec.attrs.hasOwnProperty(key)) {
                attrs.push(key + '="' + spec.attrs[key].replace(/"/g, '\\"') + '"');
            }
        }
    }

    if (!spec.tag) {
        throw new Error('Missing tag');
    }

    // Create element from tag and attrs.
    let el = '<' + spec.tag + ' ' + attrs.join(' ');
    // Empty non-script tags can be self-closed.
    if (!spec.content && !spec.tag.toLowerCase() === 'script') {
        el += ' />';
    } else {
        el += '>' + (spec.content || '') + '</' + spec.tag + '>';
    }

    // Add to the proper injection target.
    dest.push(el);
});

const initialTplParams = {
    BUNDLE: headScriptBlock,
    TITLE: title,
    INJECT_HEAD: injectHead.join(''),
    INJECT_BODY: injectBody.join('')
};

const tpl = compileTemplate(initialTemplate(initialTplParams));


/**
 * Secrets. Hopefully extended / overwritten with keys provided with a CLI flag.
 */
const secrets = {
    sessionSecret: 'This is not secret.'
};

/**
 * CLI config settings.
 * @type {Object}
 */
const runtimeConfig = {
    /**
     * App name that will be used to form the OAuth2 callback.
     * @type {String}
     */
    host: `http://127.0.0.1:${PORT}`
};


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Parse CLI
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let argv = process.argv.slice();
while (argv.length) {
    let arg = argv.shift();
    switch (arg) {
        case '-s':
        case '--secrets':
            let secretsPath = argv.shift();
            try {
                let secretsJson = JSON.parse(
                    fs.readFileSync(secretsPath, 'utf-8')
                );
                Object.assign(secrets, secretsJson);
                logger.info('Loaded external secrets');
            } catch (e) {
                logger.error(`Error parsing secrets file ${secretsPath}`, e);
            }
            break;
        case '-h':
        case '--host':
            runtimeConfig.host = argv.shift();
            break;
        default:
            if (arg[0] === '-') {
                logger.warn(`Unrecognized flag ${arg}`);
            }
    }
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Instantiate clients and things
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const app = express();

const redisClient = new redis.RedisClient({
    host: REDIS_HOST,
    port: REDIS_PORT
});

const couchClient = new CouchClient({
    host: DB_HOST,
    port: DB_PORT,
    name: DB_NAME,
    designDoc: DREIJA_DESIGN_DOC,
    user: secrets.couchdb.user,
    password: secrets.couchdb.password,
    redisClient
});

const userModel = new User({
    couchClient,
    design: DREIJA_DESIGN_DOC
});


/**
 * Ensure user is logged in
 */
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    logger.warn('Attempting to access restricted resource from session', req.session);
    res.redirect('/login');
}

/**
 * Prevent caching of this resource
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function noCache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}


/**
 * Make a JSON error and configure the response. Use in an intercept;
 * this doesn't actually send the data directly.
 * @param  {Response} res
 * @param  {Number} code
 * @param  {String?} message
 * @return {APIError}
 */
function makeInterceptError(res, code, message = null) {
    res.status(code);
    return message;
}

function getCurrentUser(req, opts = { private: false }) {
    const user = req ? req.user : null;
    const info = {
        id: null,
        roles: null,
        csrfToken: req ? req.csrfToken() : null,
        cookie: null
    };

    // If user is not authed, return what we have.
    if (user) {
        // Attach user info to object.
        info.id = user._id;
        info.roles = user.roles;

        // Add private info to hash if requested.
        if (opts.private) {
            info.cookie = req.headers ? req.headers['cookie'] : null;
        }
    }

    return info;
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Routes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Handle admin route with sessions
app.use(expressSession({
    genid: () => uuid.v4(),
    secret: secrets.sessionSecret,
    resave: true,
    saveUninitialized: false,
    store: new RedisStore({
        client: redisClient
    })
}));

// Auth stuff
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    userModel.findById(id)
        .then(user => done(null, user))
        .catch(err => {
            logger.error('Failed to deserialize user!', err);
            done(null, false);
        });
});
passport.use(new GoogleStrategy({
        clientID: secrets.oauth.google.clientId,
        clientSecret: secrets.oauth.google.clientSecret,
        callbackURL: `${runtimeConfig.host.replace(/\/$/, '')}${secrets.oauth.google.callbackPath}`
    },
    (req, accessToken, refreshToken, profile, done) => {
        logger.info(`Successful google auth for ${profile.id}`);
        // TODO keep more info from google profile
        userModel.findOrCreate({ googleId: profile.id })
            .then(user => done(null, user), done);
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(csurf());
app.use(bodyParser.json());


// Authentication
app.get('/auth/google', passport.authenticate('google', { scope: [
    'profile',
    'email'
]}));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: dreija.loginRoute().failure,
        successRedirect: dreija.loginRoute().success
    })
);

// Information for frontend about current user.
app.get('/auth/info', noCache, ensureAuth, (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
        res.status(400).send({});
        return;
    }

    res.send(user);
});

app.get('/db/admin', ensureAuth, proxy(DB_PATH, {
    forwardPath: (req, res) => {
        const forwardPath = `/${DB_NAME}/_design/views/_views/admin`;
        logger.info(`Forwarding admin index to ${DB_PATH}${forwardPath}`);
        return forwardPath;
    },
    intercept: (rsp, data, req, res, callback) => {
        res.set('transfer-encoding', '');
        callback(null, data);
    }
}));



/**
 * Deal with errors that come back from querying Couch views.
 * @param  {Response} res
 * @param  {Error} e
 */
function handleCouchRequestError(key, res, e) {
    logger.warn(`${key} FAILED`, e);
    switch (e && e.message) {
        case 'unauthorized':
            return res.sendStatus(401);
        case 'forbidden':
            return res.sendStatus(403);
        default:
            res.sendStatus(500);
    }
}

/**
 * Get hash of relevant auth info from request
 * @param  {Request} req
 * @return {AuthSummary}
 */
function getRequestAuth(req) {
    return {
        authed: req.isAuthenticated(),
        roles: req.user && req.user.roles
    };
}

/**
 * View: list all in given index
 */
app.get('/db/view/:view', (req, res) => {
    const view = req.params.view;
    const q = req.query && req.query.q;
    const query = q ? [q] : null;
    logger.info(`VIEW ALL ${DREIJA_CUSTOM_DOC} ${view} - ${q || '[no query]'}`);
    couchClient.getAllFromView(DREIJA_CUSTOM_DOC, view, query, getRequestAuth(req))
        .then(results => res.send({ resource: results }))
        .catch(e => handleCouchRequestError('VIEW ALL', res, e));
});

/**
 * View: list one from given index matching ID
 */
app.get('/db/view/:view/:id', (req, res) => {
    const { view, id } = req.params;
    logger.info(`VIEW ONE ${DREIJA_CUSTOM_DOC} ${view} ${id}`);
    couchClient.getOneFromView(DREIJA_CUSTOM_DOC, view, [id], getRequestAuth(req))
        .then(result => res.send({ resource: result }))
        .catch(e => handleCouchRequestError('VIEW ONE', res, e));
});

/**
 * Resource: get a resource by ID directly
 */
app.get('/db/resource/:id', ensureAuth, (req, res) => {
    const { id } = req.params;
    logger.info(`GET ID ${id}`);
    couchClient.get(id).then(result => res.send({ resource: result }));
});

app.post('/db/resource', (req, res) => {
    const json = req.body;
    logger.info(`PUT NEW ${json}`);
    couchClient.putWithAuth(DREIJA_CUSTOM_DOC, json, getRequestAuth(req))
        .then(result => res.send({ resource: result }))
        .catch(e => handleCouchRequestError('PUT NEW', res, e));
});


// TODO post route for creating posts
// TODO put route for updating posts
// TODO delete route for deleting posts

app.get('/db/posts/:id', proxy(DB_PATH, {
    forwardPath: (req, res) => {
        const forwardPath = `/${DB_NAME}/${req.params.id}`;
        logger.info(`Forwarding post request to ${DB_PATH}${forwardPath}`);
        return forwardPath;
    },
    intercept: (rsp, data, req, res, callback) => {
        let json;
        let dataAsStr;

        // Try to parse entity from couch buffer
        try {
            dataAsStr = data.toString();
            json = (data && dataAsStr) ? JSON.parse(dataAsStr) : null;
        } catch (e) {
            logger.error('Error parsing DB data', e, data);
            json = {
                error: '__invalid__',
                data,
                str: dataAsStr
            };
        }

        logger.info('DB entity parse result:', json);

        // Detect errors that occurred during parsing
        if (!json || json.error) {
            logger.error('DB access error', json);

            switch (json ? json.error : 'not_found') {
                case 'not_found':
                    callback(makeInterceptError(res, 404, 'not_found'));
                    return;
                case '__invalid__':
                    callback(makeInterceptError(res, 500, 'invalid response'));
                    return;
                default:
                    callback(makeInterceptError(res, 500, 'unknown'));
            }
        }

        // Make sure resource is fit to be returned, or user is authed.
        if (json.public !== true && !req.isAuthenticated()) {
            logger.info(`Insufficient perms to access resource.`);
            return callback(makeInterceptError(res, 403, 'forbidden'));
        }

        // NOTE see /db/posts intercept comment
        res.set('transfer-encoding', '');
        callback(null, data);
    }
}));

// Static assets directory
app.use('/public', express.static(path.join('.', 'dist', 'public')));

// Detect when static pages should be sent
app.use(spiderDetector.middleware());

// Single page app = single route handler. Define as middleware so it always
// gets called (unless one of the db routes got matched above).
app.use(function handleIndexRoute(req, res, next) {
    const USE_STATIC = req.isSpider();
    const initUrl = req.url;
    const store = configureStore({
        root: Immutable.Map(),
        user: getCurrentUser(req, { private: true })
    });

    // TODO treat admin routes separately? Also need to measure perf.
    const routes = dreija.getRoutesWithStore(store);

    res.header('Content-Type', 'text/html; charset=utf-8');

    logger.info("Handling default SPA with request", initUrl);

    // Run router to match requests
    match({ routes, location: initUrl }, (err, redirectLocation, renderProps) => {
        if (err) {
            logger.error('Failed to match route', err);
            res.status(500).send(err);
            return;
        }

        if (redirectLocation) {
            const redirect = redirectLocation.pathname + redirectLocation.search;
            logger.warn('Redirecting to', redirect);
            res.redirect(redirect);
            return;
        }

        if (renderProps) {
            logger.info('Rendering page');
            // Set initial store routing state based on requested path

            Promise.all(
                renderProps.components.map(cmp => {
                    logger.info(
                        'PREFETCH',
                        cmp.name || cmp.displayName,
                        cmp.fetchData ? 'No data requested.' : 'fetching!'
                    );
                    return cmp.fetchData && cmp.fetchData(
                        store.dispatch,
                        renderProps.params
                    );
                })
            )
                .then(() => {
                    logger.info('Fetched data, rendering page. Static:', USE_STATIC);

                    // Choose renderer based on whether static markup is desired
                    const renderMethod = USE_STATIC ?
                        renderToStaticMarkup :
                        renderToString;

                    // HACK fix for non-deterministic location key. Must do the
                    // same on the client on init so they match on page load
                    // and React circumvents a re-render.
                    renderProps.location.key = 'INIT';
                    // Render to a string
                    const embeddableMarkup = renderMethod(createElement(Root, {
                        store,
                        ...renderProps
                    }));

                    // Inject markup into page
                    const tplParams = {
                        MARKUP: embeddableMarkup,
                        DATA: ''
                    };

                    // Encode store data and inject it for bootstrapping, if
                    // this is not a static page.
                    if (!USE_STATIC) {
                        const encodedData = encode(store.getState());
                        tplParams['DATA'] = `JN.load('${encodedData}');`;
                    }

                    res.send(tpl(tplParams));
                }, e => {
                    logger.error('Failed to fetch data for', initUrl, 'Error:', e);
                })
                .catch(e => {
                    logger.error('RENDER FAIL', initUrl, e);
                    res.status(500).send(e);
                });
        }
        else {
            logger.error('React router gave 404 on', initUrl);
            res.status(404).send('not found');
        }
    });
});



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Init
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Start the server, returning a promise that resolves when it's up.
 * @param  {Number} options.port
 * @return {Promise<void>}
 */
function startServer({ port }) {
    return new Promise((resolve, reject) => {
        app.listen(port || 3030, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

/**
 * Ping dependent services to make sure the server can start.
 * @return {Promise<void>}
 */
function pingServices() {
    const services = [
        {
            name: 'couchdb',
            ping: () => couchClient.ping()
        },
        {
            name: 'redis',
            ping: () => new Promise((resolve, reject) => {
                const startTs = Date.now();
                (function wait() {
                    const result = redisClient.ping();
                    if (result) {
                        resolve(true);
                    } else if (Date.now() - startTs > 1000) {
                        resolve(false);
                    } else {
                        setTimeout(wait, 50);
                    }
                }());
            })
        }
    ];

    return Promise.all(
        services.map(s => s.ping())
    ).then(results => {
        return results.every((val, i) => {
            if (!val) {
                logger.error(`Failed to find ${services[i].name}`);
            }
            return val;
        });
    })
    .then(ready => {
        if (!ready) {
            throw new Error('services not available');
        }
    });
}

/**
 * Start app
 * @param  {Number} options.port
 * @return {Promise<void>}
 */
function start(opts) {
    return couchClient
        .ensureCouchDb()
        .then(() => couchClient.ensureViews(
            DREIJA_DESIGN_DOC,
            DREIJA_VIEWS,
            DREIJA_AUTH
        ))
        .then(() => couchClient.ensureViews(
            DREIJA_CUSTOM_DOC,
            dreija.views(),
            dreija.auth()
        ))
        .then(() => startServer(opts));
}



// Start up
if (require.main === module) {
    Promise.resolve()
        .then(() => pingServices())
        .then(() => start({ port: PORT }))
        .then(() => logger.info(`Listening on ${PORT}!`))
        .catch(e => logger.error(`Failed to bring up server on ${PORT}`, e));
}
// Use as module
else {
    module.exports = {
        dreija,
        app,
        start
    };
}
