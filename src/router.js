var manifest = require('./manifest');
var crossroads = require('crossroads');


var RouterImplementation = {

    home: function() {
        console.log("router is going home")
    }

};

manifest.routes.map(function(route) {
    var routeHandler = RouterImplementation[route[1]];

    if (DEBUG) {
        assert.isFunction(routeHandler, "Route is implemented");
    }

    crossroads.addRoute(route[0], routeHandler);
});

exports.router = crossroads;