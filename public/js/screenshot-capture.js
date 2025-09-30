/**
 * Screenshot Capture System for Mobile Emulator Platform
 * Article II: Performance - Efficient screenshot capture
 * Article V: Security - Sanitize all data before sending
 * Article IV: UX - Clear visual feedback and loading states
 */

class ScreenshotCapture {
    constructor() {
        this.captureMode = 'full'; // 'full', 'viewport', 'element'
        this.format = 'png'; // 'png', 'jpeg', 'webp'
        this.quality = 0.92;
        this.includeDeviceFrame = true;
        this.history = [];
        this.maxHistorySize = 20;
        this.inspectionMode = false;
        this.db = null;

        // Initialize IndexedDB for history storage
        this.initDatabase();

        // Bind methods
        this.captureFullDevice = this.captureFullDevice.bind(this);
        this.captureViewportOnly = this.captureViewportOnly.bind(this);
        this.captureElement = this.captureElement.bind(this);
        this.toggleInspectionMode = this.toggleInspectionMode.bind(this);
    }

    /**
     * Initialize IndexedDB for screenshot history
     * Article II: Performance - Efficient local storage
     */
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ScreenshotDB', 1);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized for screenshot history');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('screenshots')) {
                    const objectStore = db.createObjectStore('screenshots', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    objectStore.createIndex('device', 'device', { unique: false });
                }
            };
        });
    }

    /**
     * Get current device metadata
     * Article V: Security - Sanitize device information
     */
    getDeviceMetadata() {
        const activeBtn = document.querySelector('.btn-cosmic.active');
        const deviceType = activeBtn ? activeBtn.dataset.device : 'unknown';
        const iframe = document.getElementById('deviceIframe');
        const url = iframe ? iframe.src : 'about:blank';

        return {
            device: this.sanitizeString(deviceType),
            url: this.sanitizeString(url),
            timestamp: new Date().toISOString(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            userAgent: navigator.userAgent
        };
    }

    /**
     * Sanitize string for security
     * Article V: Security - XSS prevention
     */
    sanitizeString(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Capture full device frame including skin
     * Article II: Performance - Optimized canvas rendering
     */
    async captureFullDevice() {
        try {
            this.showLoadingState();

            const deviceFrame = document.getElementById('deviceFrame');
            if (!deviceFrame) {
                throw new Error('Device frame not found');
            }

            // Use html2canvas via CDN (loaded in HTML)
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }

            const canvas = await html2canvas(deviceFrame, {
                backgroundColor: null,
                scale: 2, // Retina quality
                logging: false,
                useCORS: true,
                allowTaint: false,
                windowWidth: deviceFrame.scrollWidth,
                windowHeight: deviceFrame.scrollHeight
            });

            const dataUrl = canvas.toDataURL(`image/${this.format}`, this.quality);
            const metadata = this.getDeviceMetadata();

            await this.saveToHistory({
                dataUrl,
                metadata,
                captureType: 'full-device'
            });

            this.hideLoadingState();
            this.showSuccessNotification('Screenshot captured successfully!');

            return { dataUrl, metadata };
        } catch (error) {
            this.hideLoadingState();
            this.showErrorNotification('Failed to capture screenshot: ' + error.message);
            console.error('Screenshot capture error:', error);
            throw error;
        }
    }

    /**
     * Capture viewport only (iframe content)
     * Article II: Performance - Lighter capture for faster processing
     */
    async captureViewportOnly() {
        try {
            this.showLoadingState();

            const screen = document.querySelector('.screen');
            if (!screen) {
                throw new Error('Screen element not found');
            }

            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }

            const canvas = await html2canvas(screen, {
                backgroundColor: '#000',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: false
            });

            const dataUrl = canvas.toDataURL(`image/${this.format}`, this.quality);
            const metadata = this.getDeviceMetadata();

            await this.saveToHistory({
                dataUrl,
                metadata,
                captureType: 'viewport-only'
            });

            this.hideLoadingState();
            this.showSuccessNotification('Viewport screenshot captured!');

            return { dataUrl, metadata };
        } catch (error) {
            this.hideLoadingState();
            this.showErrorNotification('Failed to capture viewport: ' + error.message);
            console.error('Viewport capture error:', error);
            throw error;
        }
    }

    /**
     * Capture specific element
     * Article IV: UX - Interactive element selection
     */
    async captureElement(element) {
        try {
            this.showLoadingState();

            if (!element) {
                throw new Error('No element provided for capture');
            }

            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }

            const canvas = await html2canvas(element, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: false
            });

            const dataUrl = canvas.toDataURL(`image/${this.format}`, this.quality);
            const metadata = this.getDeviceMetadata();
            metadata.elementInfo = {
                tagName: element.tagName,
                className: element.className,
                id: element.id
            };

            await this.saveToHistory({
                dataUrl,
                metadata,
                captureType: 'element'
            });

            this.hideLoadingState();
            this.showSuccessNotification('Element screenshot captured!');

            return { dataUrl, metadata };
        } catch (error) {
            this.hideLoadingState();
            this.showErrorNotification('Failed to capture element: ' + error.message);
            console.error('Element capture error:', error);
            throw error;
        }
    }

    /**
     * Toggle element inspection mode
     * Article IV: UX - Visual feedback for inspection mode
     */
    toggleInspectionMode() {
        this.inspectionMode = !this.inspectionMode;

        if (this.inspectionMode) {
            this.enableInspectionMode();
        } else {
            this.disableInspectionMode();
        }

        return this.inspectionMode;
    }

    /**
     * Enable element inspection mode with hover highlighting
     * Article IV: UX - Clear visual feedback
     */
    enableInspectionMode() {
        document.body.style.cursor = 'crosshair';

        // Add inspection overlay
        const overlay = document.createElement('div');
        overlay.id = 'inspectionOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(107, 70, 193, 0.1);
            pointer-events: none;
            z-index: 9998;
            backdrop-filter: blur(2px);
        `;
        document.body.appendChild(overlay);

        // Add hover highlight element
        const highlight = document.createElement('div');
        highlight.id = 'inspectionHighlight';
        highlight.style.cssText = `
            position: absolute;
            border: 2px solid #6B46C1;
            background: rgba(107, 70, 193, 0.2);
            pointer-events: none;
            z-index: 9999;
            display: none;
            box-shadow: 0 0 20px rgba(107, 70, 193, 0.6);
        `;
        document.body.appendChild(highlight);

        // Add event listeners
        this.inspectionMouseMoveHandler = this.handleInspectionMouseMove.bind(this);
        this.inspectionClickHandler = this.handleInspectionClick.bind(this);

        document.addEventListener('mousemove', this.inspectionMouseMoveHandler);
        document.addEventListener('click', this.inspectionClickHandler);

        this.showNotification('Inspection mode enabled. Click any element to capture it.', 'info');
    }

    /**
     * Disable element inspection mode
     */
    disableInspectionMode() {
        document.body.style.cursor = '';

        // Remove overlay and highlight
        const overlay = document.getElementById('inspectionOverlay');
        const highlight = document.getElementById('inspectionHighlight');
        if (overlay) overlay.remove();
        if (highlight) highlight.remove();

        // Remove event listeners
        if (this.inspectionMouseMoveHandler) {
            document.removeEventListener('mousemove', this.inspectionMouseMoveHandler);
        }
        if (this.inspectionClickHandler) {
            document.removeEventListener('click', this.inspectionClickHandler);
        }

        this.showNotification('Inspection mode disabled', 'info');
    }

    /**
     * Handle mouse move during inspection
     */
    handleInspectionMouseMove(e) {
        const highlight = document.getElementById('inspectionHighlight');
        if (!highlight) return;

        const target = e.target;
        if (target.id === 'inspectionOverlay' || target.id === 'inspectionHighlight') {
            highlight.style.display = 'none';
            return;
        }

        const rect = target.getBoundingClientRect();
        highlight.style.display = 'block';
        highlight.style.left = rect.left + window.scrollX + 'px';
        highlight.style.top = rect.top + window.scrollY + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
    }

    /**
     * Handle click during inspection
     */
    async handleInspectionClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target;
        if (target.id === 'inspectionOverlay' || target.id === 'inspectionHighlight') {
            return;
        }

        // Capture the element
        this.disableInspectionMode();
        await this.captureElement(target);
    }

    /**
     * Save screenshot to history (IndexedDB)
     * Article II: Performance - Efficient storage
     */
    async saveToHistory(screenshot) {
        if (!this.db) {
            console.warn('Database not initialized, skipping history save');
            return;
        }

        try {
            const transaction = this.db.transaction(['screenshots'], 'readwrite');
            const objectStore = transaction.objectStore('screenshots');

            const request = objectStore.add({
                ...screenshot,
                timestamp: Date.now()
            });

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('Screenshot saved to history');
                    this.trimHistory();
                    resolve(request.result);
                };
                request.onerror = () => {
                    console.error('Failed to save screenshot:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }

    /**
     * Trim history to max size
     * Article II: Performance - Prevent database bloat
     */
    async trimHistory() {
        if (!this.db) return;

        try {
            const transaction = this.db.transaction(['screenshots'], 'readwrite');
            const objectStore = transaction.objectStore('screenshots');
            const index = objectStore.index('timestamp');

            const countRequest = objectStore.count();
            countRequest.onsuccess = () => {
                const count = countRequest.result;
                if (count > this.maxHistorySize) {
                    const deleteCount = count - this.maxHistorySize;
                    const cursorRequest = index.openCursor();
                    let deleted = 0;

                    cursorRequest.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor && deleted < deleteCount) {
                            objectStore.delete(cursor.primaryKey);
                            deleted++;
                            cursor.continue();
                        }
                    };
                }
            };
        } catch (error) {
            console.error('Error trimming history:', error);
        }
    }

    /**
     * Get screenshot history
     */
    async getHistory() {
        if (!this.db) {
            return [];
        }

        try {
            const transaction = this.db.transaction(['screenshots'], 'readonly');
            const objectStore = transaction.objectStore('screenshots');
            const index = objectStore.index('timestamp');

            return new Promise((resolve, reject) => {
                const request = index.getAll();
                request.onsuccess = () => {
                    resolve(request.result.reverse()); // Most recent first
                };
                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    /**
     * UI Feedback Methods
     * Article IV: UX - Clear visual feedback
     */
    showLoadingState() {
        const btn = document.getElementById('screenshotBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<div class="loading-spinner"></div>';
        }
    }

    hideLoadingState() {
        const btn = document.getElementById('screenshotBtn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
            `;
        }
    }

    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.screenshot-notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `screenshot-notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            background: rgba(10, 0, 32, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : 'rgba(255,255,255,0.2)'};
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenshotCapture;
}
