/**
 * Viewport Scaler - Dynamic iframe content scaling
 * Article II (Performance): Ensures content fits properly in device frames
 * Article IV (UX): Prevents content overflow and maintains aspect ratios
 *
 * This module handles:
 * - Dynamic viewport meta tag injection for iframes
 * - Content scaling based on device viewport dimensions
 * - Proper aspect ratio maintenance
 */

import { getDeviceSpec } from './device-specifications.js';

/**
 * Scale iframe content to fit device viewport
 * @param {string} deviceClass - Device class identifier (e.g., 'iphone-14-pro')
 * @param {HTMLIFrameElement} iframe - Iframe element to scale
 */
export function scaleIframeContent(deviceClass, iframe) {
  if (!iframe) {
    console.warn('[ViewportScaler] No iframe provided');
    return;
  }

  const spec = getDeviceSpec(deviceClass);
  if (!spec) {
    console.warn(`[ViewportScaler] No specification found for device: ${deviceClass}`);
    return;
  }

  const { viewport } = spec;

  // Set iframe dimensions to match device viewport
  iframe.style.width = `${viewport.width}px`;
  iframe.style.height = `${viewport.height}px`;

  // Try to inject viewport meta tag (only works for same-origin iframes)
  try {
    iframe.addEventListener('load', () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        if (iframeDoc) {
          // Check if viewport meta tag exists
          let viewportMeta = iframeDoc.querySelector('meta[name="viewport"]');

          if (!viewportMeta) {
            // Create new viewport meta tag
            viewportMeta = iframeDoc.createElement('meta');
            viewportMeta.name = 'viewport';
            iframeDoc.head.appendChild(viewportMeta);
          }

          // Set viewport content for device
          viewportMeta.content = `width=${viewport.width}, initial-scale=1.0, user-scalable=yes`;

          console.log(`[ViewportScaler] Viewport meta injected for ${deviceClass}: ${viewport.width}x${viewport.height}`);
        }
      } catch (e) {
        // Cross-origin iframe - cannot inject meta tag
        // This is expected for external sites like Google.com
        console.log(`[ViewportScaler] Cannot inject viewport meta (cross-origin): ${e.message}`);
      }
    }, { once: true });
  } catch (e) {
    console.warn('[ViewportScaler] Error setting up viewport injection:', e);
  }
}

/**
 * Apply responsive scaling to iframe based on container size
 * @param {HTMLIFrameElement} iframe - Iframe to scale
 * @param {HTMLElement} container - Container element
 * @param {string} deviceClass - Device class for viewport dimensions
 */
export function applyResponsiveScaling(iframe, container, deviceClass) {
  const spec = getDeviceSpec(deviceClass);
  if (!spec || !iframe || !container) return;

  const containerRect = container.getBoundingClientRect();
  const { viewport } = spec;

  // Calculate scale to fit container while maintaining aspect ratio
  const scaleX = containerRect.width / viewport.width;
  const scaleY = containerRect.height / viewport.height;
  const scale = Math.min(scaleX, scaleY, 1); // Never scale up, only down

  if (scale < 1) {
    iframe.style.transform = `scale(${scale})`;
    iframe.style.transformOrigin = 'top left';
    iframe.style.width = `${viewport.width}px`;
    iframe.style.height = `${viewport.height}px`;
  } else {
    iframe.style.transform = 'none';
    iframe.style.width = `${viewport.width}px`;
    iframe.style.height = `${viewport.height}px`;
  }
}

/**
 * Get optimal zoom level for content to fit device viewport
 * Used for injecting CSS zoom property into iframe
 * @param {number} contentWidth - Original content width
 * @param {number} deviceWidth - Device viewport width
 * @returns {number} Zoom level (e.g., 0.5 for 50%)
 */
export function calculateOptimalZoom(contentWidth, deviceWidth) {
  if (contentWidth <= deviceWidth) return 1;
  return deviceWidth / contentWidth;
}

/**
 * Monitor iframe content size and auto-scale if needed
 * @param {HTMLIFrameElement} iframe - Iframe to monitor
 * @param {string} deviceClass - Device class
 */
export function enableAutoScaling(iframe, deviceClass) {
  const spec = getDeviceSpec(deviceClass);
  if (!spec || !iframe) return;

  // Use ResizeObserver to watch for iframe size changes
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      if (iframeDoc && iframeDoc.body) {
        const contentWidth = iframeDoc.body.scrollWidth;
        const viewportWidth = spec.viewport.width;

        if (contentWidth > viewportWidth) {
          const zoom = calculateOptimalZoom(contentWidth, viewportWidth);

          // Try to inject zoom CSS (only works for same-origin)
          try {
            iframeDoc.body.style.zoom = zoom;
            console.log(`[ViewportScaler] Auto-scaled content: ${(zoom * 100).toFixed(1)}%`);
          } catch (e) {
            // Cross-origin - cannot modify
          }
        }
      }
    }
  });

  resizeObserver.observe(iframe);

  // Return cleanup function
  return () => resizeObserver.disconnect();
}

/**
 * Set user-agent specific viewport for better mobile simulation
 * @param {string} deviceClass - Device class
 * @returns {string} User-agent string for the device
 */
export function getDeviceUserAgent(deviceClass) {
  const spec = getDeviceSpec(deviceClass);
  if (!spec) return navigator.userAgent;

  const userAgents = {
    // iPhone User Agents
    'iphone-14-pro': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'iphone-15-pro': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'iphone-16-pro': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',

    // Samsung User Agents
    'galaxy-s24': 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'galaxy-s25-ultra': 'Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',

    // Google Pixel User Agents
    'pixel-9-pro': 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

    // iPad User Agents
    'ipad-pro-13-m4': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  };

  return userAgents[deviceClass] || navigator.userAgent;
}

/**
 * Initialize viewport scaling for device emulator
 * @param {string} deviceClass - Device class
 * @param {HTMLIFrameElement} iframe - Iframe element
 */
export function initViewportScaling(deviceClass, iframe) {
  scaleIframeContent(deviceClass, iframe);

  // Note: User-agent spoofing cannot be done from client-side JavaScript
  // This would need to be implemented at the browser level or via proxy
  const userAgent = getDeviceUserAgent(deviceClass);
  console.log(`[ViewportScaler] Device UA: ${userAgent}`);

  return {
    deviceClass,
    viewport: getDeviceSpec(deviceClass)?.viewport,
    userAgent
  };
}

// Export for global access (non-module environments)
if (typeof window !== 'undefined') {
  window.ViewportScaler = {
    scaleIframeContent,
    applyResponsiveScaling,
    calculateOptimalZoom,
    enableAutoScaling,
    getDeviceUserAgent,
    initViewportScaling
  };
}
