/**
 * @fileOverview Defines defaults in case user didn't provide any to the CLI.
 * Use this as an opportunity to render documentation.
 */
import { Route } from 'react-router';
import React from 'react';


const Greeting = () => (
    <div>
        <p>It works!</p>
        <p>Supply your own routes to make something awesome.</p>
        <p>TODO: documentation</p>
    </div>
);

export default dreija => {
    dreija.routes(
        <Route path="/" component={ Greeting } />
    );
};
