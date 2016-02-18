import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';
import { browserHistory } from 'react-router';
import { syncHistory, routeReducer } from 'react-router-redux';
import { BROWSER } from './env';


const loggerMiddleware = createLogger();
const reduxRouterMiddleware = BROWSER && syncHistory(browserHistory);

const reducer = combineReducers({ root: rootReducer, routing: routeReducer });

const middleware = [
    thunkMiddleware,
    DEBUG && BROWSER && loggerMiddleware,
    reduxRouterMiddleware
].filter(x => !!x);


export default function configureStore(initialState) {
    const store = createStore(
        reducer,
        initialState,
        applyMiddleware(...middleware)
    );

    if (BROWSER) {
        reduxRouterMiddleware.listenForReplays(store);
    }

    return store;
}
