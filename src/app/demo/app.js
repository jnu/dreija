/**
 * @fileOverview Defines defaults in case user didn't provide any to the CLI.
 * Use this as an opportunity to render documentation.
 */
import { Route, IndexRoute } from 'react-router';
import React from 'react';
import { Link } from 'react-router';


const App = ({ children }) => (
    <div>
        <p>This is the app wrapper</p>
        <div>{ children }</div>
    </div>
);

const Greeting = () => (
    <div>
        <p>It works!</p>
        <p>Supply your own routes to make something awesome.</p>
        <p>You can access <Link to="/admin">Restricted Content</Link> through OAuth.</p>
        <p>TODO: documentation</p>
    </div>
);

const Restricted = () => (
    <div>
        <p>You are viewing a restricted page</p>
    </div>
);

const Login = () => (
    <div>
        <a href="/auth/google">Login with Google</a>
    </div>
);


export default (dreija, env) => {
    dreija
        .routes(({ withAuth }) =>
            <Route path="/" component={ App }>
                <IndexRoute component={ Greeting } />
                <Route path="/admin" component={ Restricted } onEnter={ withAuth() } />
                <Route path="/login" component={ Login } />
            </Route>
        )
        .dbname('testcreate')
        .dbhost(env.DBHOST)
        .redishost(env.REDISHOST);
};
