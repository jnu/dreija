import React, { Component } from 'react';
import { connectToStore } from '../../lib/decorators/redux';
import { Link } from 'react-router';
import { fetchIndexIfNecessary } from '../../actions';
import Immutable from 'immutable';

@connectToStore
class Home extends Component {

    static deriveProps(state) {
        let posts = state.root.get('data').filter((v, k) => v.get('type') === 'post');

        return {
            isFetchingIndex: state.root.get('isFetchingIndex'),
            posts: posts || Immutable.Map(),
            state
        };
    }

    static fetchData(dispatch) {
        return dispatch(fetchIndexIfNecessary());
    }

    componentDidMount() {
        let { dispatch } = this.props;
        Home.fetchData(dispatch);
    }

    _createPostsList(posts) {
        return posts.map((v, k) => (
            <div key={ k }>
                <Link to={ `post/${k}` }>{ v.get('title') }</Link>
            </div>
        )).toList().toJS();
    }

    render() {
        if (this.props.isFetchingIndex) {
            return (<div>Wait!</div>);
        }
        return (
            <div>
                Home page. Index:
                <div>
                    { this._createPostsList(this.props.posts) }
                </div>
                <button>Go to post 4</button>
                <button>Go to page 'about'</button>
            </div>
        );
    }
}

export default Home;
