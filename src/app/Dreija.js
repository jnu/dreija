import { getWithAuthUtil } from '../shared/lib/util/routeUtil';


export default class Dreija {

    constructor(initialState = {}) {
        this.state = Object.assign({
            routes: null,
            views: null,
            root: null,
            port: null,
            dbhost: null,
            dbport: null,
            dbname: null,
            redishost: null,
            redisport: null
        }, initialState);

        this._makeGetterSetters([
            // routes has special getter/setters
            'views',
            'root',
            'port',
            'dbhost',
            'dbport',
            'dbname',
            'redishost',
            'redisport'
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

}
