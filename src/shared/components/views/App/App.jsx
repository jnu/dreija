import React, { Component } from 'react';
import { Link } from 'react-router';
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
                    <address className="App-header-logo">
                        <Link to="/" className="Link">JNU</Link>
                    </address>
                    <nav className="App-header-nav">
                        <Link to="/post/about" className="Link">about</Link>
                        <Link to="/post/contact" className="Link">contact</Link>
                    </nav>
                </header>
                <aside className="App-sidebar">
                    <img src={ eyeOpenPng } style={ isFetchingSomething ? HIDE_STYLE : {} } />
                    <img src={ eyeClosePng } style={ !isFetchingSomething ? HIDE_STYLE : {} } />
                </aside>
                <main className="App-main">
                    <div className="App-main-wrapper">
                        { this.props.children }
                    </div>
                </main>
            </div>
        );
    }

}

export default App;
