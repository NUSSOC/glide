const zlib = require('zlib');
const CompressionPlugin = require('compression-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
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
  ],
});
