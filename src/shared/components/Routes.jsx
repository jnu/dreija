import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './views/App';
import Home from './views/Home';
import Post from './views/Post';

export default (
    <Route path="/" component={ App }>
        <IndexRoute component={ Home } />
        <Route path="post/:id" component={ Post } />
    </Route>
);
