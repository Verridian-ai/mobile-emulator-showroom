/**
 * Element Overlay UI - Comprehensive overlay system for element inspection
 * 
 * This module provides:
 * - Visual overlay controls for element selection mode
 * - Element information display panel
 * - Action buttons for screenshot, analysis, and AI chat
 * - Keyboard shortcut indicators
 * - Status indicators and feedback
 * - Integration with element-inspector.js and screenshot-capture-system.js
 * 
 * Features:
 * - Modern glassmorphism design with Verridian cosmic theme
 * - Responsive design with mobile support
 * - Accessibility features and keyboard navigation
 * - Real-time status updates and notifications
 * - Advanced element context menu
 */

class ElementOverlayUI {
    constructor() {
        this.isVisible = false;
        this.currentMode = 'inspect'; // 'inspect', 'screenshot', 'analyze', 'chat'
        this.overlayContainer = null;
        this.controlPanel = null;
        this.infoPanel = null;
        this.statusPanel = null;
        this.contextMenu = null;
        this.shortcutDisplay = null;
        this.websocket = null;
        this.elementInspector = null;
        this.screenshotSystem = null;
        
        // UI state
        this.selectedElement = null;
        this.isAnimating = false;
        this.notifications = [];
        this.keyboardShortcuts = {};
        
        this.init();
    }

    /**
     * Initialize the overlay UI system
     */
    init() {
        this.setupKeyboardShortcuts();
        this.createOverlayContainer();
        this.createControlPanel();
        this.createInfoPanel();
        this.createStatusPanel();
        this.createContextMenu();
        this.createShortcutDisplay();
        this.createNotificationSystem();
        this.connectToSystems();
        this.bindEvents();
        
        console.log('🎨 Element Overlay UI initialized with Verridian cosmic theme');
    }

    /**
     * Setup keyboard shortcuts configuration
     */
    setupKeyboardShortcuts() {
        this.keyboardShortcuts = {
            'Alt+I': { action: 'toggleInspector', description: 'Toggle Element Inspector' },
            'Alt+S': { action: 'captureScreenshot', description: 'Capture Screenshot' },
            'Alt+A': { action: 'analyzeElement', description: 'Analyze Selected Element' },
            'Alt+C': { action: 'openChat', description: 'Open AI Chat' },
            'Alt+H': { action: 'toggleHelp', description: 'Show/Hide Help' },
            'Escape': { action: 'exitMode', description: 'Exit Current Mode' },
            'Enter': { action: 'confirmAction', description: 'Confirm Action' },
            'Space': { action: 'captureElement', description: 'Capture Selected Element' },
            'Ctrl+C': { action: 'copyElementInfo', description: 'Copy Element Info' },
            'Ctrl+Shift+I': { action: 'toggleDevMode', description: 'Toggle Developer Mode' }
        };
    }

