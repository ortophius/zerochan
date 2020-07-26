const path = require('path');
const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');
const manifest = path.resolve(__dirname, 'manifest.json');
const template = path.resolve(__dirname, 'src', 'template.html')

const index = path.resolve(src, 'index.js');
const domworker = path.resolve(src, 'domworker.js');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        index,
        domworker,
    },
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
            $: 'jquery',
        }),
        new Copy({
            patterns: [
                {
                    from: manifest,
                    to: dist,
                },
                {
                    from: template,
                    to: path.resolve(dist, 'index.html'),
                },
                {
                    from: path.resolve(src, 'style.css'),
                    to: dist,
                },
                {
                    from: path.resolve(src, 'reset.css'),
                    to: dist,
                },
                {
                    from: path.resolve(__dirname, 'fonts'),
                    to: path.resolve(dist, 'fonts'),
                },
                {
                    from: path.resolve(src, 'downloader.js'),
                    to: dist,
                },
            ]
        }),
    ],
}