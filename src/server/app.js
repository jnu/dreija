import path from 'path';
import fs from 'fs';
import express from 'express';
import tracer from 'tracer';
import { renderToString } from 'react-dom/server';
import { Root } from '../app/components';
import configureStore from '../app/configureStore';
import { createElement } from 'react';
import { match } from 'react-router';
import Routes from '../app/components/Routes';
import proxy from 'express-http-proxy';
import { DB_NAME, DB_HOST } from './config';
import { history } from '../app/history';
import { encode } from '../shared/encoding';



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
 * Load the template from the specified path. Result is cached, only loaded once.
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
    forwardPath: (req, res) => `/${DB_NAME}/_design/views/_view/index`
}));

app.get('/db/posts/:id', proxy(DB_HOST, {
    forwardPath: (req, res) => `/${DB_NAME}/${req.params.id}`
}));

app.use('/public', express.static(path.join('.', 'dist', 'public')));


// Single page app = single route handler. Define as middleware so it always
// gets called (unless one of the db routes got matched above).
app.use(function handleIndexRoute(req, res, next) {
    const tpl = getTemplate(path.join('.', 'dist', 'index.html'));

    res.header('Content-Type', 'text/html; charset=utf-8');

    logger.info("Handling default", req.url);

    match({ routes: Routes, location: req.url }, (err, redirectLocation, renderProps) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        if (redirectLocation) {
            res.redirect(redirectLocation.pathname + redirectLocation.search);
            return;
        }

        if (renderProps) {
            // Create string representations for the data and markup to embed in the
            // response HTML.
            const store = configureStore();

            Promise.all(
                renderProps.components.map(cmp => {
                    return cmp.fetchData && cmp.fetchData(store.dispatch, renderProps.params);
                })
            )
                .then(() => {
                    const embeddableMarkup = renderToString(createElement(Root, {
                        store,
                        history
                    }));

                    const encodedData = encode(store.getState());
                    const page = tpl
                        .replace('/** DATA */', `'${encodedData}'`)
                        .replace('<!-- MARKUP -->', embeddableMarkup);

                    res.send(page);
                });
        }
        else {
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
