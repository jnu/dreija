import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchIndexIfNecessary } from '../actions';


class App extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let { dispatch } = this.props;
        App.fetchData(dispatch);
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

    static fetchData(dispatch) {
        return dispatch(fetchIndexIfNecessary());
    }

}

export default connect(App.getPropsFromState)(App);
