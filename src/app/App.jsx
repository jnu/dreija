import React from 'react';
import ReactDOM from 'react-dom';
import {
    createStore,
    combineReducers,
    applyMiddleware
} from 'redux';
import {
    Provider
} from 'react-redux';
import {
    Router,
    Route,
    browserHistory
} from 'react-router';
import {
    syncHistory,
    routeReducer
} from 'react-router-redux';
import reducers from './reducers';


const reducer = combineReducers(Object.assign({}, reducers, {
    routing: routeReducer
}));

const reduxRouterMiddleware = syncHistory(browserHistory);
const createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware)(createStore);

const store = createStoreWithMiddleware(reducer);

reduxRouterMiddleware.listenForReplays(store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <Route path="foo" component={Foo} />
                <Route path="bar" component={Bar} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('root')
);
