/**
 * Collaboration System - Frontend Integration Enhancement
 * Extends the Verridian showroom with collaboration features including
 * element selection, screenshot annotation, IDE integration, and real-time collaboration
 */

class CollaborationSystem {
    constructor(integrationAgent) {
        this.agent = integrationAgent;
        this.isActive = false;
        this.mode = 'normal'; // normal, element-selection, annotation, collaboration
        
        // Element Selection State
        this.elementSelectionActive = false;
        this.selectedElements = new Set();
        this.hoveredElement = null;
        this.selectionOverlay = null;
        
        // Screenshot Annotation State
        this.annotationMode = false;
        this.annotationCanvas = null;
        this.annotationContext = null;
        this.drawingHistory = [];
        this.currentDrawing = null;
        
        // IDE Integration State
        this.ideConnections = {
            'claude-code': { connected: false, status: 'disconnected' },
            'cursor': { connected: false, status: 'disconnected' },
            'windsurf': { connected: false, status: 'disconnected' }
        };
        
        // Real-time Collaboration State
        this.collaborators = new Map();
        this.cursors = new Map();
        this.presenceIndicators = new Map();
        
        // AI Analysis State
        this.aiAnalysisActive = false;
        this.analysisProgress = 0;
        this.analysisQueue = [];
        
        // UI Components
        this.collaborationUI = null;
        this.elementSelectionUI = null;
        this.annotationUI = null;
        this.ideIntegrationUI = null;
        this.collaborationPanel = null;
        this.aiAnalysisUI = null;
        
        // Event Handlers
        this.boundHandlers = {
            elementHover: this.handleElementHover.bind(this),
            elementClick: this.handleElementClick.bind(this),
            keydown: this.handleKeydown.bind(this),
            mouseMove: this.handleMouseMove.bind(this),
            resize: this.handleResize.bind(this)
        };
        
        this.initialize();
    }
    
    /**
     * Initialize the collaboration system
     */
    async initialize() {
        try {
            await this.createCollaborationUI();
            await this.setupWebSocketHandlers();
            await this.initializeEventListeners();
            
            console.log('Collaboration System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Collaboration System:', error);
        }
    }
    
    /**
     * Create the main collaboration UI
     */
    async createCollaborationUI() {
        // Create floating action button for collaboration features
        this.collaborationUI = document.createElement('div');
        this.collaborationUI.className = 'collaboration-fab glass-premium';
        this.collaborationUI.innerHTML = `
            <button class="fab-main btn-cosmic" title="Collaboration Tools">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h2v4h2v2H4c-1.11 0-2-.89-2-2zM13 8.5l-3 3-1.5-1.5L7 11.5 10.5 15 19 6.5 17.5 5 13 8.5z"/>
                </svg>
            </button>
            <div class="fab-menu">
                <button class="fab-item btn-cosmic" data-action="element-selection" title="Element Selection Mode">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </button>
                <button class="fab-item btn-cosmic" data-action="screenshot-annotation" title="Screenshot Annotation">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="fab-item btn-cosmic" data-action="ide-integration" title="IDE Integration">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                    </svg>
                </button>
                <button class="fab-item btn-cosmic" data-action="collaboration-panel" title="Live Collaboration">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h2v4h2v2H4c-1.11 0-2-.89-2-2zM13 8.5l-3 3-1.5-1.5L7 11.5 10.5 15 19 6.5 17.5 5 13 8.5z"/>
                    </svg>
                </button>
                <button class="fab-item btn-cosmic" data-action="ai-analysis" title="AI Analysis">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Add collaboration styles
        const collaborationStyles = document.createElement('style');
        collaborationStyles.textContent = `
            .collaboration-fab {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
            }
            
            .fab-main {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
            }
            
            .fab-main:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 35px rgba(139, 69, 19, 0.4);
            }
            
