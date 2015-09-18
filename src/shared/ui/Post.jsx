
import React from 'react/addons';
import { POST } from 'constants/ResourceConstants';

export default class Post extends React.Component {

    static getContentDescriptor(match) {
        return {
            id: match.id,
            type: POST
        };
    }

    render() {
        var content = this.props.data.post;

        return (
            <div className="post-container">
                <h1>
                    {content.title}
                </h1>
                <div>
                    {content.content}
                </div>
            </div>
        );
    }

}
