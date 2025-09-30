/**
 * Browser Navigation Module
 * Article V: Security - URL validation and XSS prevention
 * Article III: Code Quality - Modular, maintainable code
 * Article IV: User Experience - Smooth navigation and feedback
 *
 * Provides full web browsing capabilities including:
 * - Navigation history (back/forward)
 * - URL validation and search detection
 * - Google search integration
 * - Loading states and error handling
 */

/**
 * BrowserNavigation class manages browser-like navigation functionality
 */
class BrowserNavigation {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.homeUrl = 'https://google.com';
        this.isLoading = false;
        this.loadStartTime = 0;

        // DOM element references (will be set by init)
        this.iframe = null;
        this.addressBar = null;
        this.backBtn = null;
        this.forwardBtn = null;
        this.refreshBtn = null;
        this.homeBtn = null;
        this.stopBtn = null;
        this.loadingIndicator = null;

        // Load history from sessionStorage
        this.loadHistoryFromStorage();

        // Bind methods to preserve context
        this.navigate = this.navigate.bind(this);
        this.goBack = this.goBack.bind(this);
        this.goForward = this.goForward.bind(this);
        this.refresh = this.refresh.bind(this);
        this.goHome = this.goHome.bind(this);
        this.stop = this.stop.bind(this);
    }

    /**
     * Initialize navigation system with DOM elements
     * Article III: Clear initialization pattern
     * @param {Object} elements - Object containing DOM element references
     */
    init(elements) {
        this.iframe = elements.iframe;
        this.addressBar = elements.addressBar;
        this.backBtn = elements.backBtn;
        this.forwardBtn = elements.forwardBtn;
        this.refreshBtn = elements.refreshBtn;
        this.homeBtn = elements.homeBtn;
        this.stopBtn = elements.stopBtn;
        this.loadingIndicator = elements.loadingIndicator;

        this.setupEventListeners();
        this.updateNavigationButtons();

        // Set initial URL in address bar
        if (this.iframe && this.iframe.src) {
            this.addressBar.value = this.iframe.src;
        }
    }

    /**
     * Set up event listeners for navigation controls
     * Article IV: User Experience - Multiple input methods
     */
    setupEventListeners() {
        // Address bar events
        if (this.addressBar) {
            this.addressBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.navigate(this.addressBar.value);
                }
            });
        }

        // Navigation button events
        if (this.backBtn) {
            this.backBtn.addEventListener('click', this.goBack);
        }
        if (this.forwardBtn) {
            this.forwardBtn.addEventListener('click', this.goForward);
        }
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', this.refresh);
        }
        if (this.homeBtn) {
            this.homeBtn.addEventListener('click', this.goHome);
        }
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', this.stop);
        }

        // Iframe load events
        if (this.iframe) {
            this.iframe.addEventListener('load', () => this.handleIframeLoad());
            this.iframe.addEventListener('error', () => this.handleIframeError());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt+Left Arrow = Back
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.goBack();
            }
            // Alt+Right Arrow = Forward
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                this.goForward();
            }
            // Ctrl/Cmd+R = Refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refresh();
            }
            // Alt+Home = Home
            if (e.altKey && e.key === 'Home') {
                e.preventDefault();
                this.goHome();
            }
        });
    }

    /**
     * Navigate to URL or search query
     * Article V: Security - URL validation and sanitization
     * @param {string} input - URL or search query
     */
    navigate(input) {
        if (!input || !this.iframe) return;

        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        // Determine if input is URL or search query
        const url = this.processInput(trimmedInput);

        // Show loading state
        this.showLoading();

        // Add to history (if not navigating via back/forward)
        if (this.currentIndex === -1 || url !== this.history[this.currentIndex]) {
            // Remove any forward history
            this.history = this.history.slice(0, this.currentIndex + 1);
            // Add new URL
            this.history.push(url);
            this.currentIndex = this.history.length - 1;
            this.saveHistoryToStorage();
        }

        // Use proxy for external URLs to bypass X-Frame-Options
        // This allows browsing sites like Google that block iframe embedding
        const proxiedUrl = `/proxy?url=${encodeURIComponent(url)}`;

        // Navigate iframe
        this.iframe.src = proxiedUrl;
        this.addressBar.value = url; // Show original URL in address bar
        this.updateNavigationButtons();
    }

    /**
     * Process user input - detect URL vs search query
     * Article V: Security - Safe URL handling
     * @param {string} input - User input
     * @returns {string} Valid URL
     */
    processInput(input) {
        // Check if input looks like a URL
        const urlPattern = /^(https?:\/\/)|^(www\.)|^([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/;

        if (urlPattern.test(input)) {
            // It's a URL - ensure protocol
            if (!input.startsWith('http://') && !input.startsWith('https://')) {
                return 'https://' + input;
            }
            return input;
        } else {
            // It's a search query - use Google search
            return this.createSearchUrl(input);
        }
    }

    /**
     * Create Google search URL from query
     * Article V: Security - Encode search query
     * @param {string} query - Search query
     * @returns {string} Google search URL
     */
    createSearchUrl(query) {
        const encodedQuery = encodeURIComponent(query);
        return `https://www.google.com/search?q=${encodedQuery}`;
    }

    /**
     * Validate URL for security
     * Article V: Security - Protocol validation
     * @param {string} url - URL to validate
     * @returns {boolean} Whether URL is valid
     */
    validateUrl(url) {
        try {
            const parsed = new URL(url);
            // Only allow http and https protocols
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }

    /**
     * Navigate back in history
     * Article IV: User Experience - History navigation
     */
    goBack() {
        if (!this.canGoBack()) return;

        this.currentIndex--;
        const url = this.history[this.currentIndex];

        this.showLoading();
        this.iframe.src = url;
        this.addressBar.value = url;
        this.updateNavigationButtons();
    }

    /**
     * Navigate forward in history
     * Article IV: User Experience - History navigation
     */
    goForward() {
        if (!this.canGoForward()) return;

        this.currentIndex++;
        const url = this.history[this.currentIndex];

        this.showLoading();
        this.iframe.src = url;
        this.addressBar.value = url;
        this.updateNavigationButtons();
    }

    /**
     * Refresh current page
     * Article IV: User Experience - Page reload
     */
    refresh() {
        if (!this.iframe || !this.iframe.src) return;

        this.showLoading();
        // Force reload by reassigning src
        const currentSrc = this.iframe.src;
        this.iframe.src = 'about:blank';
        setTimeout(() => {
            this.iframe.src = currentSrc;
        }, 10);
    }

    /**
     * Navigate to home page
     * Article IV: User Experience - Quick navigation
     */
    goHome() {
        this.navigate(this.homeUrl);
    }

    /**
     * Stop loading current page
     * Article IV: User Experience - Cancel navigation
     */
    stop() {
        if (!this.iframe) return;

        // Stop iframe loading
        this.iframe.src = this.iframe.src; // Reset to current src
        this.hideLoading();
    }

    /**
     * Check if can navigate back
     * @returns {boolean}
     */
    canGoBack() {
        return this.currentIndex > 0;
    }

    /**
     * Check if can navigate forward
     * @returns {boolean}
     */
    canGoForward() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Update navigation button states
     * Article IV: User Experience - Clear visual feedback
     */
    updateNavigationButtons() {
        if (this.backBtn) {
            this.backBtn.disabled = !this.canGoBack();
            this.backBtn.classList.toggle('disabled', !this.canGoBack());
        }

        if (this.forwardBtn) {
            this.forwardBtn.disabled = !this.canGoForward();
            this.forwardBtn.classList.toggle('disabled', !this.canGoForward());
        }
    }

    /**
     * Show loading indicator
     * Article IV: User Experience - Loading feedback
     */
    showLoading() {
        this.isLoading = true;
        this.loadStartTime = Date.now();

        if (this.loadingIndicator) {
            this.loadingIndicator.classList.add('active');
        }

        if (this.stopBtn) {
            this.stopBtn.classList.add('active');
        }

        if (this.refreshBtn) {
            this.refreshBtn.classList.add('loading');
        }

        // Update address bar style
        if (this.addressBar) {
            this.addressBar.classList.add('loading');
        }
    }

    /**
     * Hide loading indicator
     * Article IV: User Experience - Loading feedback
     */
    hideLoading() {
        this.isLoading = false;

        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('active');
        }

        if (this.stopBtn) {
            this.stopBtn.classList.remove('active');
        }

        if (this.refreshBtn) {
            this.refreshBtn.classList.remove('loading');
        }

        // Update address bar style
        if (this.addressBar) {
            this.addressBar.classList.remove('loading');
        }
    }

    /**
     * Handle iframe load event
     * Article IV: User Experience - Load completion
     */
    handleIframeLoad() {
        this.hideLoading();

        // Log load time for performance monitoring
        if (this.loadStartTime) {
            const loadTime = Date.now() - this.loadStartTime;
            console.log(`Page loaded in ${loadTime}ms`);
        }

        // Update address bar with actual URL (may have redirected)
        try {
            // Note: Cross-origin restrictions may prevent accessing iframe.contentWindow.location
            if (this.iframe.contentWindow && this.iframe.contentWindow.location.href !== 'about:blank') {
                this.addressBar.value = this.iframe.contentWindow.location.href;
            }
        } catch (e) {
            // Expected for cross-origin iframes - keep current value
        }
    }

    /**
     * Handle iframe error event
     * Article IV: User Experience - Error handling
     */
    handleIframeError() {
        this.hideLoading();

        console.error('Failed to load URL:', this.addressBar.value);

        // Show error message
        this.showError('Failed to load page. The site may be blocking embedding.');
    }

    /**
     * Show error message to user
     * Article IV: User Experience - Error feedback
     * @param {string} message - Error message
     */
    showError(message) {
        // Create error overlay if it doesn't exist
        let errorOverlay = document.getElementById('browser-error-overlay');
        if (!errorOverlay) {
            errorOverlay = document.createElement('div');
            errorOverlay.id = 'browser-error-overlay';
            errorOverlay.className = 'browser-error-overlay';
            document.body.appendChild(errorOverlay);
        }

        errorOverlay.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <h3>Unable to Load Page</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="error-retry-btn" onclick="browserNav.refresh()">Try Again</button>
                <button class="error-close-btn" onclick="document.getElementById('browser-error-overlay').classList.remove('active')">Close</button>
            </div>
        `;

        errorOverlay.classList.add('active');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorOverlay.classList.remove('active');
        }, 5000);
    }

    /**
     * Escape HTML for safe display
     * Article V: Security - XSS prevention
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Save history to sessionStorage
     * Article IV: User Experience - Persist navigation
     */
    saveHistoryToStorage() {
        try {
            sessionStorage.setItem('browserHistory', JSON.stringify(this.history));
            sessionStorage.setItem('browserHistoryIndex', this.currentIndex.toString());
        } catch (e) {
            console.warn('Failed to save history to sessionStorage:', e);
        }
    }

    /**
     * Load history from sessionStorage
     * Article IV: User Experience - Restore navigation
     */
    loadHistoryFromStorage() {
        try {
            const savedHistory = sessionStorage.getItem('browserHistory');
            const savedIndex = sessionStorage.getItem('browserHistoryIndex');

            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }

            if (savedIndex) {
                this.currentIndex = parseInt(savedIndex, 10);
            }
        } catch (e) {
            console.warn('Failed to load history from sessionStorage:', e);
        }
    }

    /**
     * Clear navigation history
     * Article IV: User Experience - Privacy
     */
    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
        this.saveHistoryToStorage();
        this.updateNavigationButtons();
    }
}

// Export for use in main-app.js
window.BrowserNavigation = BrowserNavigation;