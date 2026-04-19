const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only proxy in development (when REACT_APP_API_URL is localhost)
  const target = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  if (target.includes('localhost')) {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:5000',
        changeOrigin: true,
      })
    );
  }
};
