import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules don't have __dirname, so we need to construct it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = Number(process.env.PORT || process.env.SHOWROOM_PORT || 4175);

// Enhanced error handling and logging
console.log('🚀 Starting Verridian Showroom Server...');
console.log('📁 Public directory:', path.join(__dirname, 'public'));
console.log('🌐 Server port:', port);

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

// Enhanced static file serving with logging
app.use(express.static(publicDir, {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add CORS headers for all static files
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Cache control for different file types
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.svg')) {
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
    
    console.log(`📤 Serving: ${path}`);
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

