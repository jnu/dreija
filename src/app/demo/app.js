/**
 * @fileOverview Defines defaults in case user didn't provide any to the CLI.
 * Use this as an opportunity to render documentation.
 */
import { Route, IndexRoute } from 'react-router';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { withData } from '../../../';
import { ensureResourceList } from '../../../actions';
import { RESOURCE_STORE_KEY } from '../../../';


const App = ({ children }) => (
    <div>
        <p>This is the app wrapper</p>
        <div>{ children }</div>
    </div>
);

class Greeting extends Component {

    render() {
        return (
            <div>
                <p>It works!</p>
                <p>Supply your own routes to make something awesome.</p>
                <p>You can access <Link to="/admin">Restricted Content</Link> through OAuth.</p>
                <p>TODO: documentation</p>
            </div>
        );
    }
}



@withData({
    fetch: dispatch => dispatch(ensureResourceList('users'))
})
class Restricted extends Component  {
    render() {
        return (
            <div>
                <p>You are viewing a restricted page</p>
                <RestrictedData></RestrictedData>
            </div>
        );
    }
};

@withData({
    derive: (state, props) => {
        const users = state.resource.getIn(['users', RESOURCE_STORE_KEY]);
        return { users };
    }
})
class RestrictedData extends Component {
    render() {
        const users = this.props.users;
        return <pre>{ users ? JSON.stringify(users.toJS(), null, 2) : 'nothing' }</pre>;
    }
}

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
        .views({
            users: {
                map: doc => {
                    if (doc.type === 'user') {
                        const { _id } = doc;
                        const val = {
                            id: _id,
                            rev: doc._rev,
                            name: doc.name,
                            type: doc.type,
                            roles: doc.roles
                        };

                        emit(_id, val);
                    }
                },
                auth: {
                    roles: [],
                    public: false
                }
            }
        })
        .dbname('testcreate')
        .dbhost(env.DBHOST)
        .redishost(env.REDISHOST);
};
