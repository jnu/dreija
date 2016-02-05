var path = require('path');
var DefinePlugin = require('webpack/lib/DefinePlugin');


const APP_ROOT = path.resolve(__dirname, '..', 'src', 'app');

var config = {

    context: APP_ROOT,

    entry: {
        client: './index.js'
    },

    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        library: 'JN',
        libraryTarget: 'var'
    },

    resolve: {
        root: APP_ROOT,
        fallback: path.resolve(__dirname, '..', 'src', 'shared'),
        extensions: ['', '.js', '.jsx']
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel?optional[]=runtime&cacheDirectory'
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
        })
    ]

};

module.exports = config;
