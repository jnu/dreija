import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';
import { history } from './history';
import { syncHistory, routeReducer } from 'react-router-redux';
import { BROWSER } from './env';


const loggerMiddleware = createLogger();
const reduxRouterMiddleware = syncHistory(history);

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

    reduxRouterMiddleware.listenForReplays(store);

    return store;
}
