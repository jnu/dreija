import 'babel-runtime/core-js';

import React from 'react';
import { render } from 'react-dom';
import { Root } from './components';
import configureStore from './configureStore';
import Immutable from 'immutable';


export const load = (data = {}) => {
    const initialRootState = Immutable.fromJS(data.root || {});
    const initialState = Object.assign({}, data, { root: initialRootState });
    const store = configureStore(initialState);

    render(
        <Root store={ store } />,
        document.getElementById('root')
    );
};
