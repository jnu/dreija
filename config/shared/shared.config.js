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
                loaders: [
                    'url-loader?limit=20000&mimetype=image/png&name=[hash].[ext]',
                    'image-webpack?{progressive:true, optimizationLevel: 7, pngquant:{quality: "50-90", speed: 2}}'
                ]
            }
        ],
        noParse: [/node_modules[\/\\]tracer/]
    },

    plugins: [

        new DefinePlugin({
            'process.env.NODE_ENV': "'" + process.env.NODE_ENV + "'"
        })

    ]

};

module.exports = config;
