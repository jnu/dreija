// web.js -- credit to http://bit.ly/QhckEH

var express = require('express');
var app = express();




var getContent = function(url, callback) {
    var content = '';

    // Spawn phantom.js to render page
    var phantom = require('child_process').spawn('phantomjs', ['/var/www/.node/phantom-server.js', url]);
    phantom.stdout.setEncoding('utf8');

    phantom.stdout.on('data', function(data) {
        content += data.toString();
    });

    phantom.on('exit', function(code) {
        if(code!==0) {
            console.log('Error rendering page '+url+"; code "+code);
        }else{
            callback(content);
        }
    });
};



var respond = function(req, res) {
    // This header is rewritten in nginx
    var host = req.headers['x-forwarded-host'] || 'localhost',
        url = 'http://' + host + req.params[0];

    getContent(url, function(content) {
        res.send(content);
    });
}




app.get(/(.*)/, respond);
app.listen(3000);