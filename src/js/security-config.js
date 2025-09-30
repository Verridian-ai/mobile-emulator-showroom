/**
 * Security Configuration for Verridian Showroom
 * Centralizes security-sensitive configuration
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
    
    // Security configuration object
    const SecurityConfig = {
        // WebSocket Configuration
        websocket: {
            // Use environment variables or defaults
            // In production, a token must be provided by the server (no auto-generate)
            token: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? (process.env.WEBSOCKET_TOKEN || window.WEBSOCKET_TOKEN || generateSecureToken())
                : (window.WEBSOCKET_TOKEN || process.env.WEBSOCKET_TOKEN || null),
            brokerPort: process.env.BROKER_PORT || window.BROKER_PORT || 7071,
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
            enabled: window.location.hostname === 'localhost',
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
    
    // Export to global scope
    window.SecurityConfig = SecurityConfig;
    
    // Auto-initialize
    SecurityConfig.init();
    
})();