/**
 * App browser entry point
 */

import React from 'react/addons';
import runRouter from 'router';

export default function start(state, callback) {
    runRouter().then(result => {
        var Root = result[0];
        React.render(
            React.createElement(Root, state),
            document.getElementById('app'),
            callback
        );
    });
}
