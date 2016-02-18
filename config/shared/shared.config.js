/**
 * Webpack config shared by client and server bundles
 */
var path = require('path');
var DefinePlugin = require('webpack/lib/DefinePlugin');


var config = {

    resolve: {
        fallback: path.resolve(__dirname, '..', '..', 'src', 'shared'),
        extensions: ['', '.js', '.jsx'],
        alias: {
            assets: path.resolve(__dirname, '..', '..', 'assets')
        }
    },

    output: {
        publicPath: '/public/'
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel?cacheDirectory'
            },
            {
                test: /\.png$/,
                loader: 'url-loader?limit=10000&mimetype=image/png&name=[hash].[ext]'
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
