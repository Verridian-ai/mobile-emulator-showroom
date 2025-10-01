/**
 * Error Monitor for Mobile Emulator Platform
 * Article V: Security - Safe error handling and reporting
 * Article II: Performance - Efficient error detection
 * Article IV: UX - Automatic screenshot on errors
 */

class ErrorMonitor {
    constructor(screenshotCapture, ideIntegration) {
        this.screenshotCapture = screenshotCapture;
        this.ideIntegration = ideIntegration;
        this.consoleErrors = [];
        this.maxErrorHistory = 50;
        this.autoScreenshotEnabled = true;
        this.errorOverlayVisible = false;

        // Bind methods
        this.handleWindowError = this.handleWindowError.bind(this);
        this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
        this.handleConsoleError = this.handleConsoleError.bind(this);

        // Initialize monitoring
        this.init();
    }

    /**
     * Initialize error monitoring
     * Article V: Security - Safe error interception
     * Article III: Code Quality - Defensive initialization
     */
    init() {
        // Intercept window errors
        if (typeof window !== 'undefined') {
            window.addEventListener('error', this.handleWindowError);

            // Intercept unhandled promise rejections
            window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
        }

        // Intercept console errors
        this.interceptConsoleError();

        // Monitor iframe errors (if same-origin)
        this.monitorIframeErrors();

        // Safe console.log call
        if (console && typeof console.log === 'function') {
            console.log('Error monitoring initialized');
        }
    }

    /**
     * Handle window errors
     * Article IV: UX - Automatic error capture and reporting
     */
    async handleWindowError(event) {
        const error = {
            type: 'javascript',
            message: event.message || 'Unknown error',
            filename: event.filename || '',
            lineno: event.lineno || 0,
            colno: event.colno || 0,
            stack: event.error ? event.error.stack : null,
            timestamp: new Date().toISOString()
        };

        this.addToErrorHistory(error);

        // Safe console.error call
        if (console && typeof console.error === 'function') {
            console.error('Window error detected:', error);
        }

        // Show error overlay
        this.showErrorOverlay(error);

        // Auto-capture screenshot if enabled
        if (this.autoScreenshotEnabled) {
            await this.captureAndReportError(error);
        }
    }

    /**
     * Handle unhandled promise rejections
     */
    async handleUnhandledRejection(event) {
        const error = {
            type: 'promise',
            message: event.reason ? event.reason.message || String(event.reason) : 'Unhandled promise rejection',
            stack: event.reason ? event.reason.stack : null,
            timestamp: new Date().toISOString()
        };

        this.addToErrorHistory(error);

        // Safe console.error call
        if (console && typeof console.error === 'function') {
            console.error('Unhandled promise rejection:', error);
        }

        // Show error overlay
        this.showErrorOverlay(error);

        // Auto-capture screenshot if enabled
        if (this.autoScreenshotEnabled) {
            await this.captureAndReportError(error);
        }
    }

    /**
     * Intercept console.error
     * Article V: Security - Safe console interception
     * Article III: Code Quality - Defensive null checks
     */
    interceptConsoleError() {
        // Safely capture original console.error with null check and try-catch
        let originalConsoleError = null;

        try {
            if (console && typeof console.error === 'function') {
                originalConsoleError = console.error.bind(console);
            }
        } catch (e) {
            // Failed to bind - console.error doesn't exist or can't be bound
            originalConsoleError = null;
        }

        const self = this;

        // Only override if console.error exists
        if (console && typeof console.error === 'function') {
            console.error = function (...args) {
                // Call original console.error safely
                if (originalConsoleError && typeof originalConsoleError === 'function') {
                    try {
                        originalConsoleError(...args);
                    } catch (e) {
                        // Fallback to console.log if console.error fails
                        if (console && typeof console.log === 'function') {
                            console.log('[ERROR]', ...args);
                        }
                    }
                }

                // Log to error history
                try {
                    const error = {
                        type: 'console',
                        message: args.map(arg => String(arg)).join(' '),
                        timestamp: new Date().toISOString()
                    };

                    self.addToErrorHistory(error);
                } catch (e) {
                    // Silently fail if error history fails
                }
            };
        }
    }

    /**
     * Monitor iframe for errors
     * Article V: Security - Only monitor same-origin iframes
     */
    monitorIframeErrors() {
        const iframe = document.getElementById('deviceIframe');
        if (!iframe) return;

        iframe.addEventListener('error', async (event) => {
            const error = {
                type: 'iframe',
                message: 'Failed to load content in iframe',
                url: iframe.src,
                timestamp: new Date().toISOString()
            };

            this.addToErrorHistory(error);

            // Safe console.error call
            if (console && typeof console.error === 'function') {
                console.error('Iframe error:', error);
            }

            // Show error overlay
            this.showErrorOverlay(error);

            // Auto-capture screenshot if enabled
            if (this.autoScreenshotEnabled) {
                await this.captureAndReportError(error);
            }
        });

        // Try to access iframe console (same-origin only)
        iframe.addEventListener('load', () => {
            try {
                const iframeWindow = iframe.contentWindow;
                if (iframeWindow && iframeWindow.console) {
                    // Safely capture original iframe console.error with try-catch
                    let originalIframeError = null;

                    try {
                        if (iframeWindow.console.error && typeof iframeWindow.console.error === 'function') {
                            originalIframeError = iframeWindow.console.error.bind(iframeWindow.console);
                        }
                    } catch (bindError) {
                        // Failed to bind - cannot access or bind iframe console.error
                        originalIframeError = null;
                    }

                    const self = this;

                    // Only override if iframe console.error exists
                    if (iframeWindow.console.error && typeof iframeWindow.console.error === 'function') {
                        iframeWindow.console.error = function (...args) {
                            // Call original iframe console.error safely
                            if (originalIframeError && typeof originalIframeError === 'function') {
                                try {
                                    originalIframeError(...args);
                                } catch (e) {
                                    // Fallback to parent console if iframe console fails
                                    if (console && typeof console.error === 'function') {
                                        console.error('[IFRAME ERROR]', ...args);
                                    }
                                }
                            }

                            // Log to error history
                            try {
                                const error = {
                                    type: 'iframe-console',
                                    message: args.map(arg => String(arg)).join(' '),
                                    url: iframe.src,
                                    timestamp: new Date().toISOString()
                                };

                                self.addToErrorHistory(error);
                            } catch (e) {
                                // Silently fail if error history fails
                            }
                        };
                    }
                }
            } catch (e) {
                // Cross-origin iframe, cannot access console
                if (console && typeof console.log === 'function') {
                    console.log('Cannot monitor cross-origin iframe console');
                }
            }
        });
    }

