import React, { Component } from 'react';
import { connectToStore } from '../../../lib/decorators/redux';
import { fetchPostIfNecessary } from '../../../actions';


@connectToStore
class Post extends Component {

    static fetchData(dispatch, { id }) {
        return dispatch(fetchPostIfNecessary(id));
    }

    static deriveProps(state, props) {
        const posts = state.root.get('data');
        const post = posts.get(props.params.id);
        return { post };
    }

    componentDidMount() {
        const { dispatch, params } = this.props;
        Post.fetchData(dispatch, params);
    }

    _renderDebug() {
        return DEBUG && (
            <div className="debug">
                <pre>{ JSON.stringify(this.props.post, null, ' ') }</pre>
            </div>
        );
    }

    render() {
        const { post } = this.props;

        return (
            <article className="Post">
                <header>
                    <h2>{ post.get('title') }</h2>
                </header>
                <section className="Post-content">
                    <div dangerouslySetInnerHTML={{ __html: post.get('content') }}></div>
                </section>

                { this._renderDebug() }
            </article>
        );
    }

};

export default Post;
