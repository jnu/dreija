import routes from './routes';
import Router from 'react-router';

const isServer = typeof window === 'undefined';

function runRouter(activePath) {
    // Use history location on client
    activePath = isServer ? activePath : Router.HistoryLocation;
    return new Promise(function(resolve, reject) {
        var callback = function(Root, state) {
            resolve([Root, state]);
        };
        Router.run(routes, activePath, callback);
    });
}

export default runRouter;
