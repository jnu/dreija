import dreijaConfig from 'dreija-config';
import { Root } from './src/shared/components';
import { Route } from 'react-router';
import React from 'react';


class Dreija {

    constructor(initialState = {}) {
        this.state = Object.assign({
            routes: null,
            port: null,
            dbhost: null,
            dbname: null,
            root: null
        }, initialState);
    }

    routes(newRoutes) {
        if (newRoutes) {
            this.state.routes = newRoutes;
            return this;
        }
        return this.state.routes;
    }

    root(newRoot) {
        if (newRoot) {
            this.state.root = newRoot;
            return this;
        }
        return this.state.root;
    }

    port(newPort) {
        if (newPort) {
            this.state.port = newPort;
            return this;
        }
        return this.state.port;
    }

    dbhost(newDbHost) {
        if (newDbHost) {
            this.state.dbhost = newDbHost;
            return this;
        }
        return this.state.dbhost;
    }

    dbname(newDbName) {
        if (newDbName) {
            this.state.dbname = newDbName;
            return this;
        }
        return this.state.dbname;
    }

}


// TODO- inject this in build, not in actual code
const DummyDefaultCmp = () => (
    <div>
        <p>It works!</p>
        <p>Supply your own routes to make something awesome.</p>
    </div>
);


const dreija =  new Dreija({
    port: 3030,
    routes: (
        <Route path="/" component={ DummyDefaultCmp } />
    ),
    dbhost: 'http://localhost:5984',
    root: Root
});

if (dreijaConfig) {
    dreijaConfig(dreija);
}

export default dreija;
