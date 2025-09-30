/**
 * Verridian Favicon Generator
 * Article III: Code Quality - External, modular JavaScript
 * Article V: Security - CSP compliant
 */

// Favicon sizes needed
const sizes = [16, 32, 48, 64, 128, 192, 512];

/**
 * Generates a favicon canvas at specified size
 * @param {number} size - Size of the favicon in pixels
 * @returns {HTMLCanvasElement} Canvas element with generated favicon
 */
function generateFavicon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#0a0020');
    gradient.addColorStop(0.5, '#1a0840');
    gradient.addColorStop(1, '#2a1060');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Outer glow
    ctx.shadowBlur = size * 0.2;
    ctx.shadowColor = '#EC4899';

    // Draw V shape
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // V path scaled to size
    const scale = size / 100;
    ctx.save();
    ctx.translate(size/2, size/2);
    ctx.scale(scale, scale);

    // Outer V
    ctx.beginPath();
    ctx.moveTo(-30, -25);
    ctx.lineTo(0, 35);
    ctx.lineTo(30, -25);
    ctx.stroke();

    // Inner V with gradient
    const vGradient = ctx.createLinearGradient(-30, -25, 30, 35);
    vGradient.addColorStop(0, '#6B46C1');
    vGradient.addColorStop(0.5, '#EC4899');
    vGradient.addColorStop(1, '#2563EB');

    ctx.fillStyle = vGradient;
    ctx.beginPath();
    ctx.moveTo(-25, -20);
    ctx.lineTo(0, 30);
    ctx.lineTo(25, -20);
    ctx.lineTo(15, -20);
    ctx.lineTo(0, 15);
    ctx.lineTo(-15, -20);
    ctx.closePath();
    ctx.fill();

    // Center glow
    ctx.shadowBlur = size * 0.1;
    ctx.shadowColor = '#F59E0B';
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Add cosmic particles for larger sizes
    if (size >= 48) {
        const particleCount = Math.floor(size / 32);
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const particleSize = Math.random() * 2 + 1;

            ctx.fillStyle = `rgba(${245}, ${158}, ${11}, ${Math.random() * 0.5 + 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return canvas;
}

/**
 * Generates ICO format preview (contains multiple sizes)
 */
function generateICO() {
    // For demonstration, we'll create a combined preview
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    // Draw small versions side by side
    [16, 32, 48].forEach((size, index) => {
        const favicon = generateFavicon(size);
        ctx.drawImage(favicon, index * 48 + 8, 8);
    });

    const container = document.getElementById('favicon-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'favicon-preview';
    wrapper.innerHTML = '<h3>favicon.ico (Multi-size)</h3>';
    wrapper.appendChild(canvas);

    container.appendChild(wrapper);
}

/**
 * Generates Apple Touch Icon
 */
function generateAppleTouchIcon() {
    const canvas = generateFavicon(180);
    const container = document.getElementById('favicon-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'favicon-preview';
    wrapper.innerHTML = '<h3>Apple Touch Icon (180x180)</h3>';
    wrapper.appendChild(canvas);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'apple-touch-icon.png';
    link.textContent = 'Download';
    link.style.color = '#F59E0B';
    link.style.display = 'block';
    link.style.marginTop = '5px';
    wrapper.appendChild(link);

    container.appendChild(wrapper);
}

/**
 * Initialize favicon generator on page load
 */
function initFaviconGenerator() {
    // Generate and display all favicons
    const container = document.getElementById('favicon-container');

    sizes.forEach(size => {
        const wrapper = document.createElement('div');
        wrapper.className = 'favicon-preview';

        const canvas = generateFavicon(size);
        wrapper.appendChild(canvas);

        const label = document.createElement('div');
        label.textContent = `${size}x${size}`;
        wrapper.appendChild(label);

        // Create download link
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `favicon-${size}x${size}.png`;
        link.textContent = 'Download';
        link.style.color = '#F59E0B';
        link.style.display = 'block';
        link.style.marginTop = '5px';
        wrapper.appendChild(link);

        container.appendChild(wrapper);
    });

    generateICO();
    generateAppleTouchIcon();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaviconGenerator);
} else {
    initFaviconGenerator();
}