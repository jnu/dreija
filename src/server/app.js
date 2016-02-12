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
import url from 'url';
import { DB_NAME, DB_HOST } from './config';
import Immutable from 'immutable';
import { history } from '../app/history';


const logger = tracer.colorConsole();

const PORT = process.env.PORT || 3030;

const app = express();


const templateCache = {};

function getTemplate(fn) {
    if (templateCache.hasOwnProperty(fn)) {
        return templateCache[fn];
    }

    return (templateCache[fn] = fs.readFileSync(fn, 'utf-8'));
}



app.get('/db/posts', proxy(DB_HOST, {
    forwardPath: (req, res) => `/${DB_NAME}/_design/views/_view/index`
}));

app.get('/db/posts/:id', proxy(DB_HOST, {
    forwardPath: (req, res) => `/${DB_NAME}/${req.params.id}`
}));


// Single page app, just load this one template
app.get('/', function handleIndexRoute(req, res) {
    const tpl = getTemplate(path.join('.', 'dist', 'index.html'));

    match({ routes: Routes, location: req.url, history }, (err, redirectLocation, renderProps) => {
        if (redirectLocation) {
            res.redirect(redirectLocation.pathname + redirectLocation.search);
            return;
        }

        // Create string representations for the data and markup to embed in the
        // response HTML.
        const store = configureStore();

        Promise.all(renderProps.components.map(cmp => {
            return cmp.fetchData ? cmp.fetchData(store.dispatch) : {};
        }))
            .then(() => {
                const embeddableMarkup = renderToString(createElement(Root, {
                    store,
                    history
                }));

                const page = tpl
                    .replace('/** DATA */', JSON.stringify(store.getState()))
                    .replace('<!-- MARKUP -->', embeddableMarkup);

                res.charset = 'utf8';
                res.send(page);
            });
    });
});


app.use('/public', express.static(path.join('.', 'dist', 'public')));

// Start server
app.listen(PORT, function handleAppStart(err) {
    if (err) {
        logger.error(`Failed to bring up server on ${PORT}. Error: ${err}`);
        return;
    }
    logger.info(`Listening on ${PORT}`);
});
