import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';
import { BROWSER } from './env';


const loggerMiddleware = createLogger();

const reducer = combineReducers({ root: rootReducer });

const middleware = [
    thunkMiddleware,
    DEBUG && BROWSER && loggerMiddleware
].filter(x => !!x);


export default function configureStore(initialState) {
    const store = createStore(
        reducer,
        initialState,
        applyMiddleware(...middleware)
    );

    return store;
}
