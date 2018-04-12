const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = p => path.resolve(__dirname, './', p)

module.exports = {
    mode: 'development',
    entry: {main: resolve('main.js')},
    output: {
        path: resolve('dist'),
        publicPath: 'http://localhost:8080/build',
        filename: '[name].js',
        chunkFilename: '[name].js'
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
                        presets: ['es2015']
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
    devtool: '#source-map',
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'index.html',
            template: resolve('index.html'),
            hash: true
        })
    ]
}