    /**
     * Create the main overlay container
     */
    createOverlayContainer() {
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.id = 'element-overlay-ui';
        this.overlayContainer.innerHTML = `
            <style>
                #element-overlay-ui {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 999998;
                    font-family: 'BraveEightyone', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    color: var(--verridian-cosmic-white, rgba(255, 255, 255, 0.95));
                    display: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                #element-overlay-ui.visible {
                    display: block;
                    opacity: 1;
                }

                #element-overlay-ui.active {
                    pointer-events: auto;
                }

                /* Overlay Background */
                .overlay-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(10, 0, 32, 0.15);
                    backdrop-filter: blur(2px);
                    -webkit-backdrop-filter: blur(2px);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .overlay-backdrop.active {
                    opacity: 1;
                }

                /* Control Panel - Floating Toolbar */
                .overlay-control-panel {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-100%);
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    background: rgba(10, 0, 32, 0.85);
                    backdrop-filter: blur(20px) saturate(150%);
                    -webkit-backdrop-filter: blur(20px) saturate(150%);
                    border: 1px solid rgba(107, 70, 193, 0.3);
                    border-radius: 16px;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 40px rgba(107, 70, 193, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: auto;
                    z-index: 1000001;
                }

                .overlay-control-panel.visible {
                    transform: translateX(-50%) translateY(0);
                }

                /* Control Buttons */
                .overlay-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: var(--verridian-cosmic-white);
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    user-select: none;
                    min-width: 44px;
                    justify-content: center;
                }

                .overlay-btn::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: radial-gradient(circle, var(--verridian-plasma-pink, #EC4899), transparent);
                    transition: width 0.3s, height 0.3s;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    opacity: 0.3;
                }

                .overlay-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.3);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(107, 70, 193, 0.4);
                }

                .overlay-btn:hover::before {
                    width: 100px;
                    height: 100px;
                }

                .overlay-btn.active {
                    background: linear-gradient(135deg, 
                        rgba(107, 70, 193, 0.4), 
                        rgba(37, 99, 235, 0.4));
                    border-color: var(--verridian-stellar-gold, #F59E0B);
                    box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
                }

                .overlay-btn:active {
                    transform: translateY(0) scale(0.98);
                }

                /* Button Icons */
                .overlay-btn-icon {
                    font-size: 1rem;
                    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
                }

                /* Info Panel - Sophisticated Element Details */
                .overlay-info-panel {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    width: 360px;
                    max-height: calc(100vh - 120px);
                    background: rgba(10, 0, 32, 0.9);
                    backdrop-filter: blur(25px) saturate(160%);
                    -webkit-backdrop-filter: blur(25px) saturate(160%);
                    border: 1px solid rgba(107, 70, 193, 0.3);
                    border-radius: 16px;
                    box-shadow: 
                        0 16px 48px rgba(0, 0, 0, 0.5),
                        0 0 60px rgba(107, 70, 193, 0.15),
                        inset 0 2px 0 rgba(255, 255, 255, 0.1);
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    overflow: hidden;
                    pointer-events: auto;
                    z-index: 1000000;
                }

                .overlay-info-panel.visible {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }

                .info-panel-header {
                    padding: 16px 20px;
                    background: linear-gradient(135deg, 
                        rgba(107, 70, 193, 0.2), 
                        rgba(37, 99, 235, 0.2));
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .info-panel-title {
                    font-family: 'GalacticVanguardian', sans-serif;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--verridian-stellar-gold, #F59E0B);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .info-panel-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 4px;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }

                .info-panel-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .info-panel-content {
                    padding: 20px;
                    overflow-y: auto;
                    max-height: calc(100vh - 200px);
                }

                .info-section {
                    margin-bottom: 24px;
                }

                .info-section-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--verridian-cosmic-blue, #2563EB);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(37, 99, 235, 0.3);
                }

                .info-item {
                    display: flex;
                    margin-bottom: 8px;
                    font-size: 0.85rem;
                }

                .info-label {
                    min-width: 90px;
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 500;
                }

                .info-value {
                    color: rgba(255, 255, 255, 0.9);
                    word-break: break-all;
                    flex: 1;
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                /* Status Panel - Bottom Notification Bar */
                .overlay-status-panel {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(10, 0, 32, 0.9);
                    backdrop-filter: blur(20px) saturate(150%);
                    -webkit-backdrop-filter: blur(20px) saturate(150%);
                    border: 1px solid rgba(107, 70, 193, 0.3);
                    border-radius: 12px;
                    padding: 12px 20px;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 40px rgba(107, 70, 193, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transform: translateY(100%);
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: auto;
                    z-index: 1000000;
                }

                .overlay-status-panel.visible {
                    transform: translateY(0);
                }

                .status-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }

                .status-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.9);
                }

                .status-icon {
                    font-size: 1rem;
                    animation: pulse 2s infinite;
                }

                .status-shortcuts {
                    display: flex;
                    gap: 12px;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .status-shortcut {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .shortcut-key {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.7rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                /* Context Menu */
                .overlay-context-menu {
                    position: fixed;
                    background: rgba(10, 0, 32, 0.95);
                    backdrop-filter: blur(25px) saturate(160%);
                    -webkit-backdrop-filter: blur(25px) saturate(160%);
                    border: 1px solid rgba(107, 70, 193, 0.4);
                    border-radius: 12px;
                    box-shadow: 
                        0 16px 48px rgba(0, 0, 0, 0.5),
                        0 0 40px rgba(107, 70, 193, 0.2),
                        inset 0 2px 0 rgba(255, 255, 255, 0.1);
                    padding: 8px;
                    min-width: 200px;
                    transform: scale(0.8);
                    opacity: 0;
                    transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: auto;
                    z-index: 1000002;
                    display: none;
                }

                .overlay-context-menu.visible {
                    display: block;
                    transform: scale(1);
                    opacity: 1;
                }

                .context-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.9);
                }

                .context-menu-item:hover {
                    background: rgba(107, 70, 193, 0.3);
                    color: white;
                    transform: translateX(2px);
                }

                .context-menu-separator {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 4px 8px;
                }

                /* Notification System */
                .overlay-notifications {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000003;
                    pointer-events: none;
                }

                .overlay-notification {
                    background: rgba(10, 0, 32, 0.95);
                    backdrop-filter: blur(20px) saturate(150%);
                    -webkit-backdrop-filter: blur(20px) saturate(150%);
                    border: 1px solid rgba(107, 70, 193, 0.4);
                    border-radius: 12px;
                    padding: 12px 16px;
                    margin-bottom: 8px;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 20px rgba(107, 70, 193, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: auto;
                    min-width: 280px;
                    max-width: 400px;
                }

                .overlay-notification.visible {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }

                .overlay-notification.success {
                    border-color: rgba(16, 185, 129, 0.5);
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 20px rgba(16, 185, 129, 0.3);
                }

                .overlay-notification.error {
                    border-color: rgba(239, 68, 68, 0.5);
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 20px rgba(239, 68, 68, 0.3);
                }

                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .notification-icon {
                    font-size: 1.2rem;
                    margin-top: 2px;
                }

                .notification-message {
                    flex: 1;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: var(--verridian-stellar-gold, #F59E0B);
                }

                .notification-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 2px;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    margin-left: 8px;
                }

                .notification-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .overlay-control-panel {
                        left: 10px;
                        right: 10px;
                        transform: translateY(-100%);
                        max-width: none;
                        justify-content: space-between;
                    }

                    .overlay-control-panel.visible {
                        transform: translateY(0);
                    }

                    .overlay-btn {
                        min-width: auto;
                        padding: 6px 8px;
                        font-size: 0.8rem;
                    }

                    .overlay-btn-text {
                        display: none;
                    }

                    .overlay-info-panel {
                        width: calc(100vw - 40px);
                        right: 20px;
                        left: 20px;
                        max-height: calc(100vh - 140px);
                    }

                    .overlay-status-panel {
                        left: 10px;
                        right: 10px;
                        padding: 10px 16px;
                    }

                    .status-shortcuts {
                        display: none;
                    }

                    .overlay-notifications {
                        right: 10px;
                        left: 10px;
                    }

                    .overlay-notification {
                        min-width: auto;
                        max-width: none;
                    }
                }

                /* Animation Classes */
                .fade-in {
                    animation: fadeIn 0.3s ease;
                }

                .fade-out {
                    animation: fadeOut 0.3s ease;
                }

                .slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                .slide-down {
                    animation: slideDown 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* Accessibility */
                @media (prefers-reduced-motion: reduce) {
                    .overlay-control-panel,
                    .overlay-info-panel,
                    .overlay-status-panel,
                    .overlay-context-menu,
                    .overlay-notification {
                        transition: none !important;
                        animation: none !important;
                    }

                    .overlay-btn,
                    .context-menu-item {
                        transition: none !important;
                    }

                    .status-icon {
                        animation: none !important;
                    }
                }

                /* Focus Styles */
                .overlay-btn:focus,
                .info-panel-close:focus,
                .notification-close:focus,
                .context-menu-item:focus {
                    outline: 2px solid var(--verridian-stellar-gold, #F59E0B);
                    outline-offset: 2px;
                }
            </style>
        `;
        
        document.body.appendChild(this.overlayContainer);
    }

