import React, { Component } from 'react';
import { connectToStore } from '../../../lib/decorators/redux';
import eyeClosePng from 'assets/img/eye_close.png';
import eyeOpenPng from 'assets/img/eye_open.png';
import {
    IS_FETCHING_INDEX_KEY,
    IS_FETCHING_KEY
} from '../../../constants';

const HIDE_STYLE = { display: 'none' };

@connectToStore
class App extends Component {

    static deriveProps(state) {
        let { root } = state;

        let data = root.get('data');

        let isFetchingSomething = !!root.get(IS_FETCHING_INDEX_KEY) || (
            !!data && data.find((v, k) => !!v.get(IS_FETCHING_KEY))
        );

        return { isFetchingSomething };
    }

    render() {
        const { isFetchingSomething } = this.props;
        return (
            <div className="App">
                <header className="App-header">
                    Header stuff
                </header>
                <aside className="App-sidebar">
                    <img src={ eyeOpenPng } style={ isFetchingSomething ? HIDE_STYLE : {} } />
                    <img src={ eyeClosePng } style={ !isFetchingSomething ? HIDE_STYLE : {} } />
                </aside>
                <main className="App-main">
                    { this.props.children }
                </main>
            </div>
        );
    }

}

export default App;