            .fab-menu {
                display: none;
                flex-direction: column;
                gap: 10px;
                align-items: center;
                transform: translateY(20px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            .fab-menu.active {
                display: flex;
                transform: translateY(0);
                opacity: 1;
            }
            
            .fab-item {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                transform: scale(0);
                animation: fabItemIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }
            
            .fab-item:nth-child(1) { animation-delay: 0.1s; }
            .fab-item:nth-child(2) { animation-delay: 0.2s; }
            .fab-item:nth-child(3) { animation-delay: 0.3s; }
            .fab-item:nth-child(4) { animation-delay: 0.4s; }
            .fab-item:nth-child(5) { animation-delay: 0.5s; }
            
            @keyframes fabItemIn {
                to {
                    transform: scale(1);
                }
            }
            
            .fab-item:hover {
                transform: scale(1.1);
            }
            
            .fab-item.active {
                background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
                box-shadow: 0 0 20px rgba(139, 69, 19, 0.5);
            }
            
            /* Element Selection Overlay */
            .element-selection-overlay {
                position: absolute;
                pointer-events: none;
                border: 3px solid #FF6B35;
                border-radius: 8px;
                background: rgba(255, 107, 53, 0.1);
                backdrop-filter: blur(2px);
                z-index: 9999;
                transition: all 0.2s ease;
                box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
            }
            
            .element-selection-overlay.selected {
                border-color: #00D4AA;
                background: rgba(0, 212, 170, 0.15);
                box-shadow: 0 0 25px rgba(0, 212, 170, 0.5);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.02); opacity: 1; }
            }
            
            .element-info-tooltip {
                position: absolute;
                top: -40px;
                left: 0;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-family: 'Monaco', 'Menlo', monospace;
                white-space: nowrap;
                z-index: 10001;
                backdrop-filter: blur(10px);
            }
            
