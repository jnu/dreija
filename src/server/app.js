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

    const data = {
        root: Immutable.fromJS({
            view: 'home_view',
            currentId: null,
            data: {
                // '234356tef': {
                //     id: '234356tef',
                //     title: 'foobarzap',
                //     category: 'a',
                //     snippet: 'foo',
                //     created: '2015-01-01',
                //     content: 'a b c d e f g h i j k l m n o p .... all fetched async',
                //     type: 'post'
                // },
                // 'asdfasdfsdf': {
                //     id: 'asdfasdfsdf',
                //     title: 'zapbarfoo',
                //     category: 'b',
                //     snippet: 'bar',
                //     created: '2015-01-02',
                //     content: null,
                //     type: 'post',
                //     isFetching: false
                // }
            }
        }),
        routing: null
    };

    match({ routes: Routes, location: '/' }, (err, redirectLocation, renderProps) => {
        console.log(err, redirectLocation, renderProps);
        // Create string representations for the data and markup to embed in the
        // response HTML.
        const store = configureStore(data);
        const embeddableMarkup = renderToString(createElement(Root, {
            store: store
        }));

        const page = tpl
            .replace('/** DATA */', JSON.stringify(store.getState()))
            .replace('<!-- MARKUP -->', embeddableMarkup);

        res.send(page);
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