    /**
     * Create the floating control panel
     */
    createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'overlay-control-panel';
        controlPanel.innerHTML = `
            <button class="overlay-btn" data-action="toggleInspector" title="Toggle Inspector (Alt+I)">
                <span class="overlay-btn-icon">🔍</span>
                <span class="overlay-btn-text">Inspect</span>
            </button>
            <button class="overlay-btn" data-action="captureScreenshot" title="Capture Screenshot (Alt+S)">
                <span class="overlay-btn-icon">📸</span>
                <span class="overlay-btn-text">Capture</span>
            </button>
            <button class="overlay-btn" data-action="analyzeElement" title="Analyze Element (Alt+A)">
                <span class="overlay-btn-icon">🔬</span>
                <span class="overlay-btn-text">Analyze</span>
            </button>
            <button class="overlay-btn" data-action="openChat" title="Open AI Chat (Alt+C)">
                <span class="overlay-btn-icon">💬</span>
                <span class="overlay-btn-text">Chat</span>
            </button>
            <button class="overlay-btn" data-action="toggleHelp" title="Show Help (Alt+H)">
                <span class="overlay-btn-icon">❓</span>
                <span class="overlay-btn-text">Help</span>
            </button>
        `;
        
        this.controlPanel = controlPanel;
        this.overlayContainer.appendChild(controlPanel);
    }

    /**
     * Create the information panel
     */
    createInfoPanel() {
        const infoPanel = document.createElement('div');
        infoPanel.className = 'overlay-info-panel';
        infoPanel.innerHTML = `
            <div class="info-panel-header">
                <div class="info-panel-title">Element Details</div>
                <button class="info-panel-close" data-action="closeInfo" title="Close Panel">✕</button>
            </div>
            <div class="info-panel-content">
                <div class="info-section">
                    <div class="info-section-title">Basic Information</div>
                    <div id="info-basic-content"></div>
                </div>
                <div class="info-section">
                    <div class="info-section-title">Computed Styles</div>
                    <div id="info-styles-content"></div>
                </div>
                <div class="info-section">
                    <div class="info-section-title">Attributes</div>
                    <div id="info-attributes-content"></div>
                </div>
                <div class="info-section">
                    <div class="info-section-title">Accessibility</div>
                    <div id="info-accessibility-content"></div>
                </div>
                <div class="info-section">
                    <div class="info-section-title">Performance</div>
                    <div id="info-performance-content"></div>
                </div>
            </div>
        `;
        
        this.infoPanel = infoPanel;
        this.overlayContainer.appendChild(infoPanel);
    }

    /**
     * Create the status panel
     */
    createStatusPanel() {
        const statusPanel = document.createElement('div');
        statusPanel.className = 'overlay-status-panel';
        statusPanel.innerHTML = `
            <div class="status-content">
                <div class="status-message">
                    <span class="status-icon">🎯</span>
                    <span id="status-text">Element Overlay UI Ready</span>
                </div>
                <div class="status-shortcuts">
                    <div class="status-shortcut">
                        <span class="shortcut-key">Alt+I</span>
                        <span>Inspect</span>
                    </div>
                    <div class="status-shortcut">
                        <span class="shortcut-key">Alt+S</span>
                        <span>Screenshot</span>
                    </div>
                    <div class="status-shortcut">
                        <span class="shortcut-key">Alt+C</span>
                        <span>Chat</span>
                    </div>
                    <div class="status-shortcut">
                        <span class="shortcut-key">Esc</span>
                        <span>Exit</span>
                    </div>
                </div>
            </div>
        `;
        
        this.statusPanel = statusPanel;
        this.overlayContainer.appendChild(statusPanel);
    }

    /**
     * Create context menu
     */
    createContextMenu() {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'overlay-context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="inspectElement">
                <span>🔍</span> Inspect Element
            </div>
            <div class="context-menu-item" data-action="captureElement">
                <span>📸</span> Capture Screenshot
            </div>
            <div class="context-menu-item" data-action="copySelector">
                <span>📋</span> Copy Selector
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="analyzeAccessibility">
                <span>♿</span> Check Accessibility
            </div>
            <div class="context-menu-item" data-action="analyzePerformance">
                <span>⚡</span> Performance Analysis
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="aiAnalysis">
                <span>🤖</span> AI Analysis
            </div>
        `;
        
        this.contextMenu = contextMenu;
        this.overlayContainer.appendChild(contextMenu);
    }

    /**
     * Create shortcut display
     */
    createShortcutDisplay() {
        const shortcutDisplay = document.createElement('div');
        shortcutDisplay.className = 'overlay-shortcut-display';
        // Shortcuts are shown in status panel for better integration
        this.shortcutDisplay = shortcutDisplay;
    }

    /**
     * Create notification system container
     */
    createNotificationSystem() {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'overlay-notifications';
        notificationContainer.id = 'overlay-notifications';
        
        this.overlayContainer.appendChild(notificationContainer);
    }

    /**
     * Connect to existing systems
     */
    connectToSystems() {
        // Connect to Element Inspector
        if (window.elementInspector) {
            this.elementInspector = window.elementInspector;
            console.log('🔗 Connected to Element Inspector');
        }

        // Connect to Screenshot System
        if (window.screenshotCaptureSystem) {
            this.screenshotSystem = window.screenshotCaptureSystem;
            console.log('🔗 Connected to Screenshot Capture System');
        }

        // Setup WebSocket connection
        this.setupWebSocket();
    }

    /**
     * Setup WebSocket connection
     */
    setupWebSocket() {
        try {
            const brokerUrl = `ws://localhost:${window.BROKER_PORT || 7071}?token=devtoken123`;
            this.websocket = new WebSocket(brokerUrl);

            this.websocket.onopen = () => {
                console.log('🔗 Overlay UI connected to WebSocket broker');
                this.sendWebSocketMessage({
                    type: 'overlay_ui_ready',
                    timestamp: Date.now()
                });
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.websocket.onclose = () => {
                console.warn('🔌 WebSocket connection closed, attempting reconnect...');
                setTimeout(() => this.setupWebSocket(), 3000);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to setup WebSocket:', error);
        }
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'element_selected':
                this.handleElementSelected(data.element);
                break;
            case 'screenshot_captured':
                this.showNotification('Screenshot captured successfully', 'success');
                break;
            case 'ai_analysis_complete':
                this.handleAIAnalysis(data);
                break;
            case 'overlay_command':
                this.executeCommand(data.command, data.params);
                break;
        }
    }

    /**
     * Send WebSocket message
     */
    sendWebSocketMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        }
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Control panel button events
        this.controlPanel.addEventListener('click', (e) => {
            const button = e.target.closest('.overlay-btn');
            if (button) {
                const action = button.dataset.action;
                this.executeAction(action);
            }
        });

        // Info panel close button
        this.infoPanel.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="closeInfo"]')) {
                this.hideInfoPanel();
            }
        });

        // Context menu events
        this.contextMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                const action = item.dataset.action;
                this.executeContextAction(action);
                this.hideContextMenu();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcut(e);
        });

        // Click outside to close context menu
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        // Prevent context menu on overlay
        this.overlayContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcut(e) {
        const key = this.getKeyboardShortcut(e);
        const shortcut = this.keyboardShortcuts[key];
        
        if (shortcut) {
            e.preventDefault();
            this.executeAction(shortcut.action);
        }
    }

    /**
     * Get keyboard shortcut string
     */
    getKeyboardShortcut(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        if (e.metaKey) parts.push('Cmd');
        
        if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
            parts.push(e.key);
        }
        
        return parts.join('+');
    }

    /**
     * Execute action
     */
    executeAction(action) {
        switch (action) {
            case 'toggleInspector':
                this.toggleInspector();
                break;
            case 'captureScreenshot':
                this.captureScreenshot();
                break;
            case 'analyzeElement':
                this.analyzeElement();
                break;
            case 'openChat':
                this.openChat();
                break;
            case 'toggleHelp':
                this.toggleHelp();
                break;
            case 'exitMode':
                this.exitMode();
                break;
            case 'confirmAction':
                this.confirmAction();
                break;
            case 'captureElement':
                this.captureSelectedElement();
                break;
            case 'copyElementInfo':
                this.copyElementInfo();
                break;
            case 'toggleDevMode':
                this.toggleDevMode();
                break;
        }
    }

    /**
     * Execute context menu action
     */
    executeContextAction(action) {
        switch (action) {
            case 'inspectElement':
                this.inspectElement();
                break;
            case 'captureElement':
                this.captureSelectedElement();
                break;
            case 'copySelector':
                this.copySelector();
                break;
            case 'analyzeAccessibility':
                this.analyzeAccessibility();
                break;
            case 'analyzePerformance':
                this.analyzePerformance();
                break;
            case 'aiAnalysis':
                this.requestAIAnalysis();
                break;
        }
    }

    // Action implementations
    toggleInspector() {
        if (this.elementInspector) {
            this.elementInspector.toggle();
            this.updateControlButton('toggleInspector', this.elementInspector.isActive);
            this.updateStatus(this.elementInspector.isActive ? 'Inspector activated' : 'Inspector deactivated');
        }
    }

    captureScreenshot() {
        if (this.screenshotSystem) {
            this.screenshotSystem.captureFullPage();
            this.updateStatus('Capturing screenshot...');
        }
    }

    analyzeElement() {
        if (this.selectedElement) {
            this.showInfoPanel();
            this.updateElementInfo(this.selectedElement);
            this.updateStatus('Analyzing selected element...');
        } else {
            this.showNotification('No element selected. Click an element first.', 'warning');
        }
    }

    openChat() {
        if (this.elementInspector) {
            this.elementInspector.toggleChat();
            this.updateStatus('AI chat opened');
        }
    }

    toggleHelp() {
        this.showHelp();
    }

    exitMode() {
        if (this.elementInspector && this.elementInspector.isActive) {
            this.elementInspector.deactivate();
        }
        this.hide();
    }

    captureSelectedElement() {
        if (this.selectedElement && this.screenshotSystem) {
            const selector = this.generateSelector(this.selectedElement);
            this.screenshotSystem.captureElement(selector);
            this.updateStatus('Capturing element screenshot...');
        } else {
            this.showNotification('No element selected', 'warning');
        }
    }

    copyElementInfo() {
        if (this.selectedElement) {
            const info = this.extractElementInfo(this.selectedElement);
            navigator.clipboard.writeText(JSON.stringify(info, null, 2));
            this.showNotification('Element info copied to clipboard', 'success');
        }
    }

    // UI Control Methods
    show() {
        if (!this.isVisible) {
            this.isVisible = true;
            this.overlayContainer.classList.add('visible', 'active');
            this.controlPanel.classList.add('visible');
            this.statusPanel.classList.add('visible');
            this.updateStatus('Element Overlay UI activated');
        }
    }

    hide() {
        if (this.isVisible) {
            this.isVisible = false;
            this.overlayContainer.classList.remove('visible', 'active');
            this.controlPanel.classList.remove('visible');
            this.statusPanel.classList.remove('visible');
            this.hideInfoPanel();
            this.hideContextMenu();
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    showInfoPanel() {
        this.infoPanel.classList.add('visible');
    }

    hideInfoPanel() {
        this.infoPanel.classList.remove('visible');
    }

    showContextMenu(x, y) {
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.contextMenu.classList.add('visible');
    }

    hideContextMenu() {
        this.contextMenu.classList.remove('visible');
    }

    updateStatus(message, icon = '🎯') {
        const statusText = document.getElementById('status-text');
        const statusIcon = this.statusPanel.querySelector('.status-icon');
        
        if (statusText) statusText.textContent = message;
        if (statusIcon) statusIcon.textContent = icon;
    }

    updateControlButton(action, active) {
        const button = this.controlPanel.querySelector(`[data-action="${action}"]`);
        if (button) {
            button.classList.toggle('active', active);
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `overlay-notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        const container = document.getElementById('overlay-notifications');
        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);

        this.notifications.push(notification);
    }

    showHelp() {
        const helpContent = Object.entries(this.keyboardShortcuts)
            .map(([key, shortcut]) => `<div class="info-item"><span class="info-label">${key}:</span><span class="info-value">${shortcut.description}</span></div>`)
            .join('');

        this.infoPanel.querySelector('#info-basic-content').innerHTML = `
            <div class="info-section-title">Keyboard Shortcuts</div>
            ${helpContent}
        `;
        
        this.showInfoPanel();
    }

    // Element handling methods
    handleElementSelected(element) {
        this.selectedElement = element;
        this.updateElementInfo(element);
        this.showInfoPanel();
        this.updateStatus(`Selected: ${element.tagName.toLowerCase()}`);
    }

    updateElementInfo(element) {
        if (!element) return;

        const info = this.extractElementInfo(element);
        
        // Basic information
        document.getElementById('info-basic-content').innerHTML = `
            <div class="info-item"><span class="info-label">Tag:</span><span class="info-value">${info.tagName}</span></div>
            <div class="info-item"><span class="info-label">ID:</span><span class="info-value">${info.id || 'none'}</span></div>
            <div class="info-item"><span class="info-label">Classes:</span><span class="info-value">${info.className || 'none'}</span></div>
            <div class="info-item"><span class="info-label">Text:</span><span class="info-value">${info.textContent || 'none'}</span></div>
            <div class="info-item"><span class="info-label">Selector:</span><span class="info-value">${info.selector}</span></div>
        `;

        // Computed styles
        document.getElementById('info-styles-content').innerHTML = `
            <div class="info-item"><span class="info-label">Display:</span><span class="info-value">${info.styles.display}</span></div>
            <div class="info-item"><span class="info-label">Position:</span><span class="info-value">${info.styles.position}</span></div>
            <div class="info-item"><span class="info-label">Size:</span><span class="info-value">${info.bounds.width} × ${info.bounds.height}</span></div>
            <div class="info-item"><span class="info-label">Color:</span><span class="info-value">${info.styles.color}</span></div>
            <div class="info-item"><span class="info-label">Background:</span><span class="info-value">${info.styles.backgroundColor}</span></div>
        `;

        // Attributes
        const attributesHtml = Object.entries(info.attributes)
            .map(([name, value]) => `<div class="info-item"><span class="info-label">${name}:</span><span class="info-value">${value}</span></div>`)
            .join('') || '<div class="info-item">No attributes</div>';
        document.getElementById('info-attributes-content').innerHTML = attributesHtml;

        // Accessibility
        document.getElementById('info-accessibility-content').innerHTML = `
            <div class="info-item"><span class="info-label">Role:</span><span class="info-value">${info.accessibility.role || 'none'}</span></div>
            <div class="info-item"><span class="info-label">ARIA Label:</span><span class="info-value">${info.accessibility.ariaLabel || 'none'}</span></div>
            <div class="info-item"><span class="info-label">Focusable:</span><span class="info-value">${info.accessibility.tabIndex >= 0 ? 'yes' : 'no'}</span></div>
            <div class="info-item"><span class="info-label">Alt Text:</span><span class="info-value">${element.getAttribute('alt') || 'none'}</span></div>
        `;

        // Performance metrics
        const performanceInfo = this.analyzeElementPerformance(element);
        document.getElementById('info-performance-content').innerHTML = `
            <div class="info-item"><span class="info-label">Paint Cost:</span><span class="info-value">${performanceInfo.paintCost}</span></div>
            <div class="info-item"><span class="info-label">Layout Cost:</span><span class="info-value">${performanceInfo.layoutCost}</span></div>
            <div class="info-item"><span class="info-label">Children:</span><span class="info-value">${element.children.length}</span></div>
            <div class="info-item"><span class="info-label">Depth:</span><span class="info-value">${performanceInfo.depth}</span></div>
        `;
    }

    extractElementInfo(element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);

        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id || null,
            className: element.className || null,
            textContent: element.textContent?.slice(0, 100) || null,
            selector: this.generateSelector(element),
            bounds: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            },
            styles: {
                display: computedStyle.display,
                position: computedStyle.position,
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor,
                fontSize: computedStyle.fontSize,
                fontFamily: computedStyle.fontFamily
            },
            attributes: this.extractAttributes(element),
            accessibility: {
                role: element.getAttribute('role'),
                ariaLabel: element.getAttribute('aria-label'),
                tabIndex: element.tabIndex
            }
        };
    }

    extractAttributes(element) {
        const attributes = {};
        for (let attr of element.attributes) {
            attributes[attr.name] = attr.value;
        }
        return attributes;
    }

    generateSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }

        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.length > 0);
            if (classes.length > 0) {
                return `.${classes.join('.')}`;
            }
        }

        // Generate path-based selector
        const path = [];
        let current = element;

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                selector = `#${current.id}`;
                path.unshift(selector);
                break;
            }

            const siblings = Array.from(current.parentElement?.children || []);
            const sameTag = siblings.filter(s => s.tagName === current.tagName);
            
            if (sameTag.length > 1) {
                const index = sameTag.indexOf(current) + 1;
                selector += `:nth-of-type(${index})`;
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    analyzeElementPerformance(element) {
        // Simple performance analysis
        const childrenCount = element.children.length;
        let depth = 0;
        let current = element;
        
        while (current.parentElement) {
            depth++;
            current = current.parentElement;
        }

        return {
            paintCost: childrenCount > 10 ? 'High' : childrenCount > 3 ? 'Medium' : 'Low',
            layoutCost: depth > 8 ? 'High' : depth > 4 ? 'Medium' : 'Low',
            depth
        };
    }

    handleAIAnalysis(data) {
        if (data.analysis) {
            this.showNotification(`AI Analysis: ${data.analysis.summary}`, 'info', 6000);
        }
    }

    // Integration with other systems
    setElementInspector(elementInspector) {
        this.elementInspector = elementInspector;
    }

    setScreenshotSystem(screenshotSystem) {
        this.screenshotSystem = screenshotSystem;
    }

    // Public API
    getSelectedElement() {
        return this.selectedElement;
    }

    getCurrentMode() {
        return this.currentMode;
    }

    isUIVisible() {
        return this.isVisible;
    }
}

// Initialize the overlay UI system
window.elementOverlayUI = new ElementOverlayUI();

// Integration with existing systems
if (window.elementInspector) {
    window.elementOverlayUI.setElementInspector(window.elementInspector);
}

if (window.screenshotCaptureSystem) {
    window.elementOverlayUI.setScreenshotSystem(window.screenshotCaptureSystem);
}

// Global keyboard shortcut to toggle overlay (Alt + O)
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'o') {
        e.preventDefault();
        window.elementOverlayUI.toggle();
    }
});

console.log('🎨 Element Overlay UI loaded! Press Alt+O to toggle the overlay interface.');