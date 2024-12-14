import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    apiKeyPresent: !!process.env.VITE_API_KEY
  });
});

// Proxy middleware configuration
const apiProxy = createProxyMiddleware({
  target: 'https://api.football-data.org',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  onProxyReq: (proxyReq, req) => {
    // Log the original request URL and headers
    console.log('Proxying request:', req.url);
    console.log('API Key present:', !!process.env.VITE_API_KEY);
    
    if (!process.env.VITE_API_KEY) {
      console.error('API Key is missing!');
      throw new Error('API Key is required');
    }
    
    proxyReq.setHeader('X-Auth-Token', process.env.VITE_API_KEY);
  },
  onProxyRes: (proxyRes, req) => {
    // Log the proxy response
    console.log('Proxy response status:', proxyRes.statusCode);
    console.log('For request:', req.url);
    if (proxyRes.statusCode !== 200) {
      console.log('Response headers:', proxyRes.headers);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// Skip proxy for health check
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next('route');
  }
  return apiProxy(req, res, next);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API Key present:', !!process.env.VITE_API_KEY);
  console.log('Current working directory:', process.cwd());
  console.log('Directory contents:', require('fs').readdirSync(process.cwd()));
}); 