            /* Screenshot Annotation Canvas */
            .annotation-canvas-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9998;
                pointer-events: none;
            }
            
            .annotation-canvas-container.active {
                pointer-events: all;
            }
            
            .annotation-canvas {
                width: 100%;
                height: 100%;
                cursor: crosshair;
            }
            
            .annotation-toolbar {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10002;
                display: none;
                gap: 10px;
                align-items: center;
                padding: 15px 25px;
                border-radius: 25px;
            }
            
            .annotation-toolbar.active {
                display: flex;
            }
            
            .annotation-tool {
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .annotation-tool:hover {
                transform: scale(1.1);
            }
            
            .annotation-tool.active {
                box-shadow: 0 0 15px rgba(255, 107, 53, 0.5);
            }
            
            /* Collaboration Panel */
            .collaboration-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                max-height: 70vh;
                overflow-y: auto;
                z-index: 9999;
                padding: 25px;
                border-radius: 20px;
                display: none;
                flex-direction: column;
                gap: 20px;
            }
            
            .collaboration-panel.active {
                display: flex;
                animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .panel-section {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 15px;
            }
            
            .panel-section:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .panel-section h3 {
                margin: 0 0 15px 0;
                color: var(--text-primary);
                font-size: 16px;
                font-weight: 600;
            }
            
            .collaborator-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .collaborator-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                transition: all 0.2s ease;
            }
            
            .collaborator-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .collaborator-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #FF6B35, #00D4AA);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            
            .collaborator-info {
                flex: 1;
            }
            
            .collaborator-name {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 2px;
            }
            
            .collaborator-status {
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .collaborator-cursor {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                transition: all 0.1s ease;
            }
            
            .cursor-pointer {
                width: 20px;
                height: 20px;
                background: #FF6B35;
                clip-path: polygon(0% 0%, 100% 35%, 35% 35%, 35% 100%);
                position: relative;
            }
            
            .cursor-label {
                position: absolute;
                top: 25px;
                left: 0;
                background: #FF6B35;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                font-weight: 600;
            }
            
            /* AI Analysis UI */
            .ai-analysis-panel {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 350px;
                z-index: 9999;
                padding: 20px;
                border-radius: 16px;
                display: none;
                flex-direction: column;
                gap: 15px;
            }
            
            .ai-analysis-panel.active {
                display: flex;
                animation: slideInLeft 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            @keyframes slideInLeft {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .analysis-progress {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                position: relative;
            }
            
            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #FF6B35, #00D4AA);
                border-radius: 3px;
                transition: width 0.3s ease;
                position: relative;
            }
            
            .progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .analysis-queue {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .queue-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .queue-item:last-child {
                border-bottom: none;
            }
            
            .queue-status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #FFD700;
            }
            
            .queue-status.processing {
                background: #00D4AA;
                animation: pulse 1s infinite;
            }
            
            .queue-status.completed {
                background: #32CD32;
            }
            
            .queue-status.error {
                background: #FF4444;
            }
            
            /* IDE Integration Panel */
            .ide-integration-panel {
                position: fixed;
                top: 50%;
                left: 20px;
                transform: translateY(-50%);
                width: 280px;
                z-index: 9999;
                padding: 20px;
                border-radius: 16px;
                display: none;
                flex-direction: column;
                gap: 15px;
            }
            
            .ide-integration-panel.active {
                display: flex;
                animation: slideInLeft 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            .ide-connection {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                transition: all 0.2s ease;
            }
            
            .ide-connection:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .ide-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ide-icon {
                width: 24px;
                height: 24px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ide-status {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #FF4444;
                transition: all 0.2s ease;
            }
            
            .ide-status.connected {
                background: #32CD32;
                box-shadow: 0 0 10px rgba(50, 205, 50, 0.5);
            }
            
            .ide-status.connecting {
                background: #FFD700;
                animation: pulse 1s infinite;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .collaboration-fab {
                    bottom: 20px;
                    right: 20px;
                    scale: 0.9;
                }
                
                .collaboration-panel {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                }
                
                .ai-analysis-panel,
                .ide-integration-panel {
                    width: calc(100vw - 40px);
                    left: 20px;
                    right: 20px;
                }
                
                .annotation-toolbar {
                    left: 20px;
                    right: 20px;
                    transform: none;
                    width: calc(100vw - 40px);
                    justify-content: center;
                }
            }
            
            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .collaboration-fab,
                .fab-item,
                .element-selection-overlay,
                .collaborator-cursor,
                .progress-bar::after {
                    animation: none;
                    transition: none;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .element-selection-overlay {
                    border-width: 4px;
                    background: rgba(255, 107, 53, 0.3);
                }
                
                .element-selection-overlay.selected {
                    border-width: 4px;
                    background: rgba(0, 212, 170, 0.3);
                }
            }
        `;
        
        document.head.appendChild(collaborationStyles);
        document.body.appendChild(this.collaborationUI);
        
        // Set up FAB interactions
        this.setupFABInteractions();
    }
    
    /**
     * Setup floating action button interactions
     */
    setupFABInteractions() {
        const fabMain = this.collaborationUI.querySelector('.fab-main');
        const fabMenu = this.collaborationUI.querySelector('.fab-menu');
        const fabItems = this.collaborationUI.querySelectorAll('.fab-item');
        
        let menuOpen = false;
        
        fabMain.addEventListener('click', (e) => {
            e.stopPropagation();
            menuOpen = !menuOpen;
            
            if (menuOpen) {
                fabMenu.classList.add('active');
                fabMain.style.transform = 'rotate(45deg)';
            } else {
                fabMenu.classList.remove('active');
                fabMain.style.transform = 'rotate(0deg)';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            if (menuOpen) {
                fabMenu.classList.remove('active');
                fabMain.style.transform = 'rotate(0deg)';
                menuOpen = false;
            }
        });
        
        // Handle fab item clicks
        fabItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                this.handleCollaborationAction(action, item);
            });
        });
    }
    
    /**
     * Handle collaboration action from FAB menu
     */
    async handleCollaborationAction(action, buttonElement) {
        // Update active state
        const fabItems = this.collaborationUI.querySelectorAll('.fab-item');
        fabItems.forEach(item => item.classList.remove('active'));
        buttonElement.classList.add('active');
        
        switch (action) {
            case 'element-selection':
                await this.toggleElementSelection();
                break;
            case 'screenshot-annotation':
                await this.toggleScreenshotAnnotation();
                break;
            case 'ide-integration':
                await this.toggleIDEIntegration();
                break;
            case 'collaboration-panel':
                await this.toggleCollaborationPanel();
                break;
            case 'ai-analysis':
                await this.toggleAIAnalysis();
                break;
        }
    }
    
    /**
     * Toggle element selection mode
     */
    async toggleElementSelection() {
        this.elementSelectionActive = !this.elementSelectionActive;
        
        if (this.elementSelectionActive) {
            console.log('🎯 Element selection mode activated');
            
            // Enable element selection
            this.mode = 'element-selection';
            document.body.style.cursor = 'crosshair';
            
            // Add event listeners for element selection
            document.addEventListener('mouseover', this.boundHandlers.elementHover, true);
            document.addEventListener('mouseout', this.handleElementMouseOut.bind(this), true);
            document.addEventListener('click', this.boundHandlers.elementClick, true);
            
            // Create selection overlay if needed
            if (!this.selectionOverlay) {
                this.selectionOverlay = document.createElement('div');
                this.selectionOverlay.className = 'element-selection-overlay';
                document.body.appendChild(this.selectionOverlay);
            }
            
            // Show element selection instructions
            this.showElementSelectionInstructions();
            
            // Notify WebSocket broker about element selection activation
            if (this.agent && this.agent.broker) {
                this.agent.broker.send({
                    type: 'element_selection_activated',
                    timestamp: Date.now(),
                    sessionId: this.agent.sessionId
                });
            }
            
        } else {
            console.log('🎯 Element selection mode deactivated');
            
            // Disable element selection
            this.mode = 'normal';
            document.body.style.cursor = '';
            
            // Remove event listeners
            document.removeEventListener('mouseover', this.boundHandlers.elementHover, true);
            document.removeEventListener('mouseout', this.handleElementMouseOut.bind(this), true);
            document.removeEventListener('click', this.boundHandlers.elementClick, true);
            
            // Hide overlay
            if (this.selectionOverlay) {
                this.selectionOverlay.style.display = 'none';
            }
            
            // Clear selected elements visual indicators
            this.clearSelectedElementsVisuals();
            
            // Hide instructions
            this.hideElementSelectionInstructions();
        }
    }
    
    /**
     * Toggle screenshot annotation mode
     */
    async toggleScreenshotAnnotation() {
        this.annotationMode = !this.annotationMode;
        
        if (this.annotationMode) {
            console.log('📸 Screenshot annotation mode activated');
            
            // Change mode
            this.mode = 'annotation';
            
            // Create annotation canvas container
            if (!this.annotationCanvas) {
                const canvasContainer = document.createElement('div');
                canvasContainer.className = 'annotation-canvas-container';
                
                this.annotationCanvas = document.createElement('canvas');
                this.annotationCanvas.className = 'annotation-canvas';
                this.annotationContext = this.annotationCanvas.getContext('2d');
                
                // Set canvas size to viewport
                this.annotationCanvas.width = window.innerWidth;
                this.annotationCanvas.height = window.innerHeight;
                
                canvasContainer.appendChild(this.annotationCanvas);
                document.body.appendChild(canvasContainer);
                
                // Create annotation toolbar
                this.createAnnotationToolbar();
                
                // Set up canvas drawing events
                this.setupAnnotationDrawing();
            }
            
            // Show annotation UI
            document.querySelector('.annotation-canvas-container').classList.add('active');
            document.querySelector('.annotation-toolbar').classList.add('active');
            
            // Take screenshot as background
            await this.captureScreenshotForAnnotation();
            
            // Notify WebSocket broker
            if (this.agent && this.agent.broker) {
                this.agent.broker.send({
                    type: 'screenshot_annotation_activated',
                    timestamp: Date.now(),
                    sessionId: this.agent.sessionId
                });
            }
            
        } else {
            console.log('📸 Screenshot annotation mode deactivated');
            
            // Restore normal mode
            this.mode = 'normal';
            
            // Hide annotation UI
            if (document.querySelector('.annotation-canvas-container')) {
                document.querySelector('.annotation-canvas-container').classList.remove('active');
            }
            if (document.querySelector('.annotation-toolbar')) {
                document.querySelector('.annotation-toolbar').classList.remove('active');
            }
            
            // Save annotation if there's content
            if (this.drawingHistory.length > 0) {
                await this.saveAnnotation();
            }
        }
    }
    
    /**
     * Toggle IDE integration panel
     */
    async toggleIDEIntegration() {
        const existingPanel = document.querySelector('.ide-integration-panel');
        
        if (!existingPanel || !existingPanel.classList.contains('active')) {
            console.log('💻 IDE integration panel opened');
            
            // Create IDE integration panel if needed
            if (!this.ideIntegrationUI) {
                await this.createIDEIntegrationPanel();
            }
            
            // Show panel
            this.ideIntegrationUI.classList.add('active');
            
            // Check IDE connection status
            await this.checkIDEConnections();
            
            // Notify WebSocket broker
            if (this.agent && this.agent.broker) {
                this.agent.broker.send({
                    type: 'ide_integration_opened',
                    timestamp: Date.now(),
                    sessionId: this.agent.sessionId
                });
            }
            
        } else {
            console.log('💻 IDE integration panel closed');
            
            // Hide panel
            existingPanel.classList.remove('active');
        }
    }
    
    /**
     * Toggle real-time collaboration panel
     */
    async toggleCollaborationPanel() {
        const existingPanel = document.querySelector('.collaboration-panel');
        
        if (!existingPanel || !existingPanel.classList.contains('active')) {
            console.log('👥 Collaboration panel opened');
            
            // Create collaboration panel if needed
            if (!this.collaborationPanel) {
                await this.createCollaborationPanel();
            }
            
            // Show panel
            this.collaborationPanel.classList.add('active');
            
            // Start real-time collaboration features
            await this.startCollaborationSession();
            
            // Notify WebSocket broker
            if (this.agent && this.agent.broker) {
                this.agent.broker.send({
                    type: 'collaboration_session_started',
                    timestamp: Date.now(),
                    sessionId: this.agent.sessionId
                });
            }
            
        } else {
            console.log('👥 Collaboration panel closed');
            
            // Hide panel
            existingPanel.classList.remove('active');
            
            // Stop collaboration session
            this.stopCollaborationSession();
        }
    }
    
    /**
     * Toggle AI analysis mode
     */
    async toggleAIAnalysis() {
        this.aiAnalysisActive = !this.aiAnalysisActive;
        
        if (this.aiAnalysisActive) {
            console.log('🤖 AI analysis mode activated');
            
            // Create AI analysis panel if needed
            if (!this.aiAnalysisUI) {
                await this.createAIAnalysisPanel();
            }
            
            // Show panel
            this.aiAnalysisUI.classList.add('active');
            
            // Start AI analysis monitoring
            this.startAIAnalysisMonitoring();
            
            // Queue initial analysis tasks
            this.queueInitialAnalysisTasks();
            
            // Notify WebSocket broker
            if (this.agent && this.agent.broker) {
                this.agent.broker.send({
                    type: 'ai_analysis_activated',
                    timestamp: Date.now(),
                    sessionId: this.agent.sessionId,
                    analysisTypes: ['ui-accessibility', 'performance-metrics', 'collaboration-readiness']
                });
            }
            
        } else {
            console.log('🤖 AI analysis mode deactivated');
            
            // Hide panel
            if (this.aiAnalysisUI) {
                this.aiAnalysisUI.classList.remove('active');
            }
            
            // Stop analysis monitoring
            this.stopAIAnalysisMonitoring();
            
            // Clear analysis queue
            this.analysisQueue = [];
        }
    }

    // ===== HELPER METHODS =====

    setupWebSocketHandlers() {
        if (!this.ws) return;

        this.ws.on('element_selected_remote', (data) => {
            this.handleRemoteElementSelection(data);
        });

        this.ws.on('cursor_position', (data) => {
            this.updateRemoteCursor(data);
        });

        this.ws.on('collaboration_message', (data) => {
            this.handleCollaborationMessage(data);
        });

        this.ws.on('screenshot_annotation', (data) => {
            this.handleRemoteAnnotation(data);
        });

        this.ws.on('analysis_progress', (data) => {
            this.updateAnalysisProgress(data);
        });
    }

    initializeEventListeners() {
        // Global event listeners for collaboration features
        this.throttledMouseMove = this.throttle(this.boundHandlers.mouseMove, 16); // 60fps
        this.throttledResize = this.throttle(this.boundHandlers.resize, 250);

        document.addEventListener('mousemove', this.throttledMouseMove, { passive: true });
        window.addEventListener('resize', this.throttledResize, { passive: true });
        document.addEventListener('keydown', this.boundHandlers.keydown);
    }

    handleElementHover(event) {
        if (this.mode !== 'element-selection') return;
        if (this.isElementSelectionActive) {
            event.preventDefault();
            event.stopPropagation();

            const element = event.target;
            if (element === this.lastHoveredElement) return;

            // Remove previous highlight
            this.clearElementHighlight();

            // Add highlight to current element
            this.highlightElement(element);
            this.lastHoveredElement = element;

            // Show element info tooltip
            this.showElementTooltip(element, event);

            // Update selection overlay
            this.updateSelectionOverlay(element);
        }
    }

    handleElementClick(event) {
        if (this.mode !== 'element-selection' || !this.isElementSelectionActive) return;
        
        event.preventDefault();
        event.stopPropagation();

        const element = event.target;
        this.selectElement(element);
        
        // Broadcast selection to collaborators
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.emit('element_selected', {
                elementPath: this.getElementPath(element),
                elementInfo: this.getElementInfo(element),
                coordinates: this.getElementCoordinates(element),
                timestamp: Date.now(),
                userId: this.userId
            });
        }
    }

    handleElementMouseOut(event) {
        if (this.mode !== 'element-selection') return;
        if (this.isElementSelectionActive) {
            this.clearElementHighlight();
            this.hideElementTooltip();
        }
    }

    handleKeydown(event) {
        // ESC key to exit selection mode
        if (event.key === 'Escape') {
            if (this.mode === 'element-selection' && this.isElementSelectionActive) {
                this.toggleElementSelection();
            } else if (this.mode === 'annotation' && this.isAnnotationMode) {
                this.toggleScreenshotAnnotation();
            }
        }

        // Ctrl+Z for undo in annotation mode
        if (event.ctrlKey && event.key === 'z' && this.mode === 'annotation') {
            event.preventDefault();
            this.undoAnnotation();
        }

        // Space to take screenshot in annotation mode
        if (event.code === 'Space' && this.mode === 'annotation') {
            event.preventDefault();
            this.takeScreenshot();
        }
    }

    handleMouseMove(event) {
        // Track cursor for collaboration
        if (this.isCollaborationActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.emit('cursor_position', {
                x: event.clientX,
                y: event.clientY,
                userId: this.userId,
                timestamp: Date.now()
            });
        }

        // Update annotation drawing if active
        if (this.mode === 'annotation' && this.isDrawing) {
            this.updateAnnotationDrawing(event);
        }
    }

    handleResize(event) {
        // Update overlay positions and sizes
        if (this.selectionOverlay) {
            this.updateSelectionOverlay(this.lastSelectedElement);
        }

        // Resize annotation canvas if active
        if (this.annotationCanvas) {
            this.resizeAnnotationCanvas();
        }

        // Update collaboration UI positions
        if (this.isCollaborationActive) {
            this.updateCollaborationUIPositions();
        }
    }

    // Visual feedback methods
    updateSelectionOverlay(element) {
        if (!element || !this.selectionOverlay) return;

        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        this.selectionOverlay.style.left = `${rect.left + scrollX}px`;
        this.selectionOverlay.style.top = `${rect.top + scrollY}px`;
        this.selectionOverlay.style.width = `${rect.width}px`;
        this.selectionOverlay.style.height = `${rect.height}px`;
        this.selectionOverlay.style.display = 'block';
    }

    showElementTooltip(element, event) {
        if (!this.elementTooltip) {
            this.createElementTooltip();
        }

        const info = this.getElementInfo(element);
        this.elementTooltip.innerHTML = `
            <div class="tooltip-tag">${info.tagName}</div>
            <div class="tooltip-details">
                ${info.className ? `<div class="tooltip-class">.${info.className}</div>` : ''}
                ${info.id ? `<div class="tooltip-id">#${info.id}</div>` : ''}
                <div class="tooltip-size">${info.width} × ${info.height}</div>
            </div>
        `;

        this.elementTooltip.style.left = `${event.clientX + 10}px`;
        this.elementTooltip.style.top = `${event.clientY - 10}px`;
        this.elementTooltip.style.display = 'block';
    }

    hideElementTooltip() {
        if (this.elementTooltip) {
            this.elementTooltip.style.display = 'none';
        }
    }

    createElementTooltip() {
        this.elementTooltip = document.createElement('div');
        this.elementTooltip.className = 'element-tooltip';
        this.elementTooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10001;
            pointer-events: none;
            font-family: 'Segoe UI', system-ui, sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: none;
        `;
        document.body.appendChild(this.elementTooltip);
    }

    // Utility methods
    getElementPath(element) {
        const path = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break;
            } else {
                let sibling = current;
                let nth = 1;
                
                while (sibling.previousElementSibling) {
                    sibling = sibling.previousElementSibling;
                    if (sibling.tagName === current.tagName) nth++;
                }
                
                if (nth > 1 || current.nextElementSibling) {
                    selector += `:nth-of-type(${nth})`;
                }
            }
            
            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    getElementInfo(element) {
        const rect = element.getBoundingClientRect();
        return {
            tagName: element.tagName,
            className: element.className || '',
            id: element.id || '',
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            text: element.textContent?.trim().substring(0, 50) || '',
            attributes: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            }))
        };
    }

    getElementCoordinates(element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        return {
            x: rect.left + scrollX,
            y: rect.top + scrollY,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + scrollX + rect.width / 2,
            centerY: rect.top + scrollY + rect.height / 2
        };
    }

    selectElement(element) {
        this.clearElementHighlight();
        this.hideElementTooltip();
        
        this.selectedElements.push({
            element: element,
            path: this.getElementPath(element),
            info: this.getElementInfo(element),
            timestamp: Date.now()
        });

        // Add permanent selection highlight
        element.classList.add('collaboration-selected');
        this.lastSelectedElement = element;
    }

    highlightElement(element) {
        element.classList.add('collaboration-highlight');
    }

    clearElementHighlight() {
        if (this.lastHoveredElement) {
            this.lastHoveredElement.classList.remove('collaboration-highlight');
            this.lastHoveredElement = null;
        }

        // Clear any existing highlights
        document.querySelectorAll('.collaboration-highlight').forEach(el => {
            el.classList.remove('collaboration-highlight');
        });
    }

    // Collaboration methods
    handleRemoteElementSelection(data) {
        if (data.userId === this.userId) return;

        // Find element by path
        const element = this.findElementByPath(data.elementPath);
        if (element) {
            // Show remote user's selection
            this.showRemoteSelection(element, data.userId);
        }
    }

    findElementByPath(path) {
        try {
            return document.querySelector(path);
        } catch (e) {
            console.warn('Could not find element by path:', path);
            return null;
        }
    }

    showRemoteSelection(element, userId) {
        const highlight = document.createElement('div');
        highlight.className = `remote-selection remote-user-${userId}`;
        highlight.style.cssText = `
            position: absolute;
            border: 2px solid var(--accent-color, #007acc);
            background: rgba(0, 122, 204, 0.1);
            pointer-events: none;
            z-index: 9999;
            border-radius: 4px;
        `;

        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        highlight.style.left = `${rect.left + scrollX}px`;
        highlight.style.top = `${rect.top + scrollY}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;

        document.body.appendChild(highlight);

        // Remove after 3 seconds
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        }, 3000);
    }

    updateRemoteCursor(data) {
        if (data.userId === this.userId) return;

        let cursor = this.remoteCursors.get(data.userId);
        if (!cursor) {
            cursor = this.createRemoteCursor(data.userId);
            this.remoteCursors.set(data.userId, cursor);
        }

        cursor.style.left = `${data.x}px`;
        cursor.style.top = `${data.y}px`;
        cursor.style.display = 'block';

        // Hide cursor after inactivity
        clearTimeout(cursor.hideTimeout);
        cursor.hideTimeout = setTimeout(() => {
            cursor.style.display = 'none';
        }, 2000);
    }

    createRemoteCursor(userId) {
        const cursor = document.createElement('div');
        cursor.className = `remote-cursor remote-user-${userId}`;
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: var(--accent-color, #007acc);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transition: all 0.1s ease;
            display: none;
        `;
        cursor.innerHTML = `
            <div style="
                position: absolute;
                top: 22px;
                left: 0;
                background: var(--accent-color, #007acc);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                white-space: nowrap;
                font-family: system-ui, sans-serif;
            ">User ${userId.substring(0, 6)}</div>
        `;
        document.body.appendChild(cursor);
        return cursor;
    }

    handleCollaborationMessage(data) {
        // Handle various collaboration messages
        switch (data.type) {
            case 'user_joined':
                this.handleUserJoined(data);
                break;
            case 'user_left':
                this.handleUserLeft(data);
                break;
            case 'mode_changed':
                this.handleRemoteModeChange(data);
                break;
        }
    }

    handleRemoteAnnotation(data) {
        if (data.userId === this.userId) return;
        
        // Display remote user's annotation
        this.displayRemoteAnnotation(data);
    }

    updateAnalysisProgress(data) {
        if (this.aiAnalysisUI && this.isAIAnalysisActive) {
            const progressElement = this.aiAnalysisUI.querySelector('.analysis-progress');
            if (progressElement) {
                progressElement.textContent = `Analysis Progress: ${data.progress}%`;
            }
        }
    }

    // Utility function for throttling
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
}

// Export the CollaborationSystem class
window.CollaborationSystem = CollaborationSystem;