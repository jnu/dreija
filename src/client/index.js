import 'babel-runtime/core-js';

import React from 'react';
import { render } from 'react-dom';
import { match, browserHistory } from 'react-router';
import { Root, Routes } from '../shared/components';
import configureStore from '../shared/configureStore';
import Immutable from 'immutable';
import { decode } from '../shared/encoding';


// NB: e30= is encoded '{}'.
export const load = (encoded = 'e30=') => {
    const data = decode(encoded);
    const initialRootState = Immutable.fromJS(data.root || {});
    const initialState = Object.assign({}, data, { root: initialRootState });
    const store = configureStore(initialState);

    match({ routes: Routes, history: browserHistory }, (error, redirectLocation, renderProps) => {
        // XXX This is certainly wrong, but unclear what the right approach is.
        // Without forcing this location the page won't load.
        // store.getState().routing.location = initialState.routing.location;
        render(
            <Root store={ store } {...renderProps} />,
            document.getElementById('root')
        );
    });
};
