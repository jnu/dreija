import React, { Component } from 'react';
import { Provider } from 'react-redux';
import App from './App';
import configureStore from '../configureStore';


const store = configureStore();


export default class root extends Component {

    render() {
        return (
            <Provider store={ store }>
                <App />
            </Provider>
        );
    }

}
