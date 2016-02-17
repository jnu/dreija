import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './App';
import Home from './Home';
import Post from './Post';

export default (
    <Route path="/" component={ App }>
        <IndexRoute component={ Home } />
        <Route path="post/:id" component={ Post } />
    </Route>
);
