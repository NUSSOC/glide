const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'main.js',
    path: resolve(__dirname, 'build'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'write-references',
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: require.resolve('pyodide/repodata.json'),
          to: 'repodata.json',
        },
        {
          from: require.resolve('pyodide/pyodide_py.tar'),
          to: 'pyodide_py.tar',
        },
        {
          from: require.resolve('pyodide/pyodide.asm.data'),
          to: 'pyodide.asm.data',
        },
        {
          from: require.resolve('pyodide/pyodide.asm.js'),
          to: 'pyodide.asm.js',
        },
        {
          from: require.resolve('pyodide/pyodide.asm.wasm'),
          to: 'pyodide.asm.wasm',
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheCompression: false,
            cacheDirectory: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] },
        use: ['@svgr/webpack'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
        include: [resolve(__dirname, 'src/index.css')],
      },
    ],
  },
};
