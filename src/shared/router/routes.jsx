import React from 'react/addons';
import { Route, NotFoundRoute, DefaultRoute } from 'react-router';
import App from 'ui/App';
import Home from 'ui/Home';
import About from 'ui/About';
import Contact from 'ui/Contact';
import Posts from 'ui/Posts';
import Post from 'ui/Post';
import NotFound from 'ui/NotFound';

const ROUTES = (
    <Route path="/" handler={ App }>
        <DefaultRoute name="home" handler={ Home } />
        <Route name="about" handler={ About } />
        <Route name="contact" handler={ Contact } />
        <Route name="posts" handler={ Posts }>
            <Route name="post" path="/post/:id" handler={ Post } />
        </Route>
        <NotFoundRoute handler={ NotFound } />
    </Route>
);

export default ROUTES;
