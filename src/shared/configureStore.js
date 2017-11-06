import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { rootReducer,
    userReducer,
    resourceReducer
} from './reducers';
import { BROWSER } from './env';


const loggerMiddleware = createLogger();

const reducer = combineReducers({
    root: rootReducer,
    user: userReducer,
    resource: resourceReducer
});

const middleware = [
    thunkMiddleware,
    process.env.NODE_ENV === 'development' && BROWSER && loggerMiddleware
].filter(x => !!x);


export default function configureStore(initialState) {
    const store = createStore(
        reducer,
        initialState,
        applyMiddleware(...middleware)
    );

    return store;
}
