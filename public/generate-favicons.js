/**
 * Verridian AI - Favicon Generator Script
 * Run this with Node.js to generate actual favicon files
 */

const fs = require('fs');
const path = require('path');

// Create a simple SVG favicon that can be saved
const createFaviconSVG = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1"/>
      <stop offset="50%" style="stop-color:#EC4899;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#6B46C1;stop-opacity:1"/>
    </linearGradient>
    <radialGradient id="bgGradient">
      <stop offset="0%" style="stop-color:#2a1060;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#0a0020;stop-opacity:1"/>
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="32" height="32" fill="url(#bgGradient)"/>
  
  <!-- Glow effect -->
  <circle cx="16" cy="16" r="12" fill="#EC4899" opacity="0.2" filter="blur(4px)"/>
  
  <!-- V Shape -->
  <path d="M 8 10 L 16 22 L 24 10 L 21 10 L 16 18 L 11 10 Z" 
    fill="url(#vGradient)" 
    stroke="#F59E0B" 
    stroke-width="0.5"/>
  
  <!-- Center dot -->
  <circle cx="16" cy="16" r="2" fill="#FFFFFF" opacity="0.9"/>
  
  <!-- Particles -->
  <circle cx="6" cy="6" r="0.5" fill="#F59E0B" opacity="0.6"/>
  <circle cx="26" cy="8" r="0.5" fill="#EC4899" opacity="0.6"/>
  <circle cx="24" cy="26" r="0.5" fill="#6B46C1" opacity="0.6"/>
  <circle cx="8" cy="24" r="0.5" fill="#2563EB" opacity="0.6"/>
</svg>`;
};

// Save SVG favicon
const svgContent = createFaviconSVG();
fs.writeFileSync('favicon.svg', svgContent);
console.log('Created favicon.svg');

// Create a simple HTML file that shows all favicons
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Verridian Favicons</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <style>
        body {
            background: #0a0020;
            color: white;
            font-family: monospace;
            padding: 20px;
        }
        .favicon-display {
            display: inline-block;
            margin: 10px;
            padding: 10px;
            border: 1px solid #6B46C1;
            text-align: center;
        }
        img {
            display: block;
            margin: 10px auto;
        }
    </style>
</head>
<body>
    <h1>Verridian AI - Favicon Package</h1>
    
    <div class="favicon-display">
        <h3>SVG Favicon (Scalable)</h3>
        <img src="favicon.svg" width="32" height="32" alt="32x32">
        <img src="favicon.svg" width="64" height="64" alt="64x64">
        <img src="favicon.svg" width="128" height="128" alt="128x128">
        <p>One file, all sizes!</p>
    </div>
    
    <div class="favicon-display">
        <h3>Usage in HTML</h3>
        <pre>&lt;link rel="icon" type="image/svg+xml" href="favicon.svg"&gt;</pre>
    </div>
    
    <div class="favicon-display">
        <h3>For older browsers</h3>
        <pre>&lt;link rel="icon" type="image/png" href="Verridian_V.png"&gt;</pre>
    </div>
</body>
</html>`;

fs.writeFileSync('favicon-display.html', htmlContent);
console.log('Created favicon-display.html');

console.log('\nFavicon files created successfully!');
console.log('- favicon.svg: Scalable vector favicon');
console.log('- favicon-display.html: Preview page');
console.log('\nThe SVG favicon will scale perfectly to any size needed.');