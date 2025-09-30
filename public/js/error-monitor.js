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
     */
    init() {
        // Intercept window errors
        window.addEventListener('error', this.handleWindowError);

        // Intercept unhandled promise rejections
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);

        // Intercept console errors
        this.interceptConsoleError();

        // Monitor iframe errors (if same-origin)
        this.monitorIframeErrors();

        console.log('Error monitoring initialized');
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
        console.error('Window error detected:', error);

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
        console.error('Unhandled promise rejection:', error);

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
     */
    interceptConsoleError() {
        const originalConsoleError = console.error;
        const self = this;

        console.error = function (...args) {
            // Call original console.error
            originalConsoleError.apply(console, args);

            // Log to error history
            const error = {
                type: 'console',
                message: args.map(arg => String(arg)).join(' '),
                timestamp: new Date().toISOString()
            };

            self.addToErrorHistory(error);
        };
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
            console.error('Iframe error:', error);

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
                    const originalIframeError = iframeWindow.console.error;
                    const self = this;

                    iframeWindow.console.error = function (...args) {
                        originalIframeError.apply(iframeWindow.console, args);

                        const error = {
                            type: 'iframe-console',
                            message: args.map(arg => String(arg)).join(' '),
                            url: iframe.src,
                            timestamp: new Date().toISOString()
                        };

                        self.addToErrorHistory(error);
                    };
                }
            } catch (e) {
                // Cross-origin iframe, cannot access console
                console.log('Cannot monitor cross-origin iframe console');
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
                console.log('Error report sent to IDE');
            }
        } catch (captureError) {
            console.error('Failed to capture/report error:', captureError);
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
        console.log('Auto-screenshot on errors:', enabled);
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
        console.log('Error history cleared');
    }

    /**
     * Cleanup
     */
    destroy() {
        window.removeEventListener('error', this.handleWindowError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        this.hideErrorOverlay();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorMonitor;
}
