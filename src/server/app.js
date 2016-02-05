'use strict';

var app = require('express')();
var logger = require('tracer').colorConsole();

var PORT = 3030;


app.get('/', function(req, res) {
    res.send(`
        <!doctype html>
        <html>
            <head>
                <title>JoeNoodles</title>
            </head>
            <body>
                <div>In progress</div>
            </body>
        </html>`
    );
});


app.listen(PORT, function(err) {
    if (err) {
        logger.error(`Failed to bring up server on ${PORT}. Error: ${err}`);
        return;
    }
    logger.info(`Listening on ${PORT}`);
});
