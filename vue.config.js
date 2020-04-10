module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/nona/'
    : '/',
  chainWebpack: (config) => {
    config.module.rule('worker')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
      .loader('worker-loader');
  },
}