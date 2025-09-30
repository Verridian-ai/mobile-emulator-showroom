// Load and validate configuration (Article V: Security, Article III: Centralized Config)
const config = require('./server/config');

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Enhanced error handling and logging
console.log('🚀 Starting Mobile Emulator Platform...');
console.log('📁 Public directory:', path.join(__dirname, config.publicDir));
console.log('🌐 Server port:', config.port);
console.log('🔧 Environment:', config.env);
console.log('🐛 Debug mode:', config.enableDebugMode);
console.log('📊 Analytics:', config.enableAnalytics);

// Check if public directory exists
const publicDir = path.join(__dirname, config.publicDir);
if (fs.existsSync(publicDir)) {
  console.log('✅ Public directory found');
  const files = fs.readdirSync(publicDir);
  console.log(`📄 Found ${files.length} files in public directory`);
} else {
  console.error('❌ Public directory not found!');
}

// Health check endpoint (Article II: Performance Monitoring)
// Used by Docker HEALTHCHECK and monitoring systems
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: config.env,
    publicDir: fs.existsSync(publicDir),
    files: fs.existsSync(publicDir) ? fs.readdirSync(publicDir).length : 0
  });
});

// Legacy health check endpoint (keep for backwards compatibility)
app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    publicDir: fs.existsSync(publicDir),
    files: fs.existsSync(publicDir) ? fs.readdirSync(publicDir).length : 0
  });
});

// Enhanced static file serving with logging
app.use(express.static(publicDir, {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add CORS headers for all static files (Article V: Configurable CORS)
    const corsOrigin = config.corsOrigins.length === 1 && config.corsOrigins[0] === '*'
      ? '*'
      : config.corsOrigins.join(',');
    res.set('Access-Control-Allow-Origin', corsOrigin);
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Cache control for different file types (Article II: Performance)
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.svg')) {
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    }

    if (config.logLevel === 'debug') {
      console.log(`📤 Serving: ${path}`);
    }
  }
}));

// Handle 404s for missing files
app.use((req, res, next) => {
  console.log(`❌ File not found: ${req.url}`);
  res.status(404).json({ error: 'File not found', path: req.url });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.port, config.host, () => {
  console.log(`✅ Mobile Emulator Platform listening on http://${config.host}:${config.port}`);
  console.log(`🌍 Access at: http://localhost:${config.port}`);
  console.log(`🏥 Health check: http://localhost:${config.port}/health`);
  console.log('🎬 Ready for device emulation testing!');
});

