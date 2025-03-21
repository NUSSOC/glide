const { resolve } = require('path');
const zlib = require('zlib');
const { DefinePlugin } = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    clean: true,
  },
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(`v${require('./package.json').version}`),
    }),
    new CompressionPlugin({
      test: /\.(js|css|html|svg|data|wasm)$/,
      algorithm: 'gzip',
    }),
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg|data|wasm)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
    }),
    new CopyPlugin({
      patterns: [
        resolve(__dirname, 'public/_headers'),
        resolve(__dirname, 'public/.htaccess'),
        resolve(__dirname, 'public/og.png'),
      ],
    }),
  ],
});
