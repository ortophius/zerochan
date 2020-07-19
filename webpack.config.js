const path = require('path');
const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');
const manifest = path.resolve(__dirname, 'manifest.json');

const index = path.resolve(src, 'index.js');

module.exports = {
    mode: 'development',
    entry: index,
    output: {
        path: dist,
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: '/\.css$/',
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            path: 'path',
        }),
        new HtmlPlugin(),
        new Copy({
            patterns: [
                {
                    from: manifest,
                    to: dist,
                }
            ]
        }),
    ],
}