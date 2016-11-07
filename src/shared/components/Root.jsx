import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import dreija from '../../../';

export default class Root extends Component {

    render() {
        return (
            <Provider store={ this.props.store }>
                <Router {...this.props}>
                    { dreija.getRoutesWithStore(this.props.store) }
                </Router>
            </Provider>
        );
    }

}
