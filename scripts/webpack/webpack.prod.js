'use strict';

const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',

  entry: {
    dark: './public/sass/grafana.dark.scss',
    light: './public/sass/grafana.light.scss',
  },

  module: {
    // Note: order is bottom-to-top and/or right-to-left
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              // Note: order is top-to-bottom and/or left-to-right
              plugins: [
                [
                  require('@babel/plugin-proposal-class-properties'),
                  {
                    loose: true,
                  },
                ],
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-proposal-optional-chaining',
                'angularjs-annotate',
              ],
              // Note: order is bottom-to-top and/or right-to-left
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: 'last 3 versions',
                    },
                    useBuiltIns: 'entry',
                    corejs: 3,
                    modules: false,
                  },
                ],
                [
                  '@babel/preset-typescript',
                  {
                    allowNamespaces: true,
                  },
                ],
                '@babel/preset-react',
              ],
            },
          },
        ],
      },
      require('./sass.rule.js')({
        sourceMap: false,
        preserveUrl: false,
      }),
    ],
  },
  optimization: {
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin({
        cache: false,
        parallel: false,
        sourceMap: false,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'grafana.[name].[hash].css',
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../public/views/index.html'),
      template: path.resolve(__dirname, '../../public/views/index-template.html'),
      inject: false,
      excludeChunks: ['manifest', 'dark', 'light'],
      chunksSortMode: 'none',
    }),
    function() {
      this.hooks.done.tap('Done', function(stats) {
        if (stats.compilation.errors && stats.compilation.errors.length) {
          console.log(stats.compilation.errors);
          process.exit(1);
        }
      });
    },
  ],
});
