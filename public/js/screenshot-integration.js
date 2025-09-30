/**
 * Screenshot System Integration
 * Article I: Architecture - Clean integration between modules
 * Article IV: UX - Seamless user experience
 * Article V: Security - Safe event handling
 */

// Wait for all modules to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modules
    const screenshotCapture = new ScreenshotCapture();
    const ideIntegration = new IDEIntegration();
    let errorMonitor = null;

    // Wait for modules to initialize
    screenshotCapture.initDatabase().then(() => {
        // Initialize error monitor after screenshot capture is ready
        errorMonitor = new ErrorMonitor(screenshotCapture, ideIntegration);
        console.log('Screenshot system initialized successfully');
    });

    // Get UI elements
    const screenshotBtn = document.getElementById('screenshotBtn');
    const inspectionBtn = document.getElementById('inspectionBtn');
    const screenshotSettingsBtn = document.getElementById('screenshotSettingsBtn');
    const screenshotHistoryBtn = document.getElementById('screenshotHistoryBtn');
    const settingsModal = document.getElementById('screenshotSettingsModal');
    const historyModal = document.getElementById('screenshotHistoryModal');

    // Screenshot button click handler
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', async () => {
            try {
                const screenshot = await screenshotCapture.captureFullDevice();
                await ideIntegration.sendScreenshotToIDE(screenshot);
            } catch (error) {
                console.error('Screenshot failed:', error);
            }
        });
    }

    // Inspection mode toggle
    if (inspectionBtn) {
        inspectionBtn.addEventListener('click', () => {
            const isActive = screenshotCapture.toggleInspectionMode();
            inspectionBtn.classList.toggle('active', isActive);
        });
    }

    // Settings button
    if (screenshotSettingsBtn) {
        screenshotSettingsBtn.addEventListener('click', () => {
            openSettingsModal();
        });
    }

    // History button
    if (screenshotHistoryBtn) {
        screenshotHistoryBtn.addEventListener('click', async () => {
            await openHistoryModal();
        });
    }

    // Settings Modal Functions
    function openSettingsModal() {
        settingsModal.style.display = 'flex';

        // Load current settings
        const captureModeSelect = document.getElementById('captureMode');
        const imageFormatSelect = document.getElementById('imageFormat');
        const imageQualityInput = document.getElementById('imageQuality');
        const qualityValue = document.getElementById('qualityValue');
        const autoScreenshotCheckbox = document.getElementById('autoScreenshotOnError');
        const preferredIDESelect = document.getElementById('preferredIDE');
        const ideStatus = document.getElementById('ideStatus');

        // Set current values
        if (captureModeSelect) captureModeSelect.value = screenshotCapture.captureMode;
        if (imageFormatSelect) imageFormatSelect.value = screenshotCapture.format;
        if (imageQualityInput) {
            imageQualityInput.value = screenshotCapture.quality;
            qualityValue.textContent = Math.round(screenshotCapture.quality * 100) + '%';
        }
        if (autoScreenshotCheckbox && errorMonitor) {
            autoScreenshotCheckbox.checked = errorMonitor.autoScreenshotEnabled;
        }
        if (preferredIDESelect) {
            preferredIDESelect.value = ideIntegration.preferredIDE || '';
        }

        // Update IDE status
        if (ideStatus) {
            const status = ideIntegration.getStatus();
            let statusText = 'Status: ';
            if (status.detected) {
                statusText += `Connected to ${status.detected}`;
            } else if (status.capabilities.filesystem) {
                statusText += 'Filesystem API available (fallback)';
            } else {
                statusText += 'No IDE detected';
            }
            ideStatus.textContent = statusText;
        }

        // Event listeners for settings
        if (captureModeSelect) {
            captureModeSelect.addEventListener('change', (e) => {
                screenshotCapture.captureMode = e.target.value;
            });
        }

        if (imageFormatSelect) {
            imageFormatSelect.addEventListener('change', (e) => {
                screenshotCapture.format = e.target.value;
            });
        }

        if (imageQualityInput) {
            imageQualityInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                screenshotCapture.quality = value;
                qualityValue.textContent = Math.round(value * 100) + '%';
            });
        }

        if (autoScreenshotCheckbox && errorMonitor) {
            autoScreenshotCheckbox.addEventListener('change', (e) => {
                errorMonitor.setAutoScreenshot(e.target.checked);
            });
        }

        if (preferredIDESelect) {
            preferredIDESelect.addEventListener('change', (e) => {
                ideIntegration.setPreferredIDE(e.target.value);
            });
        }
    }

    function closeSettingsModal() {
        settingsModal.style.display = 'none';
    }

    // History Modal Functions
    async function openHistoryModal() {
        historyModal.style.display = 'flex';

        // Load screenshot history
        const history = await screenshotCapture.getHistory();
        const historyList = document.getElementById('screenshotHistoryList');

        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">No screenshots yet</p>';
            return;
        }

        historyList.innerHTML = '';

        history.forEach((screenshot, index) => {
            const item = document.createElement('div');
            item.className = 'screenshot-history-item';

            const timestamp = new Date(screenshot.timestamp);
            const formattedTime = timestamp.toLocaleString();

            item.innerHTML = `
                <img src="${screenshot.dataUrl}" alt="Screenshot">
                <div class="screenshot-history-meta">
                    <div class="device">${screenshot.metadata.device}</div>
                    <div class="timestamp">${formattedTime}</div>
                </div>
                <div class="screenshot-history-actions">
                    <button class="screenshot-action-btn" data-action="view" data-index="${index}" title="View full size">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="screenshot-action-btn" data-action="download" data-index="${index}" title="Download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    <button class="screenshot-action-btn" data-action="ide" data-index="${index}" title="Send to IDE">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                    </button>
                </div>
            `;

            // Add click handlers for actions
            const viewBtn = item.querySelector('[data-action="view"]');
            const downloadBtn = item.querySelector('[data-action="download"]');
            const ideBtn = item.querySelector('[data-action="ide"]');

            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.open(screenshot.dataUrl, '_blank');
                });
            }

            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    downloadScreenshot(screenshot);
                });
            }

            if (ideBtn) {
                ideBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        await ideIntegration.sendScreenshotToIDE(screenshot);
                        screenshotCapture.showSuccessNotification('Screenshot sent to IDE!');
                    } catch (error) {
                        screenshotCapture.showErrorNotification('Failed to send to IDE: ' + error.message);
                    }
                });
            }

            // Click on item to view
            item.addEventListener('click', () => {
                window.open(screenshot.dataUrl, '_blank');
            });

            historyList.appendChild(item);
        });
    }

    function closeHistoryModal() {
        historyModal.style.display = 'none';
    }

    function downloadScreenshot(screenshot) {
        const timestamp = new Date(screenshot.timestamp);
        const device = screenshot.metadata.device.replace(/\s+/g, '-');
        const filename = `screenshot-${device}-${timestamp.toISOString().replace(/[:.]/g, '-')}.png`;

        const link = document.createElement('a');
        link.href = screenshot.dataUrl;
        link.download = filename;
        link.click();
    }

    // Modal close handlers
    settingsModal.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeSettingsModal);
    });

    historyModal.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeHistoryModal);
    });

    // Close modals on overlay click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });

    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            closeHistoryModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+S - Take screenshot
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            screenshotBtn.click();
        }

        // Ctrl+Shift+E - Toggle inspection mode
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            inspectionBtn.click();
        }

        // Ctrl+Shift+Q - Quick send to IDE
        if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
            e.preventDefault();
            screenshotBtn.click();
        }

        // Escape - Close modals
        if (e.key === 'Escape') {
            if (settingsModal.style.display === 'flex') {
                closeSettingsModal();
            }
            if (historyModal.style.display === 'flex') {
                closeHistoryModal();
            }
        }
    });

    // Make modules globally accessible for debugging
    window.screenshotSystem = {
        capture: screenshotCapture,
        ide: ideIntegration,
        errorMonitor: errorMonitor
    };

    console.log('Screenshot integration complete. Use Ctrl+Shift+S to capture, Ctrl+Shift+E for inspection mode.');
});
