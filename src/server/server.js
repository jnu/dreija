import path from 'path';
import fs from 'fs';
import express from 'express';
import spiderDetector from 'spider-detector';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { match, createMemoryHistory } from 'react-router';
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



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Runtime config
//
// Dynamic module injected by the build
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const { headScripts } = runtime;
const headScriptBlock = headScripts ?
    ensureArray(headScripts).map(s => `<script src="${s}"></script>`).join('\n') : '';



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Constants
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const tpl = template.replace('<!-- BUNDLE -->', headScriptBlock);

const Root = dreija.root();

const routes = dreija.routes(); // combineRoutes(admin, dreija.routes());

const DB_HOST = dreija.dbhost();

const DB_NAME = dreija.dbname();

const PORT = dreija.port();

const app = express();

/**
 * Secrets. Hopefully extended / overwritten with keys provided with a CLI flag.
 */
const secrets = {
    sessionSecret: 'This is not secret.'
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
        default:
            if (arg[0] === '-') {
                logger.warn(`Unrecognozed flag ${arg}`);
            }
    }
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Routes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Handle admin route with sessions
app.use(expressSession({
    genid: () => uuid.v4(),
    secret: secrets.sessionSecret,
    resave: true,
    saveUninitialized: false
}));

app.use(csurf());

// Authentication
app.post('/auth', (req, res) => {
    // TODO authenticate
});

app.get('/db/posts', proxy(DB_HOST, {
    forwardPath: (req, res) => {
        const forwardPath = `/${DB_NAME}/_design/views/_view/index`;
        logger.info(`Forwarding posts index to ${DB_HOST}${forwardPath}`);
        return forwardPath;
    },
    intercept: (rsp, data, req, res, callback) => {
        // NB Content-length and transfer-encoding are incompatible. Couch
        // might set transfer-encoding, and the proxy middleware blindly sets
        // the content-length.
        // TODO fix this in proxy middleware?
        res.set('transfer-encoding', '');
        callback(null, data);
    }
}));

// TODO post route for creating posts
// TODO put route for updating posts
// TODO delete route for deleting posts

app.get('/db/posts/:id', proxy(DB_HOST, {
    forwardPath: (req, res) => {
        const forwardPath = `/${DB_NAME}/${req.params.id}`;
        logger.info(`Forwarding post request to ${DB_HOST}${forwardPath}`);
        return forwardPath;
    },
    intercept: (rsp, data, req, res, callback) => {
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

    res.header('Content-Type', 'text/html; charset=utf-8');

    logger.info("Handling default SPA with request", req.url);

    const history = createMemoryHistory();
    history.replace(req.url);

    // Run router to match requests
    match({ routes, history }, (err, redirectLocation, renderProps) => {
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
            const store = configureStore({
                root: Immutable.Map(),
                routing: {
                    location: history.createLocation(req.url)
                }
            });
            console.log(store.getState().routing.location)

            Promise.all(
                renderProps.components.map(cmp => {
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

                    // Render to a string
                    const embeddableMarkup = renderMethod(createElement(Root, {
                        store,
                        history
                    }));

                    // Inject markup into page
                    let page = tpl.replace('<!-- MARKUP -->', embeddableMarkup);

                    // Encode store data and inject it for bootstrapping, if
                    // this is not a static page.
                    if (!USE_STATIC) {
                        const encodedData = encode(store.getState());
                        page = page.replace(
                            '/** DATA */',
                            `JN.load('${encodedData}');`
                        );
                    }

                    res.send(page);
                }, e => {
                    logger.error('Failed to fetch data for', req.url, 'Error:', e);
                });
        }
        else {
            logger.error('React router gave 404 on', req.url);
            res.status(404).send('not found');
        }
    });
});



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Init
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (require.main === module) {
    app.listen(PORT, function handleAppStart(err) {
        if (err) {
            logger.error(`Failed to bring up server on ${PORT}. Error: ${err}`);
            return;
        }
        logger.info(`Listening on ${PORT}`);
    });
}
else {
    module.exports = {
        dreija,
        app
    };
}
