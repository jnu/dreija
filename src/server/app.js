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
import btoa from 'btoa';
import utf8 from 'utf8';



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


/**
 * Create an HTML-embeddable string representation of an object
 * @param  {Object} obj - implements #toJSON
 * @return {string} Base-64 encoded embeddable string
 */
function safeStringify(obj) {
    const str = JSON.stringify(obj);
    // Replace non-parseable characters to avoid unexpected ILLEGAL
    // \u0000 \u0001 \u0002 \u0003 \u0004 \u0005 \u0006 \u0007 \b \n \u000b \f \r \u000e \u000f \u0010 \u0011 \u0012 \u0013 \u0014 \u0015 \u0016 \u0017 \u0018 \u001a \u001b \u001c \u001d \u001e \u001f
    const sanitizedStr = utf8.encode(str);
    // Base-64 encode to avoid parsing mistakes from "</script>" etc.
    return btoa(sanitizedStr);
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

                    const encodedData = safeStringify(store.getState());
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
