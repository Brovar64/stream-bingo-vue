module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/stream-bingo-vue/'
    : '/',
  outputDir: 'dist',
  assetsDir: '',
  // Enable CSS source maps for development
  css: {
    sourceMap: process.env.NODE_ENV !== 'production'
  }
}
