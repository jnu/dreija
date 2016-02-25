import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import dreija from '../../../';


export default class root extends Component {

    render() {
        return (
            <Provider store={ this.props.store }>
                <Router {...this.props}>
                    { dreija.routes() }
                </Router>
            </Provider>
        );
    }

}
