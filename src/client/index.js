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
    const initialRootState = Immutable.fromJS(data.root || {});
    const initialState = Object.assign({}, data, { root: initialRootState });
    const store = configureStore(initialState);

    match({ routes: dreija.routes(), history: browserHistory }, (error, redirectLocation, renderProps) => {
        // HACK fix non-deterministic key on init so it matches server.
        renderProps.location.key = 'INIT';
        render(
            <Root store={ store } {...renderProps} />,
            document.getElementById('root')
        );
    });
};
