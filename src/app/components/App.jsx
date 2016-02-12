import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchIndexIfNecessary } from '../actions';


export default class App extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.isFetchingIndex) {
            return (<div>Wait!</div>);
        }
        return (
            <div className='App'>
                loaded: <pre>{ JSON.stringify(this.props.state, null, '  ') }</pre>
            </div>
        );
    }

    static getPropsFromState(state) {
        let posts = state.root.get('data').filter((v, k) => v.get('type') === 'post');

        return {
            isFetchingIndex: state.root.get('isFetchingIndex'),
            posts: posts.toJS() || [],
            state: state
        };
    }

    static fetchData() {
        return fetchIndexIfNecessary();
    }

}

export default connect(App.getPropsFromState)(App);
