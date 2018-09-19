const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].css"
});
module.exports = {
    entry: {
        main: './src/main.js'
    },
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "app.js",
        // publicPath: "/assets/"
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: {
                    loader: "html-loader",
                },
                exclude: path.resolve(__dirname, 'src/index.html')
            }, {
                test: /\.(jpg|png|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img/',
                            publicPath: 'img/'
                        }
                    }
                ]
            }, {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: {
                    presets: ["env"]
                },
            }, {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                minimize: true,
                            }
                        }, {
                            loader: "postcss-loader"
                        }, {
                            loader: "sass-loader",
                        }],
                })
            }

        ],
    },
    plugins: [
        extractSass,
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'pages/stats.html',
            template: 'src/pages/stats.html'
        }),
        new CleanWebpackPlugin(['dist'])
    ]
};