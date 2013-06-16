var page = require('webpage').create();
var system = require('system');

var lastReceived = new Date().getTime();
var requestCount = 0;
var responseCount = 0;
var requestIds = [];
var startTime = new Date().getTime();




var _callLoadEvent = function(url, type) {
    var fn = url.substring(url.lastIndexOf("/")),
        m = "link[href$='"+fn+"']";

    if(type==='js') {
        m = "script[src$='"+fn+"']";
    }

    var s = document.querySelectorAll(m);

    if(s) {
        // matching elements were found; choose last
        var el = s[s.length-1];

        // Trigger load event
        var loadEvent = document.createEvent("HTMLEvents");
        loadEvent.initEvent("load", true, true);
        el.dispatchEvent(loadEvent);
    }

};





page.onResourceReceived = function(response) {
    if(requestIds.indexOf(response.id) !== -1) {
        lastReceived = new Date().getTime();
        responseCount++;
        requestIds[requestIds.indexOf(response.id)] = null;
        
        // Manually fire load event on scripts and stylesheets
        var script = response.url.match(/\.(css|js)/i);
        if(script) {
            var type = script[script.length-1]; // "css" or "js"

            // -- remote page injection to fire load event -- //
            setTimeout(function() {
                page.evaluate(_callLoadEvent, response.url, type.toLowerCase());
            }, 200);
            // -- end of remote page injection -- //
        }
    }
};



page.onResourceRequested = function(request) {
    if(requestIds.indexOf(request.id) === -1) {
        requestIds.push(request.id);
        requestCount++;
    }
};



page.open(system.args[1], function () {});





var _testLoaded = function(s) {
    var t = page.evaluate(function(s) {
        return document.querySelectorAll(s).length;
    }, s);
    return t>0;
}


var checkComplete = function() {
    //if((new Date().getTime() - lastReceived > 700 && requestCount===responseCount) || new Date().getTime() - startTime > 7000) {
      
    if(_testLoaded('#content') || new Date().getTime() - startTime > 10000) {  
        clearInterval(checkCompleteInterval);

        console.log(page.content);
        phantom.exit(0);
    }
}




var checkCompleteInterval = setInterval(checkComplete, 1);