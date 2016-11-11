/**
 * @fileOverview Defines defaults in case user didn't provide any to the CLI.
 * Use this as an opportunity to render documentation.
 */
import { Route, IndexRoute } from 'react-router';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { withData } from '../../../';
import { ensureResourceList, sendResource } from '../../../actions';
import { RESOURCE_STORE_KEY } from '../../../';


const App = ({ children }) => (
    <div>
        <div>This is the app wrapper</div>
        <div>{ children }</div>
    </div>
);


class Greeting extends Component {

    render() {
        return (
            <div>
                <div>It works!</div>
                <div>Supply your own routes to make something awesome.</div>
                <div>You can access <Link to="/sample">Unrestricted Content</Link> using some
                    helpers like <pre>@withData({'{'} fetch: ..., derive: ... {'}'})</pre>
                    which connect remote data to the component through the redux store.
                </div>
                <div>Views and authentication are configured declaratively in a config file.</div>
                <div>You can access <Link to="/admin">Restricted Content</Link> similarly,
                   using a helper like <pre>@withAuth(...roles)</pre> that verifies the
                   user has permission.
                </div>
                <div>Authentication happens through OAuth, so it's easy to <Link to="/login">login</Link>.
                </div>
                <div>TODO: documentation</div>
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
                <div>You are viewing a restricted page</div>
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


@withData({
    fetch: dispatch => dispatch(ensureResourceList('candy')),
    send: (dispatch, text) => {
        return dispatch(sendResource('candy', { content: text }))
            .then(() => dispatch(ensureResourceList('candy')));
    },
    derive: (state, props) => {
        const candy = state.resource.getIn(['candy', RESOURCE_STORE_KEY]);
        return { candy };
    }
})
class Unrestricted extends Component {

    constructor(props) {
        super(props);
        this.state = { text: '' };
        this.handleTextChange = this.handleTextChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    submit() {
        const { text } = this.state;
        this.sendData(text)
            .then(() => this.setState({ text: '' }));
    }

    handleTextChange() {
        this.setState({ text: this.refs.text.value });
    }

    render() {
        const candy = this.props.candy ? this.props.candy.toJS() : {};
        return (
            <div>
                <div>Unrestricted Resource</div>
                <div>Add something:</div>
                <div>
                    <textarea value={this.state.text}
                              ref='text'
                              onChange={this.handleTextChange}>
                    </textarea>
                </div>
                <div><button type="button" onClick={this.submit}>Post</button></div>
                <pre>{ JSON.stringify(candy, null, 2) }</pre>
            </div>
        );
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
                <Route path="/sample" component={ Unrestricted } />
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
                auth: true
            },
            candy: {
                map: doc => {
                    if (doc.type === 'candy') {
                        const { _id } = doc;
                        const val = {
                            id: _id,
                            rev: doc._rev,
                            name: doc.name,
                            type: doc.type,
                            content: doc.content
                        };

                        emit(_id, val);
                    }
                },
                auth: false
            }
        })
        .auth({
            views: {
                candy: false,
                users: true
            },
            update: [
                {
                    match: {
                        field: 'type',
                        value: 'user'
                    },
                    auth: ['admin']
                },
                {
                    match: {
                        field: 'type',
                        value: 'candy'
                    },
                    auth: false
                }
            ]
        })
        .dbname('testcreate')
        .dbhost(env.DBHOST)
        .redishost(env.REDISHOST);
};
