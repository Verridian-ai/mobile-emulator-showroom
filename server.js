// Load environment variables from .env file (Article V: Security)
import 'dotenv/config';

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createProxyMiddleware } from './server/proxy-middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required environment variables (Article V: Security)
const requiredEnvVars = [];
const optionalEnvVars = ['PORT', 'NODE_ENV', 'SESSION_SECRET', 'CORS_ALLOWED_ORIGINS'];

// Check if we're in production and require SESSION_SECRET
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('SESSION_SECRET');
}

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ SECURITY ERROR: Required environment variables missing:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Please set these in your .env file (see .env.example)');
  process.exit(1);
}

const app = express();
const port = Number(process.env.PORT || process.env.SHOWROOM_PORT || 4175);
const nodeEnv = process.env.NODE_ENV || 'development';

// Enhanced error handling and logging
console.log('🚀 Starting Verridian Showroom Server...');
console.log('📁 Public directory:', path.join(__dirname, 'public'));
console.log('🌐 Server port:', port);
console.log('🔧 Environment:', nodeEnv);

// Check if public directory exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  console.log('✅ Public directory found');
  const files = fs.readdirSync(publicDir);
  console.log(`📄 Found ${files.length} files in public directory`);
} else {
  console.error('❌ Public directory not found!');
}

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    publicDir: fs.existsSync(publicDir),
    files: fs.existsSync(publicDir) ? fs.readdirSync(publicDir).length : 0
  });
});

// Proxy endpoint for bypassing X-Frame-Options (Article V: Security)
// This allows browsing sites like Google.com that block iframe embedding
app.get('/proxy', createProxyMiddleware({
  timeout: 30000,
  userAgent: 'Verridian Mobile Emulator/1.0'
}));

// Enhanced static file serving with logging
app.use(express.static(publicDir, {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add CORS headers for all static files (Article V: Configurable CORS)
    const corsOrigin = process.env.CORS_ALLOWED_ORIGINS || '*';
    res.set('Access-Control-Allow-Origin', corsOrigin);
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Security warning for wildcard CORS in production
    if (nodeEnv === 'production' && corsOrigin === '*') {
      console.warn('⚠️  WARNING: CORS set to wildcard (*) in production. Set CORS_ALLOWED_ORIGINS in .env');
    }

    // Cache control for different file types
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.svg')) {
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    }

    if (process.env.LOG_LEVEL === 'debug') {
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
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Showroom listening on http://0.0.0.0:${port}`);
  console.log(`🌍 Access at: http://localhost:${port}`);
  console.log('🎬 Ready for device emulation testing!');
});

