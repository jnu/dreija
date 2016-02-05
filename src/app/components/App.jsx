import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchIndex } from '../actions';


export default class App extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchIndex());
    }

    render() {
        if (this.props.isFetchingIndex) {
            return (<div>Wait!</div>);
        }
        return (
            <div className='App'>
                loaded: <pre>{ JSON.stringify(this.props.posts, null, '  ') }</pre>
            </div>
        );
    }

    getPropsFromState(state) {
        let posts = state.get('data').filter((v, k) => k.get('type') === 'post');

        return {
            isFetchingIndex: state.get('isFetchingIndex'),
            posts: posts.toJS() || []
        };
    }
}

export default connect(App.getPropsFromState)(App);
