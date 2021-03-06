const path = require('path');
const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');
const manifest = path.resolve(__dirname, 'manifest.json');
const template = path.resolve(__dirname, 'src', 'template.html')

const index = path.resolve(src, 'index.js');
const downloader = path.resolve(src, 'downloader.js');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        index,
        downloader,
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
            ]
        }),
    ],
}