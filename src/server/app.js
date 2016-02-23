import path from 'path';
import fs from 'fs';
import express from 'express';
import spiderDetector from 'spider-detector';
import tracer from 'tracer';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { Root, Routes } from '../shared/components';
import configureStore from '../shared/configureStore';
import { createElement } from 'react';
import { match, createMemoryHistory } from 'react-router';
import proxy from 'express-http-proxy';
import { DB_NAME, DB_HOST } from './config';
import { encode } from '../shared/lib/encoding';
import Immutable from 'immutable';
// import utf8 from 'utf8';




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Constants
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const logger = tracer.colorConsole();

const PORT = process.env.PORT || 3030;

const app = express();

/**
 * Cached templates
 * @constant {Object}
 */
const templateCache = {};



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Load the template from the specified path. Result is cached, only loaded
 * once.
 * @param  {string} fn - template file name
 * @return {string}
 */
function getTemplate(fn) {
    if (templateCache.hasOwnProperty(fn)) {
        return templateCache[fn];
    }

    return (templateCache[fn] = fs.readFileSync(fn, 'utf-8'));
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Routes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/db/posts', proxy(DB_HOST, {
    forwardPath: (req, res) => {
        const forwardPath = `/${DB_NAME}/_design/views/_view/index`;
        logger.info(`Forwarding posts index to ${DB_HOST}${forwardPath}`);
        return forwardPath;
    },
    intercept: (rsp, data, req, res, callback) => {
        logger.info(`RSP index posts`, rsp);
        // const parsed = JSON.parse(data.toString('utf8'));
        // const stringified = utf8.encode(JSON.stringify(parsed));
        // logger.info(`Response index posts parsed/encoded data`, parsed);
        // logger.info(`Reponse from index proxy raw data:`, stringified);
        //callback(null, stringified);
        res.send(data);
    }
}));

app.get('/db/posts/:id', proxy(DB_HOST, {
    forwardPath: (req, res) => {
        const forwardPath = `/${DB_NAME}/${req.params.id}`;
        logger.info(`Forwarding post request to ${DB_HOST}${forwardPath}`);
        return forwardPath;
    },
    intercept: (rsp, data, req, res, callback) => {
        logger.info(`Reponse from post proxy:`, data);
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
    const tpl = getTemplate(path.join('.', 'dist', 'index.html'));

    res.header('Content-Type', 'text/html; charset=utf-8');

    logger.info("Handling default SPA with request", req.url);

    const history = createMemoryHistory();
    history.replace(req.url);

    // Run router to match requests
    match({ routes: Routes, history }, (err, redirectLocation, renderProps) => {
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
            logger.error('404 on', req.url);
            res.status(404).send('not found');
        }
    });
});



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Init
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.listen(PORT, function handleAppStart(err) {
    if (err) {
        logger.error(`Failed to bring up server on ${PORT}. Error: ${err}`);
        return;
    }
    logger.info(`Listening on ${PORT}`);
});
