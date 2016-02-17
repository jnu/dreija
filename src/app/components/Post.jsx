import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPostIfNecessary } from '../actions';

class Post extends Component {

    static fetchData(dispatch, { id }) {
        return dispatch(fetchPostIfNecessary(id));
    }

    static getPropsFromState(state, props) {
        const posts = state.root.get('data');
        const post = posts.get(props.params.id);
        return { post };
    }

    componentDidMount() {
        const { dispatch, params } = this.props;
        Post.fetchData(dispatch, params);
    }

    render() {
        return (
            <div>This is a post. <pre>{ JSON.stringify(this.props.post, null, ' ') }</pre></div>
        );
    }

};

export default connect(Post.getPropsFromState)(Post);
