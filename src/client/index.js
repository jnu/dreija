import 'babel-runtime/core-js';

import './index.less';

import React from 'react';
import { render } from 'react-dom';
import { match, browserHistory } from 'react-router';
import { Root } from '../shared/components';
import configureStore from '../shared/configureStore';
import Immutable from 'immutable';
import { decode } from '../shared/lib/encoding';
import dreija from '../../';


// NB: e30= is encoded '{}'.
export const load = (encoded = 'e30=') => {
    const data = decode(encoded);
    // Hydrate selected keys as immutable objects.
    const initialStoreState = ['root', 'resource'].reduce((hash, key) => {
        hash[key] = Immutable.fromJS(data[key] || {});
        return hash;
    }, {});
    const initialState = Object.assign({}, data, initialStoreState);
    const store = configureStore(initialState);
    const routes = dreija.getRoutesWithStore(store);

    match({ routes, history: browserHistory }, (error, redirectLocation, renderProps) => {
        // HACK fix non-deterministic key on init so it matches server.
        renderProps.location.key = 'INIT';
        render(
            <Root store={ store } {...renderProps} />,
            document.getElementById('root')
        );
    });
};
