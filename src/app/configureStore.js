import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';
import { history } from './history';
import { syncHistory, routeReducer } from 'react-router-redux';
import Immutable from 'immutable';

const loggerMiddleware = createLogger();
const reduxRouterMiddleware = syncHistory(history);

const reducer = combineReducers({ root: rootReducer, routing: routeReducer });

export default function configureStore(initialState) {
    const store = createStore(
        reducer,
        initialState,
        applyMiddleware(
            thunkMiddleware,
            loggerMiddleware,
            reduxRouterMiddleware
        )
    );

    reduxRouterMiddleware.listenForReplays(store);

    return store;
}
