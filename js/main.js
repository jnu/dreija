// Blog bootstrapper
requirejs.config({
    baseUrl: '/js',
    //
    paths: {
        jquery          : 'libs/jquery-2.0.2',
        underscore      : 'libs/underscore-1.4.4',
        backbone        : 'libs/backbone-1.0.0',
        blogmachine     : 'libs/blogmachine',
        bootstrap       : 'libs/bootstrap',
        $scrollto       : 'libs/jquery.scrollTo-1.4.6',
        $spritely       : 'libs/jquery.spritely',
        $stickto        : 'libs/jquery.stickto',
        dateformat      : 'libs/dateFormat',
        analytics       : 'libs/analyticstracking',
        utils           : 'libs/utils',
        loader          : 'libs/xloader'
    },
    //
    shim: {
        backbone : {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        //
        $scrollto : ['jquery'],
        //
        $spritely : ['jquery'],
        //
        $stickto : ['jquery'],
        //
        bootstrap : ['jquery'],
        //
        blogmachine : {
            deps: ['jquery', 'underscore', 'backbone'],
            exports: 'BlogMachine'
        }
    }
});

/// Entry point
require([
    'Blog',
    'analytics', 'dateformat', 'utils', 'loader',
    'jquery',
    'bootstrap', '$scrollto', '$spritely', '$stickto'
],

function(Blog) {
    // Start Blog
    window.Blog = Blog.init();

    // Message for the curious
    console.log("You can find my uncompressed and commented source here: https://github.com/jnu/blogmachine");
});


