const webpack = require('webpack');
const path = require('path');
const { commonConfig } = require('./common');


const config = Object.assign({}, commonConfig, {
  entry: [
    "./src/client.js"
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'amazon-connect-customer-profiles.js'	
  },
  optimization: {
    minimize: false
  }
});

module.exports = [
  config
]
