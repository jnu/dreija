import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { history } from '../history';
import { Routes } from './Routes';


export default class root extends Component {

    render() {
        return (
            <Provider {...this.props}>
                <Router history={ history }>
                    <Routes />
                </Router>
            </Provider>
        );
    }

}
