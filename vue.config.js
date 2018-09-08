const webpack = require('webpack')

module.exports = {
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
    port: 3000, // CHANGE YOUR PORT HERE!
    https: false,
    hotOnly: false,
  },
  // css: {
  //   loaderOptions: {
  //     sass: {
  //       data: `@import '@/assets/css/global.sass';`
  //     }
  //   }
  // },
  // 基本路径
  baseUrl: './',
}
