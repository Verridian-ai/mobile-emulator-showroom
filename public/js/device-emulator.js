/**
 * Device Emulator - Main Application Logic
 * Article V (Security): Externalized from inline script, XSS-safe DOM manipulation
 * Article III (Code Quality): Modular, testable, well-documented
 *
 * This module handles:
 * - Device switching with animations
 * - URL input and iframe updates
 * - Security-enhanced DOM manipulation (no innerHTML with user input)
 * - Agent command handling
 */

(function initDeviceEmulator() {
  'use strict';

  // Constants to avoid magic numbers
  const CONFIG = {
    RECONNECT_DELAY: 5000,
    MIN_LOAD_TIME: 1500,
    IFRAME_REFRESH_DELAY: 250,
    LOADER_FADE_DURATION: 1000,
    PERFORMANCE_CHECK_INTERVAL: 1000,
    FPS_WARNING_THRESHOLD: 30,
    PARTICLE_REDUCTION_FACTOR: 0.8,
    BROKER_URL: 'ws://localhost:7071',
    BROKER_TOKEN: 'devtoken123'
  };

  // DOM element references
  const deviceFrame = document.getElementById('deviceFrame');
  const deviceButtons = document.querySelectorAll('[data-device]');
  const urlInput = document.getElementById('urlInput');
  const urlSubmit = document.getElementById('urlSubmit');

  /**
   * Sanitize URL for safe display (prevent XSS)
   * @param {string} url - URL to sanitize
   * @returns {string} - Sanitized URL text
   */
  function sanitizeUrl(url) {
    const div = document.createElement('div');
    div.textContent = url;
    return div.innerHTML;
  }

  /**
   * Validate and normalize URL
   * @param {string} url - Raw URL input
   * @returns {string} - Validated URL with protocol
   */
  function normalizeUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return '';

    // Add https:// if no protocol specified
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return 'https://' + trimmed;
    }

    return trimmed;
  }

  /**
   * Update iframe URL securely
   */
  function updateIframeUrl() {
    const url = normalizeUrl(urlInput.value);
    const currentIframe = document.getElementById('deviceIframe');

    if (url && currentIframe) {
      // TODO: Send to /api/validate-url endpoint first (Task 1.9)
      currentIframe.src = url;
    }
  }

  /**
   * Update device frame with new device class
   * Security: Uses programmatic DOM manipulation (no innerHTML)
   * @param {string} deviceClass - Device class identifier (e.g., 'iphone-14-pro')
   */
  function updateDeviceFrame(deviceClass) {
    // Cache current iframe source
    const currentIframe = document.getElementById('deviceIframe');
    const currentSrc = currentIframe ? currentIframe.src : 'https://google.com';

    // Clear existing content safely
    while (deviceFrame.firstChild) {
      deviceFrame.removeChild(deviceFrame.firstChild);
    }

    // Update frame class
    deviceFrame.className = `device-mockup device-${deviceClass} scale-75 animate-hover`;

    // Build DOM structure programmatically (safer than innerHTML)
    if (deviceClass === 'desktop-chrome') {
      // Create browser header
      const browserHeader = document.createElement('div');
      browserHeader.className = 'browser-header';

      const browserButtons = document.createElement('div');
      browserButtons.className = 'browser-buttons';
      ['close', 'minimize', 'maximize'].forEach(type => {
        const button = document.createElement('span');
        button.className = `browser-button ${type}`;
        browserButtons.appendChild(button);
      });

      const addressBar = document.createElement('div');
      addressBar.className = 'browser-address-bar';
      addressBar.textContent = currentSrc; // Safe text content (no XSS)

      browserHeader.appendChild(browserButtons);
      browserHeader.appendChild(addressBar);
      deviceFrame.appendChild(browserHeader);
    }

    // Create screen container
    const screen = document.createElement('div');
    screen.className = 'screen';

    // Create new iframe with security attributes
    const newIframe = document.createElement('iframe');
    newIframe.id = 'deviceIframe';
    newIframe.src = currentSrc;
    newIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
    newIframe.setAttribute('loading', 'lazy');

    screen.appendChild(newIframe);
    deviceFrame.appendChild(screen);

    // Update global reference
    window.deviceIframe = newIframe;
  }

  /**
   * Handle device button click with animation
   * @param {HTMLButtonElement} btn - Clicked device button
   */
  function handleDeviceSwitch(btn) {
    // Update button states
    deviceButtons.forEach(b => {
      b.classList.remove('active');
      if (typeof motion !== 'undefined' && b !== btn) {
        motion.spring(b, { opacity: 0.7 }, { spring: motion.springs.gentle });
      }
    });

    btn.classList.add('active');

    // Animate button (if motion library available)
    if (typeof motion !== 'undefined') {
      motion.spring(btn, {
        scale: 1.1,
        opacity: 1
      }, {
        spring: motion.springs.bouncy
      }).then(() => {
        motion.spring(btn, { scale: 1 }, { spring: motion.springs.snappy });
      });
    }

    // Update device frame class with animation
    const deviceClass = btn.dataset.device;

    // Animate device frame transition
    if (typeof motion !== 'undefined') {
      motion.spring(deviceFrame, {
        opacity: 0,
        scale: 0.95
      }, {
        spring: motion.springs.snappy,
        duration: 200
      }).then(() => {
        // Update frame after fade out
        updateDeviceFrame(deviceClass);

        // Animate back in
        motion.spring(deviceFrame, {
          opacity: 1,
          scale: 1
        }, {
          spring: motion.springs.smooth,
          duration: 300
        });
      });
    } else {
      updateDeviceFrame(deviceClass);
    }
  }

  /**
   * Handle commands from AI agents
   * @param {object} data - Command data from agent
   */
  function handleAgentCommand(data) {
    switch (data.command) {
      case 'open_url':
        if (data.payload && data.payload.url) {
          const iframe = document.getElementById('deviceIframe');
          if (iframe) {
            iframe.src = data.payload.url;
          }
        }
        break;
      case 'screenshot':
        // For now, just log - would need server-side screenshot capability
        console.log('Screenshot requested');
        break;
      default:
        console.log('Unknown command:', data.command);
    }
  }

  /**
   * Initialize event listeners
   */
  function init() {
    // URL submission events
    if (urlSubmit) {
      urlSubmit.addEventListener('click', updateIframeUrl);
    }

    if (urlInput) {
      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          updateIframeUrl();
        }
      });
    }

    // Device button events
    deviceButtons.forEach(btn => {
      // Add hover animations (if motion library available)
      if (typeof motion !== 'undefined') {
        motion.gesture(btn, {
          hover: { scale: 1.05, opacity: 0.9 },
          tap: { scale: 0.95 },
          initial: { scale: 1, opacity: 1 }
        });
      }

      btn.addEventListener('click', () => handleDeviceSwitch(btn));
    });

    console.log('Device Emulator initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for potential agent integration
  window.DeviceEmulator = {
    handleAgentCommand,
    updateDeviceFrame,
    updateIframeUrl
  };
})();
