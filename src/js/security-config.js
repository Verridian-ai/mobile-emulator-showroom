/**
 * Security Configuration for Verridian Showroom
 * Centralizes security-sensitive configuration
 *
 * Article V (Security): Input validation, XSS prevention, CSP enforcement
 * Article III (Code Quality): Well-documented, defensive coding
 *
 * @module security-config
 * @description Provides browser-safe environment detection and security settings
 *
 * IMPORTANT: In production, these values should come from:
 * - Environment variables
 * - Secure configuration service
 * - Server-side injection
 *
 * This file is for development only
 */

(function() {
    'use strict';

    /**
     * Detects the current environment (development/production)
     * Works in both Node.js and browser contexts
     *
     * @returns {'development'|'production'} Current environment
     *
     * @example
     * const env = getEnvironment();
     * if (env === 'development') {
     *   console.log('Running in dev mode');
     * }
     */
    function getEnvironment() {
        try {
            // Check if we're in Node.js environment
            if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
                return process.env.NODE_ENV;
            }
        } catch (e) {
            // process is not defined - we're in browser
            console.debug('process.env not available, using browser detection');
        }

        // Browser environment detection
        const { hostname, port, protocol } = window.location;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }

        if (protocol === 'https:') {
            return 'production';
        }

        return 'development'; // Default to development
    }

    /**
     * Safely retrieves environment variable from process.env or window
     *
     * @param {string} key - Environment variable key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} The environment variable value or default
     */
    function getEnvVar(key, defaultValue) {
        try {
            if (typeof process !== 'undefined' && process.env && process.env[key]) {
                return process.env[key];
            }
        } catch (e) {
            // process is not defined - we're in browser
        }

        // Try window object
        if (typeof window !== 'undefined' && window[key]) {
            return window[key];
        }

        return defaultValue;
    }

    // Determine current environment
    const isDevelopment = getEnvironment() === 'development';
    const isProduction = getEnvironment() === 'production';

    // Security configuration object
    const SecurityConfig = {
        // Environment detection
        environment: {
            isDevelopment: isDevelopment,
            isProduction: isProduction,
            current: getEnvironment()
        },

        // WebSocket Configuration
        websocket: {
            // Use environment variables or defaults
            // In production, a token must be provided by the server (no auto-generate)
            token: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? (getEnvVar('WEBSOCKET_TOKEN', null) || generateSecureToken())
                : (getEnvVar('WEBSOCKET_TOKEN', null) || null),
            brokerPort: getEnvVar('BROKER_PORT', 7071),
            secure: window.location.protocol === 'https:',
            reconnectInterval: 5000,
            maxReconnectAttempts: 10
        },
        
        // Content Security Policy
        csp: {
            allowedImageSources: ['self', 'data:', 'blob:'],
            allowedScriptSources: ['self'],
            allowedStyleSources: ['self', 'unsafe-inline'],
            allowedConnectSources: ['self', 'ws://localhost:*', 'wss://localhost:*']
        },
        
        // XSS Protection
        xss: {
            sanitizeHTML: true,
            escapeUserInput: true,
            validateURLs: true
        },
        
        // Debug Configuration
        debug: {
            enabled: isDevelopment,
            verboseLogging: false,
            performanceMonitoring: true
        }
    };
    
    /**
     * Generate a secure random token
     * In production, this should come from the server
     */
    function generateSecureToken() {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
        // Fallback for development only
        console.warn('Crypto API not available. Using fallback token generation.');
        return 'dev-token-' + Math.random().toString(36).substring(2, 15);
    }
    
    /**
     * Sanitize HTML content to prevent XSS
     */
    SecurityConfig.sanitizeHTML = function(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    };
    
    /**
     * Validate URL to prevent injection attacks
     */
    SecurityConfig.validateURL = function(url) {
        try {
            const parsed = new URL(url);
            // Check protocol
            if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) {
                return false;
            }
            // Check for localhost in development
            if (SecurityConfig.debug.enabled) {
                return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
            }
            // In production, validate against allowed domains
            return true;
        } catch {
            return false;
        }
    };
    
    /**
     * Create secure WebSocket connection
     */
    SecurityConfig.createWebSocket = function(path = '') {
        const protocol = SecurityConfig.websocket.secure ? 'wss:' : 'ws:';
        const port = SecurityConfig.websocket.brokerPort;
        const token = SecurityConfig.websocket.token;
        
        // Enforce explicit token in non-local environments
        if (!SecurityConfig.debug.enabled && (!token || typeof token !== 'string')) {
            throw new Error('WEBSOCKET_TOKEN is required in production. Inject via server-side config.');
        }
        const url = `${protocol}//localhost:${port}${path}?token=${encodeURIComponent(token)}`;
        
        if (!SecurityConfig.validateURL(url)) {
            throw new Error('Invalid WebSocket URL');
        }
        
        return new WebSocket(url);
    };
    
    /**
     * Escape user input for safe display
     */
    SecurityConfig.escapeInput = function(input) {
        if (typeof input !== 'string') return input;
        
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        
        return input.replace(/[&<>"'/]/g, char => escapeMap[char]);
    };
    
    /**
     * Apply Content Security Policy
     */
    SecurityConfig.applyCSP = function() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        
        const policies = [
            `default-src 'self'`,
            `img-src ${SecurityConfig.csp.allowedImageSources.join(' ')}`,
            `script-src ${SecurityConfig.csp.allowedScriptSources.join(' ')}`,
            `style-src ${SecurityConfig.csp.allowedStyleSources.join(' ')}`,
            `connect-src ${SecurityConfig.csp.allowedConnectSources.join(' ')}`,
            `font-src 'self' data:`,
            `object-src 'none'`,
            `frame-ancestors 'self'`
        ];
        
        meta.content = policies.join('; ');
        
        // Only apply in production
        if (!SecurityConfig.debug.enabled) {
            document.head.appendChild(meta);
        }
    };
    
    /**
     * Initialize security features
     */
    SecurityConfig.init = function() {
        // Apply CSP
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                SecurityConfig.applyCSP();
            });
        } else {
            SecurityConfig.applyCSP();
        }
        
        // Set secure token in window for other scripts
        window.WEBSOCKET_TOKEN = SecurityConfig.websocket.token;
        window.BROKER_PORT = SecurityConfig.websocket.brokerPort;
        
        // Add XSS protection to global scope
        window.sanitizeHTML = SecurityConfig.sanitizeHTML;
        window.escapeInput = SecurityConfig.escapeInput;
        
        // Log initialization in debug mode
        if (SecurityConfig.debug.enabled && SecurityConfig.debug.verboseLogging) {
            console.log('Security configuration initialized:', {
                websocketPort: SecurityConfig.websocket.brokerPort,
                secureMode: SecurityConfig.websocket.secure,
                debugMode: SecurityConfig.debug.enabled
            });
        }
    };
    
    // Expose helper functions for testing and advanced use
    SecurityConfig.getEnvironment = getEnvironment;
    SecurityConfig.getEnvVar = getEnvVar;

    // Export to global scope
    window.SecurityConfig = SecurityConfig;

    // Auto-initialize
    SecurityConfig.init();
    
})();