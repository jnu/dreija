import { getWithAuthUtil } from '../shared/lib/util/routeUtil';


export default class Dreija {

    constructor(initialState = {}) {
        this.state = Object.assign({
            routes: null,
            views: null,
            auth: null,
            loginRoute: null,
            root: null,
            port: null,
            dbhost: null,
            dbport: null,
            dbname: null,
            redishost: null,
            redisport: null,
            title: null,
            injections: [],
        }, initialState);

        this._makeGetterSetters([
            // routes has special getter/setters
            'views',
            'auth',
            'loginRoute',
            'root',
            'port',
            'dbhost',
            'dbport',
            'dbname',
            'redishost',
            'redisport',
            'title'
        ]);
    }

    _makeGetterSetters(props) {
        const instance = this;
        const state = instance.state;

        props.forEach(prop => {
            instance[prop] = val => {
                if (val !== undefined) {
                    state[prop] = val;
                    return instance;
                }
                return state[prop];
            };
        });
    }

    routes(newRoutes) {
        if (newRoutes) {
            this.state.routes = typeof newRoutes === 'function' ? newRoutes : () => newRoutes;
            return this;
        }
        return this.state.routes;
    }

    getRoutesWithStore(store) {
        return this.state.routes({
            withAuth: getWithAuthUtil(store)
        });
    }

    injectScript(script, body) {
        this.state.injections.push({
            tag: 'script',
            location: !!body ? 'body' : 'head',
            attrs: {
                type: 'text/javascript'
            },
            content: script
        });
    }

    inject(injectionSpec) {
        // TODO(jnu) document how to use this.
        this.state.injections.push(injectionSpec);
    }

    injections() {
        return this.state.injections.slice();
    }

}
