import React from 'react/addons';
import { RouteHandler } from 'react-router';

export default class App extends React.Component {

    render() {
        return (
            <div>
                <h1>Site</h1>
                <RouteHandler data={ this.props.data } />
            </div>
        );
    }

}
