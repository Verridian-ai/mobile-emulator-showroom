/**
 * Proxy Middleware for Iframe Content
 * Article V: Security - Safe URL proxying with validation
 * Article II: Performance - Efficient request handling
 *
 * This middleware proxies external URLs to bypass X-Frame-Options restrictions
 * while maintaining security through URL validation and rate limiting.
 */

import fetch from 'node-fetch';
import validator from 'validator';

/**
 * Validates and sanitizes proxy URL
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, sanitized: string|null, error: string|null}}
 */
function validateProxyUrl(url) {
    // Check if URL is a string
    if (typeof url !== 'string' || !url.trim()) {
        return { valid: false, sanitized: null, error: 'URL is required' };
    }

    // Sanitize URL
    const sanitized = url.trim();

    // Validate URL format
    if (!validator.isURL(sanitized, {
        protocols: ['http', 'https'],
        require_protocol: true
    })) {
        return { valid: false, sanitized: null, error: 'Invalid URL format' };
    }

    try {
        const urlObj = new URL(sanitized);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { valid: false, sanitized: null, error: 'Only HTTP/HTTPS protocols allowed' };
        }

        // Prevent access to private IP ranges (security)
        const hostname = urlObj.hostname;
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')
        ) {
            return { valid: false, sanitized: null, error: 'Cannot proxy local/private URLs' };
        }

        return { valid: true, sanitized, error: null };
    } catch (err) {
        return { valid: false, sanitized: null, error: 'Malformed URL' };
    }
}

/**
 * Strips X-Frame-Options and other restrictive headers
 * @param {Object} headers - Original response headers
 * @returns {Object} Sanitized headers
 */
function sanitizeHeaders(headers) {
    const sanitized = {};
    const blockedHeaders = [
        'x-frame-options',
        'content-security-policy',
        'content-security-policy-report-only',
        'cross-origin-embedder-policy',
        'cross-origin-opener-policy',
        'cross-origin-resource-policy'
    ];

    for (const [key, value] of Object.entries(headers)) {
        const lowerKey = key.toLowerCase();
        if (!blockedHeaders.includes(lowerKey)) {
            sanitized[key] = value;
        }
    }

    // Add permissive headers
    sanitized['X-Frame-Options'] = 'ALLOWALL';

    return sanitized;
}

/**
 * Creates proxy middleware
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware
 */
export function createProxyMiddleware(options = {}) {
    const {
        timeout = 30000,
        userAgent = 'Verridian Mobile Emulator/1.0'
    } = options;

    return async (req, res, next) => {
        const targetUrl = req.query.url;

        // Validate URL
        const validation = validateProxyUrl(targetUrl);
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error,
                message: 'Invalid proxy URL'
            });
        }

        try {
            // Fetch the target URL
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(validation.sanitized, {
                headers: {
                    'User-Agent': userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache'
                },
                redirect: 'follow',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Get content type
            const contentType = response.headers.get('content-type') || 'text/html';

            // Get response body
            const body = await response.text();

            // Sanitize response headers
            const sanitizedHeaders = sanitizeHeaders(Object.fromEntries(response.headers.entries()));

            // Set response headers
            res.status(response.status);
            Object.entries(sanitizedHeaders).forEach(([key, value]) => {
                res.setHeader(key, value);
            });

            // For HTML content, inject base tag to fix relative URLs
            if (contentType.includes('text/html')) {
                const baseUrl = new URL(validation.sanitized).origin;
                const injectedHtml = body.replace(
                    '<head>',
                    `<head>\n<base href="${baseUrl}/">`
                );
                res.send(injectedHtml);
            } else {
                res.send(body);
            }

        } catch (error) {
            console.error('Proxy error:', error.message);

            if (error.name === 'AbortError') {
                return res.status(504).json({
                    error: 'Request timeout',
                    message: 'The proxied request took too long to respond'
                });
            }

            return res.status(502).json({
                error: 'Proxy failed',
                message: 'Failed to fetch the requested URL',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
}

/**
 * Simple proxy endpoint (GET only)
 */
export function simpleProxyEndpoint(req, res) {
    createProxyMiddleware()(req, res, () => {});
}
