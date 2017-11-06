/**
 * Webpack config shared by client and server bundles
 */
var path = require('path');
var DefinePlugin = require('webpack/lib/DefinePlugin');


var config = {

    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            assets: path.resolve(__dirname, '..', '..', 'assets')
        }
    },

    resolveLoader: {
        modules: [
            path.resolve(__dirname, '..', '..', 'node_modules'),
            'node_modules',
        ],
    },

    output: {
        publicPath: '/public/'
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules[\/\\](?!dreija)/,
                use: ['babel-loader?cacheDirectory']
            },
            {
                test: /\.png$/,
                use: [
                    'url-loader?limit=20000&mimetype=image/png&name=[hash].[ext]',
                    'image-webpack?{progressive:true, optimizationLevel: 7, pngquant:{quality: "50-90", speed: 2}}'
                ]
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            }
        ]
    },

    plugins: [

        new DefinePlugin({
            'process.env.NODE_ENV': "'" + process.env.NODE_ENV + "'"
        })

    ]

};

module.exports = config;
