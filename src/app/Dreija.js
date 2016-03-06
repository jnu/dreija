export default class Dreija {

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
