import React, { Component } from 'react';
import { connectToStore } from '../../../lib/decorators/redux';
import { Link } from 'react-router';
import { fetchIndexIfNecessary } from '../../../actions';

const ITEM_HEIGHT = 30;


@connectToStore
class Home extends Component {

    static deriveProps(state) {
        let posts = state.root.get('data').filter((v, k) => v.get('type') === 'post');

        return {
            isFetchingIndex: state.root.get('isFetchingIndex'),
            posts: posts ? posts.toList().toJS() : []
        };
    }

    static fetchData(dispatch) {
        return dispatch(fetchIndexIfNecessary());
    }

    componentDidMount() {
        let { dispatch } = this.props;
        Home.fetchData(dispatch);
    }

    _renderPostItem(post) {
        const {  _id, title } = post;
        return (
            <div key={ _id } className="Home-index-item">
                <Link to={ `/post/${_id}` }>{ title }</Link>
            </div>
        );
    }

    _renderDebug() {
        return DEBUG && (
            <div className="debug">
                <pre>{ JSON.stringify(this.props, null, '  ') }</pre>
            </div>
        );
    }

    render() {
        const { isFetchingIndex, posts } = this.props;

        if (isFetchingIndex) {
            return (<div>Wait!</div>);
        }

        return (
            <div>
                <header>
                    <h1>Peruse</h1>
                </header>
                <div className="Home-index-container" ref="container">
                    { posts.map(this._renderPostItem) }
                </div>
                { this._renderDebug() }
            </div>
        );
    }
}

export default Home;