    /**
     * Add error to history
     * Article II: Performance - Limit history size
     */
    addToErrorHistory(error) {
        this.consoleErrors.push(error);

        // Trim history if too large
        if (this.consoleErrors.length > this.maxErrorHistory) {
            this.consoleErrors.shift();
        }

        // Dispatch custom event for external listeners
        window.dispatchEvent(new CustomEvent('errorDetected', { detail: error }));
    }

    /**
     * Capture screenshot and report error
     * Article IV: UX - Automatic error reporting
     */
    async captureAndReportError(error) {
        try {
            // Capture full device screenshot
            const screenshot = await this.screenshotCapture.captureFullDevice();

            // Add console errors to screenshot metadata
            screenshot.consoleErrors = this.getRecentErrors(5);

            // Send to IDE
            if (this.ideIntegration) {
                await this.ideIntegration.sendErrorReport(error, screenshot);

                // Safe console.log call
                if (console && typeof console.log === 'function') {
                    console.log('Error report sent to IDE');
                }
            }
        } catch (captureError) {
            // Safe console.error call
            if (console && typeof console.error === 'function') {
                console.error('Failed to capture/report error:', captureError);
            }
        }
    }

    /**
     * Get recent errors
     */
    getRecentErrors(count = 10) {
        return this.consoleErrors.slice(-count);
    }

    /**
     * Show error overlay
     * Article IV: UX - Clear error visibility
     */
    showErrorOverlay(error) {
        // Remove existing overlay
        this.hideErrorOverlay();

        const overlay = document.createElement('div');
        overlay.id = 'errorOverlay';
        overlay.className = 'error-overlay glass-dark glass-depth-3';
        overlay.innerHTML = `
            <div class="error-overlay-content">
                <div class="error-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Error Detected</h3>
                    <button id="closeErrorOverlay" class="close-btn" aria-label="Close error overlay">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="error-body">
                    <div class="error-type">
                        <strong>Type:</strong> ${this.escapeHtml(error.type)}
                    </div>
                    <div class="error-message">
                        <strong>Message:</strong> ${this.escapeHtml(error.message)}
                    </div>
                    ${error.filename ? `
                        <div class="error-location">
                            <strong>Location:</strong> ${this.escapeHtml(error.filename)}:${error.lineno}:${error.colno}
                        </div>
                    ` : ''}
                    ${error.stack ? `
                        <details class="error-stack">
                            <summary><strong>Stack Trace</strong></summary>
                            <pre>${this.escapeHtml(error.stack)}</pre>
                        </details>
                    ` : ''}
                </div>
                <div class="error-actions">
                    <button id="reportToIDE" class="btn-cosmic btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Report to IDE
                    </button>
                    <button id="dismissError" class="btn-cosmic btn-secondary">
                        Dismiss
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.errorOverlayVisible = true;

        // Add event listeners
        document.getElementById('closeErrorOverlay').addEventListener('click', () => {
            this.hideErrorOverlay();
        });

        document.getElementById('dismissError').addEventListener('click', () => {
            this.hideErrorOverlay();
        });

        document.getElementById('reportToIDE').addEventListener('click', async () => {
            await this.captureAndReportError(error);
            this.hideErrorOverlay();
        });

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideErrorOverlay();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    /**
     * Hide error overlay
     */
    hideErrorOverlay() {
        const overlay = document.getElementById('errorOverlay');
        if (overlay) {
            overlay.remove();
        }
        this.errorOverlayVisible = false;
    }

    /**
     * Escape HTML for security
     * Article V: Security - XSS prevention
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Toggle auto-screenshot on errors
     */
    setAutoScreenshot(enabled) {
        this.autoScreenshotEnabled = enabled;

        // Safe console.log call
        if (console && typeof console.log === 'function') {
            console.log('Auto-screenshot on errors:', enabled);
        }
    }

    /**
     * Get error statistics
     */
    getStatistics() {
        const errorsByType = {};
        this.consoleErrors.forEach(error => {
            errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
        });

        return {
            total: this.consoleErrors.length,
            byType: errorsByType,
            recent: this.getRecentErrors(5)
        };
    }

    /**
     * Clear error history
     */
    clearHistory() {
        this.consoleErrors = [];

        // Safe console.log call
        if (console && typeof console.log === 'function') {
            console.log('Error history cleared');
        }
    }

    /**
     * Cleanup
     * Article III: Code Quality - Safe cleanup
     */
    destroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('error', this.handleWindowError);
            window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        }
        this.hideErrorOverlay();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorMonitor;
}
