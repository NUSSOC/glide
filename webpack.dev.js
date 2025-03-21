const { merge, mergeWithRules } = require('webpack-merge');
const { DefinePlugin } = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    port: process.env.PORT || 9102,
  },
  plugins: [
    new DefinePlugin({ __VERSION__: JSON.stringify('edge') }),
    new ReactRefreshWebpackPlugin(),
    new ESLintWebpackPlugin({
      extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
      configType: 'eslintrc',
    }),
  ],
  module: {
    rules: [
      mergeWithRules({
        test: 'match',
        use: { loader: 'match', options: 'merge' },
      })(common.module.rules[0], {
        use: { options: { plugins: ['react-refresh/babel'] } },
      }),
    ],
  },
});
