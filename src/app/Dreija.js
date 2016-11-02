export default class Dreija {

    constructor(initialState = {}) {
        this.state = Object.assign({
            routes: null,
            port: null,
            dbhost: null,
            dbname: null,
            root: null,
            redishost: null,
            redisport: null
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

    redishost(newRedisHost) {
        if (newRedisHost) {
            this.state.redishost = newRedisHost;
            return this;
        }
        return this.state.redishost;
    }

    redisport(newRedisPort) {
        if (newRedisPort) {
            this.state.redisport = newRedisPort;
            return this;
        }
        return this.state.redisport;
    }

}
