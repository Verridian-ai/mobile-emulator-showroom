/**
 * Main Application Logic for Mobile Device Emulator
 * Article V: Security - CSP compliant external script
 * Article III: Code Quality - Modular, maintainable code
 * Article II: Performance - Optimized DOM operations
 */

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

const deviceFrame = document.getElementById('deviceFrame');
const deviceButtons = document.querySelectorAll('[data-device]');
const urlInput = document.getElementById('urlInput');
const urlSubmit = document.getElementById('urlSubmit');

// Initialize Browser Navigation System
let browserNav = null;

/**
 * Initialize browser navigation after DOM is ready
 * Article I: Architecture - Clean module initialization
 */
function initializeBrowserNavigation() {
    if (typeof BrowserNavigation === 'undefined') {
        console.warn('BrowserNavigation module not loaded yet');
        return;
    }

    browserNav = new BrowserNavigation();

    // Get DOM elements for navigation
    const navElements = {
        iframe: document.getElementById('deviceIframe'),
        addressBar: document.getElementById('urlInput'),
        backBtn: document.getElementById('backBtn'),
        forwardBtn: document.getElementById('forwardBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        homeBtn: document.getElementById('homeBtn'),
        stopBtn: document.getElementById('stopBtn'),
        loadingIndicator: document.getElementById('loadingIndicator')
    };

    // Initialize navigation system
    browserNav.init(navElements);

    console.log('Browser navigation initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBrowserNavigation);
} else {
    initializeBrowserNavigation();
}

/**
 * Updates iframe URL with proper protocol handling
 * Article V: Security - URL validation
 * Note: This function is now handled by browserNav.navigate()
 */
const updateIframeUrl = () => {
    if (browserNav) {
        browserNav.navigate(urlInput.value);
    } else {
        // Fallback if browser navigation not initialized
        let url = urlInput.value.trim();
        const currentIframe = document.getElementById('deviceIframe');
        if (url && currentIframe) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            currentIframe.src = url;
        }
    }
};

// Event listeners for URL submission
urlSubmit.addEventListener('click', updateIframeUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateIframeUrl();
    }
});

// Make browserNav globally accessible for error overlay buttons
window.browserNav = browserNav;

// Handle device switching with enhanced animations
deviceButtons.forEach(btn => {
    // Add hover animations
    if (typeof motion !== 'undefined') {
        motion.gesture(btn, {
            hover: { scale: 1.05, opacity: 0.9 },
            tap: { scale: 0.95 },
            initial: { scale: 1, opacity: 1 }
        });
    }

    btn.addEventListener('click', () => {
        // Animate button state change
        deviceButtons.forEach(b => {
            b.classList.remove('active');
            if (typeof motion !== 'undefined' && b !== btn) {
                motion.spring(b, { opacity: 0.7 }, { spring: motion.springs.gentle });
            }
        });

        btn.classList.add('active');
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
    });
});

/**
 * Helper function to update device frame (SECURITY ENHANCED)
 * Article V: Security - Safe DOM manipulation
 * Article II: Performance - Efficient DOM updates
 * @param {string} deviceClass - The device class to apply
 */
function updateDeviceFrame(deviceClass) {
        /**
         * Sanitizes URL for display
         * Article V: Security - XSS prevention
         * @param {string} url - URL to sanitize
         * @returns {string} Sanitized URL
         */
        const sanitizeUrl = (url) => {
            const div = document.createElement('div');
            div.textContent = url;
            return div.innerHTML;
        };

        // Cache current iframe source
        const currentSrc = deviceIframe ? deviceIframe.src : 'https://verridian.ai';

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
            addressBar.textContent = currentSrc; // Safe text content

            browserHeader.appendChild(browserButtons);
            browserHeader.appendChild(addressBar);
            deviceFrame.appendChild(browserHeader);
        }

        // Create screen container
        const screen = document.createElement('div');
        screen.className = 'screen';

        // Create new iframe
        const newIframe = document.createElement('iframe');
        newIframe.id = 'deviceIframe';
        newIframe.src = currentSrc;
        newIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
        newIframe.setAttribute('loading', 'lazy');

        screen.appendChild(newIframe);
        deviceFrame.appendChild(screen);

        // Update global reference
        window.deviceIframe = newIframe;

        // Re-initialize browser navigation with new iframe
        if (browserNav) {
            browserNav.iframe = newIframe;
            // Re-attach iframe event listeners
            newIframe.addEventListener('load', () => browserNav.handleIframeLoad());
            newIframe.addEventListener('error', () => browserNav.handleIframeError());
        }
}

/**
 * Handle commands from agents
 * Article I: Architecture - Clean module boundaries
 * @param {Object} data - Command data
 */
const handleAgentCommand = (data) => {
    switch (data.command) {
        case 'open_url':
            if (data.payload && data.payload.url) {
                deviceIframe.src = data.payload.url;
            }
            break;
        case 'screenshot':
            // For now, just acknowledge - would need server-side screenshot capability
            break;
        default:
            // Unknown command - no action needed
    }
};

// TODO: Connect to broker when WebSocket integration is completed
// connectToBroker(); // Function not yet implemented - removed to prevent errors