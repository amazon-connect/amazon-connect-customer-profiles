const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { commonConfig } = require('./common');

const minimizedConfig = Object.assign({}, commonConfig, {
  entry: [
    "./dist/amazon-connect-customer-profiles.js",
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'amazon-connect-customer-profiles-min.js'	
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        format: {
          comments: false,
        },
      },
      extractComments: false,
    })]
  }
});




module.exports = [
  minimizedConfig
];
