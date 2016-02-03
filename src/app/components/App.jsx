import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { routeActions } from 'react-router';


function App({ push, children }) {
    return (
        <div>
            <header>
                <div>jnu</div>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
            </header>
            <main>
                <div>{ children }</div>
            </main>
        </div>
    );
}

export default connect(null, routeActions)(App);
