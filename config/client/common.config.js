var path = require('path');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');


console.log(__dirname, __filename)

const APP_ROOT = path.resolve(__dirname, '..', '..', 'src', 'app');

var config = {

    context: APP_ROOT,

    entry: {
        client: ['./index.js']
    },

    output: {
        path: path.resolve(__dirname, '..', '..', 'dist', 'public'),
        publicPath: '/public',
        library: 'JN',
        libraryTarget: 'var'
    },

    resolve: {
        root: APP_ROOT,
        fallback: path.resolve(__dirname, '..', '..', 'src', 'shared'),
        extensions: ['', '.js', '.jsx']
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel?cacheDirectory'
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loaders: ['css', 'less']
            }
        ],
        noParse: [/node_modules[\/\\]tracer/]
    },

    plugins: [

        new DefinePlugin({
            'process.env': {
                NODE_ENV: process.env.NODE_ENV
            }
        }),

        new HtmlWebpackPlugin({
            // Relative to outputPath, which is public/. The template is not
            // actually public, but served from the express server.
            filename: '../index.html',
            template: '../template/index.html',
            inject: 'head'
        })

    ]

};

module.exports = config;
