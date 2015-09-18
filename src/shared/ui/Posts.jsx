
import React from 'react/addons';
import { Link } from 'react-router';
import { INDEX } from 'constants/ResourceConstants';

const POSTS_RESOURCE_ID = 'posts';

export default class Posts extends React.Component {

    static getContentDescriptor() {
        return {
            id: POSTS_RESOURCE_ID,
            type: INDEX
        }
    }

    render() {
        return (
            <div><h2>Foo</h2>
            <Link to="post" params={ { id: 'foo' } }>Foo</Link>
            </div>
        );
    }

}
