import React from 'react';
import { connect } from 'react-redux';
import { openPost, openPage } from '../actions';

function Home({ index, openPost, openPage }) {
    return (
        <div>
            Home page. Index:
            <pre>{JSON.stringify(index, null, '  ')}</pre>
            <button onClick={ () => openPost(4) }>Go to post 4</button>
            <button onClick={ () => openPage('about') }>Go to page 'about'</button>
        </div>
    );
}

export default connect(
    state => ({ index: state.index }),
    { openPost, openPage }
)(Home);
