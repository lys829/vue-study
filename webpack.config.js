const path = require('path')
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = p => path.resolve(__dirname, './', p)
const cleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {main: resolve('main.js')},
    output: {
        path: resolve('dist'),
        publicPath: 'http://localhost:3001/build',
        filename: '[name].js',
        chunkFilename: 'chunk.[name].js'
    },
    module: {
        rules: [{
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
            compiler: resolve('src/compiler'),
            core: resolve('src/core'),
            shared: resolve('src/shared'),
            web: resolve('src/platforms/web'),
            sfc: resolve('src/sfc')
        }
    },
    devServer: {
        contentBase: './dist',
        host: 'localhost',
        port: 3001,
        hot: true
    },
    devtool: '#source-map',
    plugins: [
        new cleanWebpackPlugin,
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'index.html',
            template: resolve('index.html'),
            hash: true
        })
    ]
}