import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchIndexIfNecessary } from '../actions';


class Home extends Component {

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

    componentDidMount() {
        let { dispatch } = this.props;
        Home.fetchData(dispatch);
    }

    render() {
        if (this.props.isFetchingIndex) {
            return (<div>Wait!</div>);
        }
        return (
            <div>
                Home page. Index:
                <pre>{JSON.stringify(this.props.posts, null, '  ')}</pre>
                <button>Go to post 4</button>
                <button>Go to page 'about'</button>
            </div>
        );
    }
}

export default connect(Home.getPropsFromState)(Home);
