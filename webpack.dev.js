const { merge, mergeWithRules } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  plugins: [new ReactRefreshWebpackPlugin()],
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
