/**
 * Enhanced Element Inspector with AI Analysis - Intelligent element inspection and optimization
 * 
 * This module provides:
 * - Visual element selection with highlighting
 * - Comprehensive element information extraction
 * - AI-powered element analysis and recommendations
 * - Accessibility auditing with intelligent suggestions
 * - CSS optimization and cleanup recommendations
 * - Semantic HTML improvement suggestions
 * - Performance impact analysis
 * - Design pattern recognition
 * - Screenshot capture with visual context
 * - Real-time AI chat integration
 */

// AI Analysis Engine Configuration
const AI_CONFIG = {
    // Claude API integration settings
    apiEndpoint: '/api/claude-analysis',
    maxContextLength: 8000,
    analysisTimeout: 30000,
    
    // Analysis categories
    categories: {
        accessibility: { enabled: true, priority: 'high' },
        performance: { enabled: true, priority: 'high' },
        semantics: { enabled: true, priority: 'medium' },
        css: { enabled: true, priority: 'medium' },
        design: { enabled: true, priority: 'low' },
        seo: { enabled: true, priority: 'medium' }
    },
    
    // Performance thresholds
    performance: {
        maxDOMDepth: 15,
        maxElementSize: 1000000, // 1MB
        maxStyleSheets: 10,
        maxInlineStyles: 100
    }
};

class ElementInspector extends EventTarget {
    constructor() {
        super(); // Call EventTarget constructor
        this.isActive = false;
        this.selectedElement = null;
        this.overlay = null;
        this.highlightBox = null;
        this.infoPanel = null;
        this.chatPanel = null;
        this.aiInsightsPanel = null;
        this.screenshotCanvas = null;
        this.websocket = null;
        
        // AI Analysis state
        this.aiAnalysisCache = new Map();
        this.currentAnalysis = null;
        this.analysisInProgress = false;
        this.performanceObserver = null;
        
        // Element analysis data storage
        this.elementData = {
            domTree: null,
            styleSheets: [],
            computedStyles: null,
            accessibilityTree: null,
            performanceMetrics: {}
        };
        
        this.boundHandlers = {
            mouseover: this.onMouseOver.bind(this),
            click: this.onElementClick.bind(this),
            keydown: this.onKeyDown.bind(this),
            scroll: this.onScroll.bind(this)
        };
        
        this.init();
    }

    /**
     * Initialize the enhanced element inspector
     */
    init() {
        this.createOverlay();
        this.createHighlightBox();
        this.createInfoPanel();
        this.createAIInsightsPanel();
        this.createChatPanel();
        this.createControlButtons();
        this.initializePerformanceObserver();
        this.preloadStyleSheets();
        this.connectWebSocket();
    }

    /**
     * Create the main overlay container
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'element-inspector-overlay';
        this.overlay.innerHTML = `
            <style>
                #element-inspector-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                #element-inspector-overlay.active {
                    pointer-events: auto;
                }

                .highlight-box {
                    position: absolute;
                    border: 2px solid #6B46C1;
                    background: rgba(107, 70, 193, 0.1);
                    backdrop-filter: blur(2px);
                    pointer-events: none;
                    transition: all 0.2s ease;
                    border-radius: 4px;
                    box-shadow: 
                        0 0 0 1px rgba(255, 255, 255, 0.5),
                        0 4px 12px rgba(107, 70, 193, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                .highlight-box.selected {
                    border-color: #2563EB;
                    background: rgba(37, 99, 235, 0.15);
                    box-shadow: 
                        0 0 0 1px rgba(255, 255, 255, 0.8),
                        0 6px 20px rgba(37, 99, 235, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3);
                }

                .element-label {
                    position: absolute;
                    top: -28px;
                    left: 0;
                    background: #6B46C1;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .info-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 320px;
                    max-height: 300px;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    color: white;
                    font-size: 13px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    overflow-y: auto;
                }

                .ai-insights-panel {
                    position: fixed;
                    top: 340px;
                    right: 20px;
                    width: 360px;
                    max-height: 500px;
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 12px;
                    padding: 0;
                    color: white;
                    font-size: 13px;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(59, 130, 246, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    overflow: hidden;
                }

                .ai-insights-panel.visible {
                    transform: translateX(0);
                }

                .ai-insights-header {
                    background: linear-gradient(90deg, #3B82F6 0%, #6366F1 100%);
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .ai-insights-header h3 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .ai-insights-content {
                    padding: 16px;
                    max-height: 450px;
                    overflow-y: auto;
                }

                .analysis-section {
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 16px;
                }

                .analysis-section:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }

                .analysis-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 13px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .analysis-section.accessibility h4 {
                    color: #10B981;
                }

                .analysis-section.performance h4 {
                    color: #F59E0B;
                }

                .analysis-section.css h4 {
                    color: #8B5CF6;
                }

                .analysis-section.semantics h4 {
                    color: #EF4444;
                }

                .analysis-section.design h4 {
                    color: #06B6D4;
                }

                .recommendation {
                    background: rgba(59, 130, 246, 0.1);
                    border-left: 3px solid #3B82F6;
                    padding: 12px;
                    border-radius: 0 6px 6px 0;
                    margin-bottom: 8px;
                    font-size: 12px;
                    line-height: 1.4;
                }

                .recommendation.warning {
                    background: rgba(245, 158, 11, 0.1);
                    border-left-color: #F59E0B;
                    color: #FEF3C7;
                }

                .recommendation.error {
                    background: rgba(239, 68, 68, 0.1);
                    border-left-color: #EF4444;
                    color: #FEE2E2;
                }

                .recommendation.success {
                    background: rgba(16, 185, 129, 0.1);
                    border-left-color: #10B981;
                    color: #D1FAE5;
                }

                .analysis-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: #94A3B8;
                }

                .analysis-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid rgba(59, 130, 246, 0.3);
                    border-top-color: #3B82F6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 12px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .severity-badge {
                    display: inline-block;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-left: 8px;
                }

                .severity-high {
                    background: rgba(239, 68, 68, 0.2);
                    color: #EF4444;
                }

                .severity-medium {
                    background: rgba(245, 158, 11, 0.2);
                    color: #F59E0B;
                }

                .severity-low {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22C55E;
                }

                .info-panel.visible {
                    transform: translateX(0);
                }

                .info-section {
                    margin-bottom: 16px;
                }

                .info-section h4 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #6B46C1;
                    border-bottom: 1px solid rgba(107, 70, 193, 0.3);
                    padding-bottom: 4px;
                }

                .info-item {
                    display: flex;
                    margin-bottom: 4px;
                }

                .info-label {
                    min-width: 80px;
                    color: #94A3B8;
                    font-weight: 500;
                }

                .info-value {
                    color: #E2E8F0;
                    word-break: break-all;
                    flex: 1;
                }

                .chat-panel {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 350px;
                    height: 300px;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .chat-panel.visible {
                    transform: translateY(0);
                }

                .chat-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .chat-header h3 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #E2E8F0;
                }

                .chat-messages {
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
                    font-size: 13px;
                }

                .chat-message {
                    margin-bottom: 12px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    max-width: 80%;
                }

                .chat-message.user {
                    background: #6B46C1;
                    color: white;
                    margin-left: auto;
                }

                .chat-message.system {
                    background: rgba(255, 255, 255, 0.1);
                    color: #E2E8F0;
                }

                .chat-input {
                    display: flex;
                    padding: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    gap: 8px;
                }

                .chat-input input {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: white;
                    font-size: 13px;
                }

                .chat-input input::placeholder {
                    color: #94A3B8;
                }

                .chat-input button {
                    background: #6B46C1;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: white;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                .chat-input button:hover {
                    background: #553C9A;
                }

                .control-buttons {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    display: flex;
                    gap: 8px;
                    z-index: 1000000;
                }

                .control-button {
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 10px 12px;
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .control-button:hover {
                    background: rgba(107, 70, 193, 0.8);
                    transform: translateY(-1px);
                }

                .control-button.active {
                    background: #6B46C1;
                    box-shadow: 0 4px 12px rgba(107, 70, 193, 0.4);
                }

                .control-button.ai-active {
                    background: linear-gradient(90deg, #3B82F6 0%, #6366F1 100%);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }

                .screenshot-preview {
                    max-width: 100%;
                    border-radius: 6px;
                    margin: 8px 0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(107, 70, 193, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(107, 70, 193, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(107, 70, 193, 0); }
                }

                .highlight-box.pulse {
                    animation: pulse 2s infinite;
                }
            </style>
        `;
        document.body.appendChild(this.overlay);
    }

    /**
     * Create the element highlight box
     */
    createHighlightBox() {
        this.highlightBox = document.createElement('div');
        this.highlightBox.className = 'highlight-box';
        this.overlay.appendChild(this.highlightBox);
    }

    /**
     * Create the element information panel
     */
    createInfoPanel() {
        this.infoPanel = document.createElement('div');
        this.infoPanel.className = 'info-panel';
        this.infoPanel.innerHTML = `
            <div class="info-content">
                <div class="info-section">
                    <h4>Element Information</h4>
                    <div id="element-basic-info"></div>
                </div>
                <div class="info-section">
                    <h4>Styles</h4>
                    <div id="element-styles"></div>
                </div>
                <div class="info-section">
                    <h4>Attributes</h4>
                    <div id="element-attributes"></div>
                </div>
                <div class="info-section">
                    <h4>Accessibility</h4>
                    <div id="element-accessibility"></div>
                </div>
            </div>
        `;
        this.overlay.appendChild(this.infoPanel);
    }

    /**
     * Create the AI insights panel for intelligent analysis
     */
    createAIInsightsPanel() {
        this.aiInsightsPanel = document.createElement('div');
        this.aiInsightsPanel.className = 'ai-insights-panel';
        this.aiInsightsPanel.innerHTML = `
            <div class="ai-insights-header">
                <h3>
                    <span style="font-size: 16px;">🤖</span>
                    AI Element Analysis
                </h3>
                <button onclick="elementInspector.toggleAIInsights()" style="background: none; border: none; color: white; cursor: pointer; opacity: 0.7; font-size: 16px;">✕</button>
            </div>
            <div class="ai-insights-content" id="ai-insights-content">
                <div class="analysis-loading">
                    <div class="analysis-spinner"></div>
                    Select an element to start AI analysis
                </div>
            </div>
        `;
        this.overlay.appendChild(this.aiInsightsPanel);
    }

    /**
     * Create the chat panel for AI interaction
     */
    createChatPanel() {
        this.chatPanel = document.createElement('div');
        this.chatPanel.className = 'chat-panel';
        this.chatPanel.innerHTML = `
            <div class="chat-header">
                <h3>🤖 AI Assistant</h3>
                <button onclick="elementInspector.toggleChat()" style="background: none; border: none; color: #94A3B8; cursor: pointer;">✕</button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input">
                <input type="text" id="chat-input" placeholder="Ask about this element or request actions...">
                <button onclick="elementInspector.sendChatMessage()">Send</button>
            </div>
        `;
        this.overlay.appendChild(this.chatPanel);

        // Handle Enter key in chat input
        const chatInput = this.chatPanel.querySelector('#chat-input');
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    /**
     * Create control buttons
     */
    createControlButtons() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'control-buttons';
        controlsContainer.innerHTML = `
            <button class="control-button" id="toggle-inspector" onclick="elementInspector.toggle()">
                🔍 Inspector
            </button>
            <button class="control-button" onclick="elementInspector.captureFullScreenshot()">
                📸 Screenshot
            </button>
            <button class="control-button" onclick="elementInspector.toggleInfo()">
                ℹ️ Info
            </button>
            <button class="control-button" onclick="elementInspector.toggleChat()">
                💬 AI Chat
            </button>
            <button class="control-button" onclick="elementInspector.toggleAIInsights()">
                🧠 AI Insights
            </button>
            <button class="control-button" onclick="elementInspector.showHelp()">
                ❓ Help
            </button>
        `;
        this.overlay.appendChild(controlsContainer);
    }

    /**
     * Connect to WebSocket for real-time communication
     */
    connectWebSocket() {
        try {
            // Use environment variable or configuration for WebSocket URL
            const wsToken = window.WEBSOCKET_TOKEN || 'secure-token';
            const wsPort = window.BROKER_PORT || 7071;
            this.websocket = new WebSocket(`ws://localhost:${wsPort}?token=${wsToken}`);
            
            this.websocket.onopen = () => {
                console.log('Element Inspector connected to WebSocket');
                this.websocket.send(JSON.stringify({
                    role: 'element-inspector',
                    action: 'register'
                }));
            };

            this.websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.websocket.onclose = () => {
                console.log('WebSocket connection closed, attempting reconnect...');
                setTimeout(() => this.connectWebSocket(), 5000);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'ai_response':
                this.addChatMessage(message.content, 'system');
                break;
            case 'screenshot_captured':
                this.addChatMessage(`Screenshot captured: ${message.filepath}`, 'system');
                if (message.filepath && message.analysis) {
                    // If screenshot includes visual analysis
                    this.integrateVisualAnalysis(message.analysis);
                }
                break;
            case 'element_analysis':
                // Legacy support for basic element analysis
                this.displayElementAnalysis(message.data);
                break;
            case 'ai_analysis_complete':
                // New comprehensive AI analysis complete
                if (message.requestId && message.analysis) {
                    this.currentAnalysis = message.analysis;
                    this.displayAIAnalysis(message.analysis);
                }
                break;
            case 'ai_analysis_error':
                // AI analysis failed
                if (message.requestId && message.error) {
                    this.showAIAnalysisError(message.error);
                    this.addChatMessage(`Analysis failed: ${message.error}`, 'system');
                }
                break;
            case 'visual_context_analysis':
                // Screenshot-based visual analysis
                this.integrateVisualAnalysis(message.data);
                break;
            case 'accessibility_audit_complete':
                // Dedicated accessibility audit results
                this.updateAccessibilitySection(message.data);
                break;
            case 'performance_audit_complete':
                // Performance analysis results
                this.updatePerformanceSection(message.data);
                break;
            case 'css_optimization_complete':
                // CSS optimization suggestions
                this.updateCSSOptimizations(message.data);
                break;
        }
    }

    /**
     * Integrate visual analysis from screenshots
     */
    integrateVisualAnalysis(visualData) {
        if (!this.currentAnalysis) {
            this.currentAnalysis = {};
        }
        
        // Add visual insights to current analysis
        this.currentAnalysis.visual = {
            score: visualData.score || 75,
            insights: visualData.insights || [],
            colorAnalysis: visualData.colors || {},
            layoutAnalysis: visualData.layout || {},
            suggestions: visualData.suggestions || []
        };
        
        // Update display with visual insights
        this.displayVisualInsights(visualData);
        
        this.addChatMessage('Visual analysis complete! Check AI Insights for design recommendations.', 'system');
    }

    /**
     * Display visual insights from screenshot analysis
     */
    displayVisualInsights(visualData) {
        const content = document.getElementById('ai-insights-content');
        const existingContent = content.innerHTML;
        
        let visualSection = `
            <div class="analysis-section design">
                <h4>
                    <span>👁️</span> Visual Analysis
                    <span class="severity-badge ${this.getSeverityClass(visualData.score || 75)}">
                        ${visualData.score || 75}/100
                    </span>
                </h4>
        `;
        
        if (visualData.insights && visualData.insights.length > 0) {
            visualData.insights.forEach(insight => {
                visualSection += `
                    <div class="recommendation">
                        <strong>Visual Insight:</strong> ${this.sanitizeText(insight)}
                    </div>
                `;
            });
        }
        
        if (visualData.colors) {
            visualSection += `
                <div class="recommendation">
                    <strong>Color Analysis:</strong> ${this.sanitizeText(visualData.colors.description || 'Colors analyzed')}
                    ${visualData.colors.palette ? `<br><small>Palette: ${visualData.colors.palette.join(', ')}</small>` : ''}
                </div>
            `;
        }
        
        if (visualData.layout) {
            visualSection += `
                <div class="recommendation">
                    <strong>Layout Analysis:</strong> ${this.sanitizeText(visualData.layout.description || 'Layout structure analyzed')}
                </div>
            `;
        }
        
        visualSection += '</div>';
        
        // Insert visual section at the top of existing content
        content.innerHTML = visualSection + existingContent;
    }

    /**
     * Update accessibility section with new data
     */
    updateAccessibilitySection(accessibilityData) {
        if (!this.currentAnalysis) {
            this.currentAnalysis = {};
        }
        this.currentAnalysis.accessibility = accessibilityData;
        this.displayAIAnalysis(this.currentAnalysis);
    }

    /**
     * Update performance section with new data
     */
    updatePerformanceSection(performanceData) {
        if (!this.currentAnalysis) {
            this.currentAnalysis = {};
        }
        this.currentAnalysis.performance = performanceData;
        this.displayAIAnalysis(this.currentAnalysis);
    }

    /**
     * Update CSS optimizations section
     */
    updateCSSOptimizations(cssData) {
        if (!this.currentAnalysis) {
            this.currentAnalysis = {};
        }
        this.currentAnalysis.css = cssData;
        this.displayAIAnalysis(this.currentAnalysis);
    }

    /**
     * Toggle element inspector mode
     */
    toggle() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.activate();
        } else {
            this.deactivate();
        }
    }

    /**
     * Activate element inspector
     */
    activate() {
        this.isActive = true;
        this.overlay.classList.add('active');
        document.getElementById('toggle-inspector').classList.add('active');
        
        // Add event listeners
        document.addEventListener('mouseover', this.boundHandlers.mouseover, true);
        document.addEventListener('click', this.boundHandlers.click, true);
        document.addEventListener('keydown', this.boundHandlers.keydown, true);
        document.addEventListener('scroll', this.boundHandlers.scroll, true);
        
        // Prevent scrolling and other interactions
        document.body.style.overflow = 'hidden';
        
        this.addChatMessage('Element inspector activated. Hover over elements to inspect them.', 'system');
    }

    /**
     * Deactivate element inspector
     */
    deactivate() {
        this.isActive = false;
        this.overlay.classList.remove('active');
        document.getElementById('toggle-inspector').classList.remove('active');
        
        // Remove event listeners
        document.removeEventListener('mouseover', this.boundHandlers.mouseover, true);
        document.removeEventListener('click', this.boundHandlers.click, true);
        document.removeEventListener('keydown', this.boundHandlers.keydown, true);
        document.removeEventListener('scroll', this.boundHandlers.scroll, true);
        
        // Restore scrolling
        document.body.style.overflow = '';
        
        // Hide highlight
        this.highlightBox.style.display = 'none';
        
        this.addChatMessage('Element inspector deactivated.', 'system');
    }

    /**
     * Handle mouse over events
     */
    onMouseOver(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const element = event.target;
        if (element === this.overlay || this.overlay.contains(element)) return;
        
        this.highlightElement(element);
    }

    /**
     * Handle element click events
     */
    onElementClick(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const element = event.target;
        if (element === this.overlay || this.overlay.contains(element)) return;
        
        this.selectElement(element);
    }

    /**
     * Handle keyboard events
     */
    onKeyDown(event) {
        if (!this.isActive) return;
        
        if (event.key === 'Escape') {
            this.deactivate();
        } else if (event.key === 'Enter' && this.selectedElement) {
            this.captureElementScreenshot();
        } else if (event.key === 'c' && event.ctrlKey && this.selectedElement) {
            this.copyElementInfo();
        }
    }

    /**
     * Handle scroll events
     */
    onScroll(event) {
        if (!this.isActive) return;
        
        // Update highlight position on scroll
        if (this.selectedElement) {
            this.highlightElement(this.selectedElement);
        }
    }

    /**
     * Highlight an element
     */
    highlightElement(element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        this.highlightBox.style.display = 'block';
        this.highlightBox.style.left = (rect.left + scrollX) + 'px';
        this.highlightBox.style.top = (rect.top + scrollY) + 'px';
        this.highlightBox.style.width = rect.width + 'px';
        this.highlightBox.style.height = rect.height + 'px';
        
        // Add element label
        const label = this.highlightBox.querySelector('.element-label') || document.createElement('div');
        label.className = 'element-label';
        label.textContent = this.getElementSelector(element);
        
        if (!this.highlightBox.contains(label)) {
            this.highlightBox.appendChild(label);
        }
    }

    /**
     * Select an element with enhanced AI analysis
     */
    selectElement(element) {
        this.selectedElement = element;
        this.highlightElement(element);
        this.highlightBox.classList.add('selected', 'pulse');
        
        // Update info panel
        this.updateInfoPanel(element);
        this.showInfo();
        
        // Show AI insights panel
        this.showAIInsights();
        
        // Perform comprehensive AI analysis
        this.analyzeElementWithAI(element);
        
        this.addChatMessage(`Selected: ${this.getElementSelector(element)}`, 'user');
        this.addChatMessage('Element selected! AI analysis is running...', 'system');
        
        // Dispatch event for integrations
        this.dispatchEvent(new CustomEvent('elementSelected', {
            detail: { element: element }
        }));
    }

    /**
     * Update the information panel with element details
     */
    updateInfoPanel(element) {
        // Basic info
        const basicInfo = document.getElementById('element-basic-info');
        basicInfo.innerHTML = `
            <div class="info-item">
                <span class="info-label">Tag:</span>
                <span class="info-value">${element.tagName.toLowerCase()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">ID:</span>
                <span class="info-value">${element.id || 'none'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Classes:</span>
                <span class="info-value">${element.className || 'none'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Text:</span>
                <span class="info-value">${element.textContent?.substring(0, 100) || 'none'}${element.textContent?.length > 100 ? '...' : ''}</span>
            </div>
        `;

        // Computed styles
        const computedStyles = window.getComputedStyle(element);
        const styles = document.getElementById('element-styles');
        styles.innerHTML = `
            <div class="info-item">
                <span class="info-label">Display:</span>
                <span class="info-value">${computedStyles.display}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Position:</span>
                <span class="info-value">${computedStyles.position}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Size:</span>
                <span class="info-value">${element.offsetWidth} × ${element.offsetHeight}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Color:</span>
                <span class="info-value">${computedStyles.color}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Background:</span>
                <span class="info-value">${computedStyles.backgroundColor}</span>
            </div>
        `;

        // Attributes
        const attributes = document.getElementById('element-attributes');
        let attributesHtml = '';
        for (const attr of element.attributes) {
            attributesHtml += `
                <div class="info-item">
                    <span class="info-label">${attr.name}:</span>
                    <span class="info-value">${attr.value}</span>
                </div>
            `;
        }
        attributes.innerHTML = attributesHtml || '<div class="info-item">No attributes</div>';

        // Accessibility
        const accessibility = document.getElementById('element-accessibility');
        accessibility.innerHTML = `
            <div class="info-item">
                <span class="info-label">Role:</span>
                <span class="info-value">${element.getAttribute('role') || 'none'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">ARIA Label:</span>
                <span class="info-value">${element.getAttribute('aria-label') || 'none'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Focusable:</span>
                <span class="info-value">${element.tabIndex >= 0 ? 'yes' : 'no'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Alt Text:</span>
                <span class="info-value">${element.getAttribute('alt') || 'none'}</span>
            </div>
        `;
    }

    /**
     * Initialize performance observer for monitoring
     */
    initializePerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'element' || entry.entryType === 'measure') {
                            this.elementData.performanceMetrics[entry.name] = {
                                duration: entry.duration,
                                startTime: entry.startTime,
                                timestamp: Date.now()
                            };
                        }
                    });
                });
                this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (error) {
                console.warn('Performance Observer not available:', error);
            }
        }
    }

    /**
     * Preload stylesheets for analysis
     */
    preloadStyleSheets() {
        this.elementData.styleSheets = Array.from(document.styleSheets).map((sheet, index) => {
            try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                return {
                    index,
                    href: sheet.href,
                    title: sheet.title,
                    media: sheet.media.mediaText,
                    rulesCount: rules.length,
                    rules: rules.slice(0, 50).map(rule => ({ // Limit for performance
                        cssText: rule.cssText,
                        selectorText: rule.selectorText,
                        type: rule.type
                    }))
                };
            } catch (error) {
                return {
                    index,
                    href: sheet.href,
                    error: 'Access denied (CORS)',
                    media: sheet.media.mediaText
                };
            }
        });
    }

    /**
     * Extract comprehensive element data for AI analysis
     */
    extractElementData(element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        // Basic element information
        const basicData = {
            tag: element.tagName.toLowerCase(),
            id: element.id,
            className: element.className,
            text: element.textContent?.substring(0, 1000),
            innerHTML: element.innerHTML?.substring(0, 2000),
            selector: this.getElementSelector(element),
            xpath: this.getElementXPath(element)
        };

        // Comprehensive attributes
        const attributes = {};
        Array.from(element.attributes).forEach(attr => {
            attributes[attr.name] = attr.value;
        });

        // Enhanced computed styles
        const criticalStyles = {
            // Layout properties
            display: computedStyle.display,
            position: computedStyle.position,
            float: computedStyle.float,
            clear: computedStyle.clear,
            overflow: computedStyle.overflow,
            visibility: computedStyle.visibility,
            
            // Box model
            width: computedStyle.width,
            height: computedStyle.height,
            margin: computedStyle.margin,
            padding: computedStyle.padding,
            border: computedStyle.border,
            boxSizing: computedStyle.boxSizing,
            
            // Typography
            fontFamily: computedStyle.fontFamily,
            fontSize: computedStyle.fontSize,
            fontWeight: computedStyle.fontWeight,
            lineHeight: computedStyle.lineHeight,
            textAlign: computedStyle.textAlign,
            color: computedStyle.color,
            
            // Background and borders
            backgroundColor: computedStyle.backgroundColor,
            backgroundImage: computedStyle.backgroundImage,
            backgroundSize: computedStyle.backgroundSize,
            borderRadius: computedStyle.borderRadius,
            
            // Flexbox/Grid
            flexDirection: computedStyle.flexDirection,
            flexWrap: computedStyle.flexWrap,
            justifyContent: computedStyle.justifyContent,
            alignItems: computedStyle.alignItems,
            gridTemplateColumns: computedStyle.gridTemplateColumns,
            gridTemplateRows: computedStyle.gridTemplateRows,
            
            // Effects
            opacity: computedStyle.opacity,
            transform: computedStyle.transform,
            filter: computedStyle.filter,
            boxShadow: computedStyle.boxShadow,
            textShadow: computedStyle.textShadow
        };

        // Accessibility analysis
        const accessibility = this.analyzeAccessibility(element);
        
        // Performance analysis
        const performance = this.analyzePerformance(element, rect);
        
        // DOM context
        const domContext = this.analyzeDOMContext(element);
        
        // SEO analysis
        const seo = this.analyzeSEO(element);

        return {
            ...basicData,
            attributes,
            styles: criticalStyles,
            accessibility,
            performance,
            domContext,
            seo,
            dimensions: {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                visible: rect.width > 0 && rect.height > 0
            },
            timestamp: Date.now()
        };
    }

    /**
     * Analyze element accessibility
     */
    analyzeAccessibility(element) {
        const issues = [];
        const recommendations = [];
        
        // Check for missing alt text on images
        if (element.tagName.toLowerCase() === 'img') {
            if (!element.getAttribute('alt')) {
                issues.push({ type: 'missing-alt', severity: 'high', message: 'Image missing alt text' });
            } else if (element.getAttribute('alt').trim() === '') {
                issues.push({ type: 'empty-alt', severity: 'medium', message: 'Image has empty alt text' });
            }
        }
        
        // Check for insufficient color contrast
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
            const contrast = this.calculateColorContrast(color, backgroundColor);
            if (contrast < 4.5) {
                issues.push({ 
                    type: 'low-contrast', 
                    severity: 'high', 
                    message: `Low color contrast ratio: ${contrast.toFixed(2)}`,
                    current: contrast.toFixed(2),
                    required: '4.5:1'
                });
            }
        }
        
        // Check for missing form labels
        if (element.tagName.toLowerCase() === 'input' && element.type !== 'hidden') {
            const id = element.id;
            const hasLabel = id && document.querySelector(`label[for="${id}"]`);
            const hasAriaLabel = element.getAttribute('aria-label');
            const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
            
            if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
                issues.push({ type: 'missing-label', severity: 'high', message: 'Form input missing label' });
            }
        }
        
        // Check for heading hierarchy
        if (/^h[1-6]$/i.test(element.tagName)) {
            const level = parseInt(element.tagName.charAt(1));
            const prevHeading = this.findPreviousHeading(element);
            if (prevHeading && level - prevHeading > 1) {
                issues.push({ 
                    type: 'heading-hierarchy', 
                    severity: 'medium', 
                    message: `Heading level ${level} skips levels from previous h${prevHeading}` 
                });
            }
        }
        
        // Check for focusable elements without focus indicators
        if (element.tabIndex >= 0 || ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase())) {
            const focusStyle = this.checkFocusIndicator(element);
            if (!focusStyle) {
                issues.push({ type: 'no-focus-indicator', severity: 'medium', message: 'Focusable element lacks focus indicator' });
            }
        }
        
        return {
            score: Math.max(0, 100 - (issues.length * 20)),
            issues,
            recommendations,
            ariaAttributes: this.extractAriaAttributes(element),
            role: element.getAttribute('role'),
            focusable: element.tabIndex >= 0
        };
    }

    /**
     * Analyze element performance impact
     */
    analyzePerformance(element, rect) {
        const issues = [];
        const metrics = {};
        
        // Check element size
        const area = rect.width * rect.height;
        metrics.area = area;
        if (area > 500000) { // Large element > 500k pixels
            issues.push({ type: 'large-element', severity: 'medium', message: 'Element has large render area', value: area });
        }
        
        // Check for expensive CSS properties
        const computedStyle = window.getComputedStyle(element);
        const expensiveProps = {
            filter: computedStyle.filter,
            transform: computedStyle.transform,
            boxShadow: computedStyle.boxShadow,
            borderRadius: computedStyle.borderRadius
        };
        
        Object.entries(expensiveProps).forEach(([prop, value]) => {
            if (value && value !== 'none') {
                metrics[prop] = value;
                if ((prop === 'filter' && value.includes('blur')) ||
                    (prop === 'boxShadow' && value.split(',').length > 2)) {
                    issues.push({ type: 'expensive-css', severity: 'low', message: `Complex ${prop} may impact performance` });
                }
            }
        });
        
        // Check DOM depth
        const depth = this.getDOMDepth(element);
        metrics.domDepth = depth;
        if (depth > AI_CONFIG.performance.maxDOMDepth) {
            issues.push({ type: 'deep-nesting', severity: 'medium', message: `Deep DOM nesting: ${depth} levels` });
        }
        
        // Check for inline styles
        if (element.style.length > 0) {
            metrics.inlineStyleCount = element.style.length;
            if (element.style.length > AI_CONFIG.performance.maxInlineStyles) {
                issues.push({ type: 'excessive-inline-styles', severity: 'low', message: 'Many inline styles detected' });
            }
        }
        
        return {
            score: Math.max(0, 100 - (issues.length * 15)),
            issues,
            metrics,
            renderComplexity: this.calculateRenderComplexity(element, computedStyle)
        };
    }

    /**
     * Analyze DOM context and structure
     */
    analyzeDOMContext(element) {
        return {
            parent: element.parentElement ? {
                tag: element.parentElement.tagName.toLowerCase(),
                className: element.parentElement.className,
                id: element.parentElement.id
            } : null,
            children: Array.from(element.children).map(child => ({
                tag: child.tagName.toLowerCase(),
                className: child.className,
                id: child.id
            })),
            siblings: this.getSiblings(element),
            depth: this.getDOMDepth(element),
            position: Array.from(element.parentElement?.children || []).indexOf(element)
        };
    }

    /**
     * Analyze SEO-related aspects
     */
    analyzeSEO(element) {
        const issues = [];
        const recommendations = [];
        
        // Check heading structure
        if (/^h[1-6]$/i.test(element.tagName)) {
            if (!element.textContent.trim()) {
                issues.push({ type: 'empty-heading', severity: 'high', message: 'Heading element is empty' });
            } else if (element.textContent.length > 60) {
                issues.push({ type: 'long-heading', severity: 'low', message: 'Heading text is very long' });
            }
        }
        
        // Check link quality
        if (element.tagName.toLowerCase() === 'a') {
            if (!element.href) {
                issues.push({ type: 'missing-href', severity: 'medium', message: 'Link missing href attribute' });
            } else if (element.textContent.trim() === '') {
                issues.push({ type: 'empty-link', severity: 'high', message: 'Link has no text content' });
            } else if (['click here', 'read more', 'more'].includes(element.textContent.toLowerCase().trim())) {
                issues.push({ type: 'generic-link-text', severity: 'medium', message: 'Link text is not descriptive' });
            }
        }
        
        // Check meta information
        if (element.tagName.toLowerCase() === 'img') {
            const alt = element.getAttribute('alt');
            if (alt && alt.length > 125) {
                recommendations.push({ type: 'long-alt-text', message: 'Consider shorter alt text for better UX' });
            }
        }
        
        return {
            score: Math.max(0, 100 - (issues.length * 25)),
            issues,
            recommendations,
            structured: this.checkStructuredData(element)
        };
    }

    /**
     * Comprehensive AI element analysis
     */
    async analyzeElementWithAI(element) {
        if (this.analysisInProgress) {
            return;
        }
        
        this.analysisInProgress = true;
        this.showAIAnalysisLoading();
        
        try {
            // Extract comprehensive element data
            const elementData = this.extractElementData(element);
            
            // Check cache first
            const cacheKey = this.generateCacheKey(elementData);
            if (this.aiAnalysisCache.has(cacheKey)) {
                const cachedAnalysis = this.aiAnalysisCache.get(cacheKey);
                this.displayAIAnalysis(cachedAnalysis);
                this.analysisInProgress = false;
                return cachedAnalysis;
            }
            
            // Send to AI for analysis
            const analysisPromise = this.sendToAIForAnalysis(elementData);
            
            // Set timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Analysis timeout')), AI_CONFIG.analysisTimeout);
            });
            
            const analysis = await Promise.race([analysisPromise, timeoutPromise]);
            
            // Cache the result
            this.aiAnalysisCache.set(cacheKey, analysis);
            
            // Display results
            this.displayAIAnalysis(analysis);
            
            return analysis;
            
        } catch (error) {
            console.error('AI Analysis failed:', error);
            this.showAIAnalysisError(error.message);
        } finally {
            this.analysisInProgress = false;
        }
    }

    /**
     * Send element data to AI for analysis
     */
    async sendToAIForAnalysis(elementData) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            return new Promise((resolve, reject) => {
                const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                // Set up response handler
                const responseHandler = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'ai_analysis_complete' && message.requestId === requestId) {
                            this.websocket.removeEventListener('message', responseHandler);
                            resolve(message.analysis);
                        } else if (message.type === 'ai_analysis_error' && message.requestId === requestId) {
                            this.websocket.removeEventListener('message', responseHandler);
                            reject(new Error(message.error));
                        }
                    } catch (error) {
                        console.error('Error parsing AI response:', error);
                    }
                };
                
                this.websocket.addEventListener('message', responseHandler);
                
                // Send analysis request
                this.websocket.send(JSON.stringify({
                    role: 'element-inspector',
                    action: 'analyze_element_ai',
                    requestId,
                    data: {
                        element: elementData,
                        context: {
                            url: window.location.href,
                            viewport: {
                                width: window.innerWidth,
                                height: window.innerHeight
                            },
                            userAgent: navigator.userAgent,
                            timestamp: Date.now()
                        },
                        config: AI_CONFIG.categories
                    }
                }));
                
                // Cleanup timeout
                setTimeout(() => {
                    this.websocket.removeEventListener('message', responseHandler);
                    reject(new Error('AI analysis timeout'));
                }, AI_CONFIG.analysisTimeout);
            });
        } else {
            // Fallback to local analysis if WebSocket unavailable
            return this.performLocalAnalysis(elementData);
        }
    }

    /**
     * Get a CSS selector for an element
     */
    getElementSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        let selector = element.tagName.toLowerCase();
        
        if (element.className) {
            selector += '.' + element.className.split(' ').join('.');
        }
        
        // Add nth-child if needed for uniqueness
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(
                child => child.tagName === element.tagName
            );
            if (siblings.length > 1) {
                const index = siblings.indexOf(element) + 1;
                selector += `:nth-child(${index})`;
            }
        }
        
        return selector;
    }

    /**
     * Capture full page screenshot with comprehensive analysis
     */
    async captureFullScreenshot() {
        try {
            this.addChatMessage('Capturing full page screenshot for comprehensive analysis...', 'system');
            
            // Collect page-level data for analysis
            const pageData = {
                title: document.title,
                url: window.location.href,
                meta: this.extractMetaData(),
                headings: this.extractHeadings(),
                links: this.extractLinkData(),
                images: this.extractImageData(),
                forms: this.extractFormData(),
                accessibility: this.performPageAccessibilityAudit(),
                performance: this.collectPerformanceMetrics()
            };
            
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    role: 'element-inspector',
                    action: 'capture_screenshot_with_analysis',
                    data: {
                        type: 'full_page',
                        url: window.location.href,
                        pageData: pageData,
                        analysisRequest: {
                            includePageStructure: true,
                            includeAccessibilityAudit: true,
                            includePerformanceAnalysis: true,
                            includeSEOAnalysis: true,
                            includeDesignAnalysis: true
                        },
                        context: {
                            viewport: {
                                width: window.innerWidth,
                                height: window.innerHeight
                            },
                            devicePixelRatio: window.devicePixelRatio || 1,
                            userAgent: navigator.userAgent
                        },
                        timestamp: Date.now()
                    }
                }));
            }
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            this.addChatMessage('Screenshot capture failed: ' + error.message, 'system');
        }
    }

    /**
     * Capture screenshot of selected element with AI analysis
     */
    async captureElementScreenshot() {
        if (!this.selectedElement) {
            this.addChatMessage('Please select an element first.', 'system');
            return;
        }

        try {
            this.addChatMessage('Capturing element screenshot for visual analysis...', 'system');
            
            const rect = this.selectedElement.getBoundingClientRect();
            const scrollX = window.pageXOffset;
            const scrollY = window.pageYOffset;
            
            // Extract comprehensive element data for visual context
            const elementData = this.extractElementData(this.selectedElement);
            
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    role: 'element-inspector',
                    action: 'capture_screenshot_with_analysis',
                    data: {
                        type: 'element',
                        url: window.location.href,
                        element: {
                            selector: this.getElementSelector(this.selectedElement),
                            rect: {
                                x: rect.left + scrollX,
                                y: rect.top + scrollY,
                                width: rect.width,
                                height: rect.height
                            },
                            data: elementData
                        },
                        analysisRequest: {
                            includeVisualAnalysis: true,
                            includeColorAnalysis: true,
                            includeLayoutAnalysis: true,
                            includeDesignPatterns: true
                        },
                        context: {
                            viewport: {
                                width: window.innerWidth,
                                height: window.innerHeight
                            },
                            devicePixelRatio: window.devicePixelRatio || 1,
                            currentAnalysis: this.currentAnalysis
                        },
                        timestamp: Date.now()
                    }
                }));
            }
        } catch (error) {
            console.error('Element screenshot failed:', error);
            this.addChatMessage('Element screenshot failed: ' + error.message, 'system');
        }
    }

    /**
     * Copy element information to clipboard
     */
    async copyElementInfo() {
        if (!this.selectedElement) return;
        
        const info = {
            selector: this.getElementSelector(this.selectedElement),
            tag: this.selectedElement.tagName.toLowerCase(),
            id: this.selectedElement.id,
            className: this.selectedElement.className,
            text: this.selectedElement.textContent?.substring(0, 200),
            attributes: Object.fromEntries(
                Array.from(this.selectedElement.attributes).map(attr => [attr.name, attr.value])
            )
        };

        try {
            await navigator.clipboard.writeText(JSON.stringify(info, null, 2));
            this.addChatMessage('Element information copied to clipboard!', 'system');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }

    /**
     * Toggle info panel visibility
     */
    toggleInfo() {
        this.infoPanel.classList.toggle('visible');
    }

    /**
     * Show info panel
     */
    showInfo() {
        this.infoPanel.classList.add('visible');
    }

    /**
     * Toggle chat panel visibility
     */
    toggleChat() {
        this.chatPanel.classList.toggle('visible');
    }

    /**
     * Toggle AI insights panel visibility
     */
    toggleAIInsights() {
        this.aiInsightsPanel.classList.toggle('visible');
        const button = document.querySelector('.control-button[onclick*="toggleAIInsights"]');
        if (button) {
            button.classList.toggle('ai-active');
        }
    }

    /**
     * Show AI insights panel
     */
    showAIInsights() {
        this.aiInsightsPanel.classList.add('visible');
        const button = document.querySelector('.control-button[onclick*="toggleAIInsights"]');
        if (button) {
            button.classList.add('ai-active');
        }
    }

    /**
     * Show AI analysis loading state
     */
    showAIAnalysisLoading() {
        const content = document.getElementById('ai-insights-content');
        content.innerHTML = `
            <div class="analysis-loading">
                <div class="analysis-spinner"></div>
                Analyzing element with AI...
            </div>
        `;
    }

    /**
     * Show AI analysis error
     */
    showAIAnalysisError(message) {
        const content = document.getElementById('ai-insights-content');
        content.innerHTML = `
            <div class="analysis-section">
                <div class="recommendation error">
                    <strong>Analysis Error:</strong> ${this.sanitizeText(message)}
                </div>
            </div>
        `;
    }

    /**
     * Display comprehensive AI analysis results
     */
    displayAIAnalysis(analysis) {
        const content = document.getElementById('ai-insights-content');
        let html = '';
        
        // Accessibility Analysis
        if (analysis.accessibility) {
            html += this.generateAccessibilitySection(analysis.accessibility);
        }
        
        // Performance Analysis
        if (analysis.performance) {
            html += this.generatePerformanceSection(analysis.performance);
        }
        
        // CSS Optimization
        if (analysis.css) {
            html += this.generateCSSSection(analysis.css);
        }
        
        // Semantic HTML
        if (analysis.semantics) {
            html += this.generateSemanticsSection(analysis.semantics);
        }
        
        // Design Patterns
        if (analysis.design) {
            html += this.generateDesignSection(analysis.design);
        }
        
        // SEO Recommendations
        if (analysis.seo) {
            html += this.generateSEOSection(analysis.seo);
        }
        
        // Overall score
        if (analysis.overallScore) {
            html = this.generateOverallScore(analysis.overallScore) + html;
        }
        
        content.innerHTML = html || '<div class="analysis-loading">No analysis results available</div>';
        
        // Add chat message about completion
        this.addChatMessage('AI analysis complete! Check the AI Insights panel for detailed recommendations.', 'system');
    }

    /**
     * Generate accessibility analysis section
     */
    generateAccessibilitySection(accessibility) {
        let html = `
            <div class="analysis-section accessibility">
                <h4>
                    <span>♿</span> Accessibility
                    <span class="severity-badge ${this.getSeverityClass(accessibility.score)}">
                        ${accessibility.score}/100
                    </span>
                </h4>
        `;
        
        if (accessibility.issues && accessibility.issues.length > 0) {
            accessibility.issues.forEach(issue => {
                html += `
                    <div class="recommendation ${issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'success'}">
                        <strong>${this.formatIssueType(issue.type)}:</strong> ${this.sanitizeText(issue.message)}
                        ${issue.current ? `<br><small>Current: ${issue.current}, Required: ${issue.required}</small>` : ''}
                    </div>
                `;
            });
        }
        
        if (accessibility.recommendations && accessibility.recommendations.length > 0) {
            accessibility.recommendations.forEach(rec => {
                html += `
                    <div class="recommendation">
                        <strong>Recommendation:</strong> ${this.sanitizeText(rec.message)}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate performance analysis section
     */
    generatePerformanceSection(performance) {
        let html = `
            <div class="analysis-section performance">
                <h4>
                    <span>⚡</span> Performance
                    <span class="severity-badge ${this.getSeverityClass(performance.score)}">
                        ${performance.score}/100
                    </span>
                </h4>
        `;
        
        if (performance.issues && performance.issues.length > 0) {
            performance.issues.forEach(issue => {
                html += `
                    <div class="recommendation ${issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'success'}">
                        <strong>${this.formatIssueType(issue.type)}:</strong> ${this.sanitizeText(issue.message)}
                        ${issue.value ? `<br><small>Value: ${issue.value}</small>` : ''}
                    </div>
                `;
            });
        }
        
        if (performance.metrics) {
            html += '<div class="recommendation"><strong>Metrics:</strong>';
            Object.entries(performance.metrics).forEach(([key, value]) => {
                html += `<br><small>${key}: ${typeof value === 'number' ? value.toLocaleString() : value}</small>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate CSS optimization section
     */
    generateCSSSection(css) {
        let html = `
            <div class="analysis-section css">
                <h4>
                    <span>🎨</span> CSS Optimization
                    <span class="severity-badge ${this.getSeverityClass(css.score)}">
                        ${css.score}/100
                    </span>
                </h4>
        `;
        
        if (css.suggestions && css.suggestions.length > 0) {
            css.suggestions.forEach(suggestion => {
                html += `
                    <div class="recommendation">
                        <strong>${this.formatIssueType(suggestion.type)}:</strong> ${this.sanitizeText(suggestion.message)}
                        ${suggestion.code ? `<br><code style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 2px;">${this.sanitizeText(suggestion.code)}</code>` : ''}
                    </div>
                `;
            });
        }
        
        if (css.unusedStyles && css.unusedStyles.length > 0) {
            html += '<div class="recommendation warning"><strong>Unused Styles Detected:</strong>';
            css.unusedStyles.forEach(style => {
                html += `<br><small>• ${this.sanitizeText(style)}</small>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate semantic HTML section
     */
    generateSemanticsSection(semantics) {
        let html = `
            <div class="analysis-section semantics">
                <h4>
                    <span>🏷️</span> Semantic HTML
                    <span class="severity-badge ${this.getSeverityClass(semantics.score)}">
                        ${semantics.score}/100
                    </span>
                </h4>
        `;
        
        if (semantics.suggestions && semantics.suggestions.length > 0) {
            semantics.suggestions.forEach(suggestion => {
                html += `
                    <div class="recommendation">
                        <strong>Suggestion:</strong> ${this.sanitizeText(suggestion.message)}
                        ${suggestion.element ? `<br><code style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 2px;">&lt;${suggestion.element}&gt;</code>` : ''}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate design patterns section
     */
    generateDesignSection(design) {
        let html = `
            <div class="analysis-section design">
                <h4>
                    <span>📐</span> Design Patterns
                    <span class="severity-badge ${this.getSeverityClass(design.score)}">
                        ${design.score}/100
                    </span>
                </h4>
        `;
        
        if (design.patterns && design.patterns.length > 0) {
            design.patterns.forEach(pattern => {
                html += `
                    <div class="recommendation">
                        <strong>${pattern.name}:</strong> ${this.sanitizeText(pattern.description)}
                        ${pattern.implementation ? `<br><small>Implementation: ${this.sanitizeText(pattern.implementation)}</small>` : ''}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate SEO section
     */
    generateSEOSection(seo) {
        let html = `
            <div class="analysis-section">
                <h4>
                    <span>🔍</span> SEO & Content
                    <span class="severity-badge ${this.getSeverityClass(seo.score)}">
                        ${seo.score}/100
                    </span>
                </h4>
        `;
        
        if (seo.issues && seo.issues.length > 0) {
            seo.issues.forEach(issue => {
                html += `
                    <div class="recommendation ${issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'success'}">
                        <strong>${this.formatIssueType(issue.type)}:</strong> ${this.sanitizeText(issue.message)}
                    </div>
                `;
            });
        }
        
        if (seo.recommendations && seo.recommendations.length > 0) {
            seo.recommendations.forEach(rec => {
                html += `
                    <div class="recommendation">
                        <strong>Recommendation:</strong> ${this.sanitizeText(rec.message)}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate overall score section
     */
    generateOverallScore(score) {
        const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
        const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
        
        return `
            <div class="analysis-section" style="text-align: center; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 20px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 16px;">Overall Element Quality</h4>
                <div style="font-size: 32px; font-weight: bold; color: ${color}; margin-bottom: 8px;">
                    ${score}/100 (${grade})
                </div>
                <div style="font-size: 12px; color: #94A3B8;">
                    Based on accessibility, performance, semantics, and best practices
                </div>
            </div>
        `;
    }

    /**
     * Send enhanced chat message with element context
     */
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(message, 'user');
        input.value = '';
        
        // Detect if message is asking for specific analysis
        const analysisKeywords = {
            accessibility: ['accessibility', 'a11y', 'screen reader', 'contrast', 'focus', 'aria'],
            performance: ['performance', 'speed', 'optimization', 'render', 'paint', 'layout'],
            css: ['css', 'style', 'styling', 'layout', 'design', 'visual'],
            seo: ['seo', 'semantic', 'heading', 'meta', 'content', 'search'],
            security: ['security', 'xss', 'sanitize', 'validate', 'safe']
        };
        
        const requestedAnalysis = Object.keys(analysisKeywords).filter(category => 
            analysisKeywords[category].some(keyword => 
                message.toLowerCase().includes(keyword)
            )
        );
        
        // Send to AI via WebSocket with enhanced context
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                role: 'element-inspector',
                action: 'chat_message_enhanced',
                data: {
                    message: message,
                    requestedAnalysis: requestedAnalysis,
                    selectedElement: this.selectedElement ? this.extractElementData(this.selectedElement) : null,
                    currentAnalysis: this.currentAnalysis,
                    context: {
                        url: window.location.href,
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        timestamp: Date.now(),
                        pageTitle: document.title,
                        userAgent: navigator.userAgent
                    }
                }
            }));
        } else {
            // Enhanced local response based on requested analysis
            setTimeout(() => {
                this.generateSmartLocalResponse(message, requestedAnalysis);
            }, 1000);
        }
    }

    /**
     * Generate intelligent local responses when AI service unavailable
     */
    generateSmartLocalResponse(message, requestedAnalysis) {
        let response = '';
        
        if (requestedAnalysis.includes('accessibility')) {
            if (this.currentAnalysis?.accessibility) {
                const score = this.currentAnalysis.accessibility.score;
                response += `Based on accessibility analysis, this element scores ${score}/100. `;
                if (this.currentAnalysis.accessibility.issues.length > 0) {
                    response += `Key issues: ${this.currentAnalysis.accessibility.issues[0].message}. `;
                }
            } else {
                response += 'I can analyze accessibility issues like color contrast, focus indicators, and ARIA attributes. ';
            }
        }
        
        if (requestedAnalysis.includes('performance')) {
            if (this.currentAnalysis?.performance) {
                const score = this.currentAnalysis.performance.score;
                response += `Performance analysis shows ${score}/100 score. `;
                if (this.currentAnalysis.performance.issues.length > 0) {
                    response += `Consider: ${this.currentAnalysis.performance.issues[0].message}. `;
                }
            } else {
                response += 'I can check rendering performance, CSS efficiency, and DOM complexity. ';
            }
        }
        
        if (requestedAnalysis.includes('css')) {
            response += 'I can suggest CSS improvements, detect unused styles, and recommend modern practices. ';
        }
        
        if (requestedAnalysis.includes('seo')) {
            response += 'I can analyze semantic structure, heading hierarchy, and content optimization. ';
        }
        
        if (!response) {
            response = 'I can help analyze this element for accessibility, performance, CSS optimization, and SEO. What would you like to focus on?';
        }
        
        this.addChatMessage(response + ' (Connect to AI service for comprehensive analysis)', 'system');
    }

    /**
     * Add message to chat
     */
    addChatMessage(message, type) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        // Sanitize message to prevent XSS
        messageDiv.textContent = this.sanitizeText(message);
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Display element analysis results (legacy method for backward compatibility)
     */
    displayElementAnalysis(analysisData) {
        // This method is kept for backward compatibility with existing WebSocket handlers
        // The new comprehensive analysis is handled by displayAIAnalysis()
        if (analysisData.suggestions && analysisData.suggestions.length > 0) {
            this.addChatMessage('Analysis complete! Here are some suggestions:', 'system');
            analysisData.suggestions.forEach(suggestion => {
                this.addChatMessage('• ' + suggestion, 'system');
            });
        }
        
        if (analysisData.accessibility_issues && analysisData.accessibility_issues.length > 0) {
            this.addChatMessage('Accessibility issues found:', 'system');
            analysisData.accessibility_issues.forEach(issue => {
                this.addChatMessage('⚠️ ' + issue, 'system');
            });
        }
    }

    /**
     * Cleanup and remove inspector
     */
    destroy() {
        this.deactivate();
        
        // Remove all event listeners
        document.removeEventListener('keydown', this.boundHandlers.keydown);
        window.removeEventListener('resize', this.resizeHandler);
        
        // Clean up DOM elements
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        // Close WebSocket connection
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        
        // Clear all references
        this.selectedElement = null;
        this.highlightBox = null;
        this.infoPanel = null;
        this.chatPanel = null;
    }
    
    sanitizeText(text) {
        // Basic text sanitization to prevent XSS
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === AI Analysis Utility Methods ===

    /**
     * Get XPath for an element
     */
    getElementXPath(element) {
        if (element.id) {
            return `//*[@id="${element.id}"]`;
        }
        
        const parts = [];
        let current = element;
        
        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let tagName = current.nodeName.toLowerCase();
            let index = 1;
            
            // Count preceding siblings with same tag name
            let sibling = current.previousElementSibling;
            while (sibling) {
                if (sibling.nodeName.toLowerCase() === tagName) {
                    index++;
                }
                sibling = sibling.previousElementSibling;
            }
            
            // Add position if there are multiple siblings
            const siblings = current.parentNode?.querySelectorAll(tagName) || [];
            if (siblings.length > 1) {
                tagName += `[${index}]`;
            }
            
            parts.unshift(tagName);
            current = current.parentElement;
        }
        
        return '/' + parts.join('/');
    }

    /**
     * Calculate color contrast ratio
     */
    calculateColorContrast(color1, color2) {
        const getLuminance = (color) => {
            // Convert color to RGB values
            const rgb = this.parseColor(color);
            if (!rgb) return 0;
            
            const [r, g, b] = rgb.map(val => {
                val = val / 255;
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            });
            
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * Parse color string to RGB values
     */
    parseColor(colorStr) {
        if (!colorStr) return null;
        
        // RGB/RGBA format
        const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
        }
        
        // Hex format
        const hexMatch = colorStr.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (hexMatch) {
            return [parseInt(hexMatch[1], 16), parseInt(hexMatch[2], 16), parseInt(hexMatch[3], 16)];
        }
        
        return null;
    }

    /**
     * Find previous heading level
     */
    findPreviousHeading(element) {
        let current = element.previousElementSibling;
        
        while (current) {
            if (/^h[1-6]$/i.test(current.tagName)) {
                return parseInt(current.tagName.charAt(1));
            }
            current = current.previousElementSibling;
        }
        
        // Check parent's previous siblings
        if (element.parentElement) {
            return this.findPreviousHeading(element.parentElement);
        }
        
        return 0;
    }

    /**
     * Check focus indicator for element
     */
    checkFocusIndicator(element) {
        // Create temporary element to test focus styles
        const temp = element.cloneNode(true);
        temp.style.visibility = 'hidden';
        temp.style.position = 'absolute';
        temp.style.top = '-9999px';
        document.body.appendChild(temp);
        
        temp.focus();
        const focusStyles = window.getComputedStyle(temp, ':focus');
        const hasFocusStyles = (
            focusStyles.outline !== 'none' ||
            focusStyles.outlineWidth !== '0px' ||
            focusStyles.boxShadow !== 'none' ||
            focusStyles.border !== window.getComputedStyle(temp).border
        );
        
        document.body.removeChild(temp);
        return hasFocusStyles;
    }

    /**
     * Extract ARIA attributes
     */
    extractAriaAttributes(element) {
        const ariaAttrs = {};
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('aria-')) {
                ariaAttrs[attr.name] = attr.value;
            }
        });
        return ariaAttrs;
    }

    /**
     * Get DOM depth of element
     */
    getDOMDepth(element) {
        let depth = 0;
        let current = element;
        
        while (current.parentElement) {
            depth++;
            current = current.parentElement;
        }
        
        return depth;
    }

    /**
     * Get element siblings
     */
    getSiblings(element) {
        if (!element.parentElement) return [];
        
        return Array.from(element.parentElement.children)
            .filter(child => child !== element)
            .map(sibling => ({
                tag: sibling.tagName.toLowerCase(),
                className: sibling.className,
                id: sibling.id,
                index: Array.from(element.parentElement.children).indexOf(sibling)
            }));
    }

    /**
     * Calculate render complexity score
     */
    calculateRenderComplexity(element, computedStyle) {
        let complexity = 0;
        
        // Base complexity from element type
        const heavyElements = ['canvas', 'video', 'iframe', 'object', 'embed'];
        if (heavyElements.includes(element.tagName.toLowerCase())) {
            complexity += 20;
        }
        
        // CSS effects complexity
        if (computedStyle.transform && computedStyle.transform !== 'none') complexity += 5;
        if (computedStyle.filter && computedStyle.filter !== 'none') complexity += 10;
        if (computedStyle.boxShadow && computedStyle.boxShadow !== 'none') {
            complexity += computedStyle.boxShadow.split(',').length * 2;
        }
        if (computedStyle.borderRadius && computedStyle.borderRadius !== '0px') complexity += 2;
        if (computedStyle.opacity !== '1') complexity += 1;
        
        // Background complexity
        if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
            complexity += 5;
            if (computedStyle.backgroundImage.includes('gradient')) complexity += 3;
        }
        
        return Math.min(complexity, 100); // Cap at 100
    }

    /**
     * Check for structured data
     */
    checkStructuredData(element) {
        const structuredAttrs = ['itemscope', 'itemtype', 'itemprop', 'itemref'];
        return structuredAttrs.some(attr => element.hasAttribute(attr));
    }

    /**
     * Generate cache key for analysis results
     */
    generateCacheKey(elementData) {
        const key = {
            tag: elementData.tag,
            className: elementData.className,
            id: elementData.id,
            attributesHash: this.hashObject(elementData.attributes),
            stylesHash: this.hashObject(elementData.styles)
        };
        return btoa(JSON.stringify(key)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    }

    /**
     * Simple object hashing
     */
    hashObject(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    /**
     * Perform local analysis fallback
     */
    performLocalAnalysis(elementData) {
        // Local analysis when AI service is unavailable
        const analysis = {
            accessibility: elementData.accessibility,
            performance: elementData.performance,
            seo: elementData.seo,
            css: {
                score: 75,
                suggestions: [{
                    type: 'local-analysis',
                    message: 'Local analysis - Limited recommendations available. Connect to AI service for comprehensive analysis.'
                }]
            },
            semantics: {
                score: 70,
                suggestions: [{
                    message: 'Consider using semantic HTML5 elements for better structure and accessibility.'
                }]
            },
            design: {
                score: 65,
                patterns: [{
                    name: 'Basic Element',
                    description: 'Standard HTML element - consider modern design patterns for enhanced UX.'
                }]
            },
            overallScore: Math.round((
                elementData.accessibility.score +
                elementData.performance.score +
                elementData.seo.score
            ) / 3)
        };
        
        return Promise.resolve(analysis);
    }

    /**
     * Get severity class for scores
     */
    getSeverityClass(score) {
        if (score >= 80) return 'severity-low';
        if (score >= 60) return 'severity-medium';
        return 'severity-high';
    }

    /**
     * Format issue type for display
     */
    formatIssueType(type) {
        return type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // === Page-Level Analysis Methods ===

    /**
     * Extract meta data from page
     */
    extractMetaData() {
        const metaTags = {};
        document.querySelectorAll('meta').forEach(meta => {
            const name = meta.name || meta.property || meta.httpEquiv;
            if (name) {
                metaTags[name] = meta.content;
            }
        });
        
        return {
            title: document.title,
            description: metaTags.description || '',
            keywords: metaTags.keywords || '',
            author: metaTags.author || '',
            viewport: metaTags.viewport || '',
            charset: document.characterSet,
            lang: document.documentElement.lang || '',
            ogTitle: metaTags['og:title'] || '',
            ogDescription: metaTags['og:description'] || '',
            ogImage: metaTags['og:image'] || ''
        };
    }

    /**
     * Extract heading structure
     */
    extractHeadings() {
        const headings = [];
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
            headings.push({
                level: parseInt(heading.tagName.charAt(1)),
                text: heading.textContent.trim().substring(0, 100),
                id: heading.id || '',
                className: heading.className || '',
                index: index
            });
        });
        return headings;
    }

    /**
     * Extract link data
     */
    extractLinkData() {
        const links = [];
        document.querySelectorAll('a[href]').forEach(link => {
            links.push({
                href: link.href,
                text: link.textContent.trim().substring(0, 50),
                title: link.title || '',
                target: link.target || '',
                rel: link.rel || '',
                isExternal: !link.href.startsWith(window.location.origin),
                hasText: link.textContent.trim().length > 0
            });
        });
        return links.slice(0, 50); // Limit for performance
    }

    /**
     * Extract image data
     */
    extractImageData() {
        const images = [];
        document.querySelectorAll('img').forEach(img => {
            images.push({
                src: img.src,
                alt: img.alt || '',
                title: img.title || '',
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height,
                hasAlt: !!img.alt,
                isDecorative: img.alt === '',
                loading: img.loading || 'eager'
            });
        });
        return images.slice(0, 20); // Limit for performance
    }

    /**
     * Extract form data
     */
    extractFormData() {
        const forms = [];
        document.querySelectorAll('form').forEach(form => {
            const inputs = Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
                type: input.type || input.tagName.toLowerCase(),
                name: input.name || '',
                id: input.id || '',
                required: input.required || false,
                hasLabel: this.hasLabel(input),
                placeholder: input.placeholder || ''
            }));
            
            forms.push({
                action: form.action || '',
                method: form.method || 'get',
                id: form.id || '',
                inputs: inputs,
                hasSubmit: form.querySelector('[type="submit"], button[type="submit"], button:not([type])') !== null
            });
        });
        return forms;
    }

    /**
     * Check if input has associated label
     */
    hasLabel(input) {
        if (input.id && document.querySelector(`label[for="${input.id}"]`)) {
            return true;
        }
        if (input.closest('label')) {
            return true;
        }
        if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) {
            return true;
        }
        return false;
    }

    /**
     * Perform page-level accessibility audit
     */
    performPageAccessibilityAudit() {
        const issues = [];
        const score = { total: 0, passed: 0 };
        
        // Check for page title
        score.total++;
        if (document.title.trim()) {
            score.passed++;
        } else {
            issues.push({ type: 'missing-title', severity: 'high', message: 'Page missing title' });
        }
        
        // Check for main landmark
        score.total++;
        if (document.querySelector('main, [role="main"]')) {
            score.passed++;
        } else {
            issues.push({ type: 'missing-main', severity: 'medium', message: 'Page missing main landmark' });
        }
        
        // Check for heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        score.total++;
        if (headings.length > 0) {
            score.passed++;
            
            // Check for h1
            const h1Count = document.querySelectorAll('h1').length;
            if (h1Count === 0) {
                issues.push({ type: 'missing-h1', severity: 'high', message: 'Page missing h1 heading' });
            } else if (h1Count > 1) {
                issues.push({ type: 'multiple-h1', severity: 'medium', message: 'Page has multiple h1 headings' });
            }
        } else {
            issues.push({ type: 'no-headings', severity: 'high', message: 'Page has no headings' });
        }
        
        // Check for skip links
        score.total++;
        if (document.querySelector('a[href^="#"]')) {
            score.passed++;
        } else {
            issues.push({ type: 'missing-skip-links', severity: 'medium', message: 'Page missing skip links' });
        }
        
        // Check language attribute
        score.total++;
        if (document.documentElement.lang) {
            score.passed++;
        } else {
            issues.push({ type: 'missing-lang', severity: 'high', message: 'Page missing language attribute' });
        }
        
        return {
            score: Math.round((score.passed / score.total) * 100),
            issues,
            passed: score.passed,
            total: score.total
        };
    }

    /**
     * Collect performance metrics
     */
    collectPerformanceMetrics() {
        const metrics = {};
        
        try {
            // Navigation timing
            if (performance.timing) {
                const timing = performance.timing;
                metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
                metrics.firstPaint = timing.responseEnd - timing.fetchStart;
            }
            
            // Resource timing
            if (performance.getEntriesByType) {
                const resources = performance.getEntriesByType('resource');
                metrics.resourceCount = resources.length;
                metrics.totalResourceSize = resources.reduce((total, resource) => 
                    total + (resource.transferSize || 0), 0);
            }
            
            // Memory usage (Chrome only)
            if (performance.memory) {
                metrics.memoryUsed = performance.memory.usedJSHeapSize;
                metrics.memoryLimit = performance.memory.jsHeapSizeLimit;
            }
            
            // DOM metrics
            metrics.domNodes = document.querySelectorAll('*').length;
            metrics.images = document.querySelectorAll('img').length;
            metrics.scripts = document.querySelectorAll('script').length;
            metrics.stylesheets = document.querySelectorAll('link[rel="stylesheet"], style').length;
            
        } catch (error) {
            console.warn('Performance metrics collection failed:', error);
        }
        
        return metrics;
    }

    /**
     * Show help overlay with keyboard shortcuts and usage instructions
     */
    showHelp() {
        // Create help overlay if it doesn't exist
        let helpOverlay = document.getElementById('element-inspector-help');
        if (!helpOverlay) {
            helpOverlay = document.createElement('div');
            helpOverlay.id = 'element-inspector-help';
            helpOverlay.innerHTML = `
                <style>
                    #element-inspector-help {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        backdrop-filter: blur(10px);
                        z-index: 1000000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    
                    .help-content {
                        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 12px;
                        padding: 32px;
                        max-width: 600px;
                        max-height: 80vh;
                        overflow-y: auto;
                        color: white;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    }
                    
                    .help-content h2 {
                        margin: 0 0 24px 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: #3B82F6;
                        text-align: center;
                    }
                    
                    .help-section {
                        margin-bottom: 24px;
                    }
                    
                    .help-section h3 {
                        margin: 0 0 12px 0;
                        font-size: 16px;
                        font-weight: 600;
                        color: #E2E8F0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        padding-bottom: 4px;
                    }
                    
                    .help-item {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;
                        font-size: 14px;
                        line-height: 1.4;
                    }
                    
                    .help-shortcut {
                        background: rgba(59, 130, 246, 0.2);
                        color: #93C5FD;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-family: monospace;
                        font-weight: 600;
                        min-width: 100px;
                        margin-right: 12px;
                        text-align: center;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                    }
                    
                    .help-description {
                        color: #CBD5E1;
                    }
                    
                    .help-close {
                        background: #3B82F6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        padding: 12px 24px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: 24px;
                        width: 100%;
                        transition: background-color 0.2s;
                    }
                    
                    .help-close:hover {
                        background: #2563EB;
                    }
                    
                    .feature-badge {
                        display: inline-block;
                        background: linear-gradient(90deg, #10B981, #059669);
                        color: white;
                        font-size: 10px;
                        font-weight: 600;
                        padding: 2px 6px;
                        border-radius: 4px;
                        margin-left: 8px;
                        text-transform: uppercase;
                    }
                </style>
                <div class="help-content">
                    <h2>🤖 AI-Powered Element Inspector</h2>
                    
                    <div class="help-section">
                        <h3>Keyboard Shortcuts</h3>
                        <div class="help-item">
                            <span class="help-shortcut">Alt + I</span>
                            <span class="help-description">Toggle element inspector mode</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">Alt + A</span>
                            <span class="help-description">Toggle AI insights panel</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">Alt + C</span>
                            <span class="help-description">Toggle AI chat panel</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">Alt + S</span>
                            <span class="help-description">Screenshot selected element</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">Alt + Shift + S</span>
                            <span class="help-description">Screenshot entire page</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">Alt + R</span>
                            <span class="help-description">Re-analyze selected element</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">Escape</span>
                            <span class="help-description">Exit inspector mode</span>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>AI Analysis Features</h3>
                        <div class="help-item">
                            <span class="help-shortcut">♿</span>
                            <span class="help-description">Accessibility audit and recommendations <span class="feature-badge">AI</span></span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">⚡</span>
                            <span class="help-description">Performance analysis and optimization tips <span class="feature-badge">AI</span></span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">🎨</span>
                            <span class="help-description">CSS optimization and cleanup suggestions <span class="feature-badge">AI</span></span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">🏷️</span>
                            <span class="help-description">Semantic HTML improvement recommendations <span class="feature-badge">AI</span></span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">👁️</span>
                            <span class="help-description">Visual design analysis from screenshots <span class="feature-badge">AI</span></span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">🔍</span>
                            <span class="help-description">SEO and content optimization insights <span class="feature-badge">AI</span></span>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Usage Instructions</h3>
                        <div class="help-item">
                            <span class="help-shortcut">1.</span>
                            <span class="help-description">Activate inspector mode (Alt + I or click Inspector button)</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">2.</span>
                            <span class="help-description">Hover over elements to highlight them</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">3.</span>
                            <span class="help-description">Click an element to select and analyze it</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">4.</span>
                            <span class="help-description">View AI insights in the blue panel on the right</span>
                        </div>
                        <div class="help-item">
                            <span class="help-shortcut">5.</span>
                            <span class="help-description">Chat with AI about the element for specific questions</span>
                        </div>
                    </div>
                    
                    <button class="help-close" onclick="this.closest('#element-inspector-help').remove()">Got it! Let's start analyzing</button>
                </div>
            `;
            document.body.appendChild(helpOverlay);
        }
        
        // Show the help overlay
        helpOverlay.style.display = 'flex';
        
        // Close on click outside
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) {
                helpOverlay.remove();
            }
        });
        
        // Close on Escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                helpOverlay.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    /**
     * Activates capture mode for element selection
     * This method enables interactive element selection for AI analysis or screenshot capture
     */
    activateCaptureMode() {
        // Ensure inspector is initialized
        if (!this.overlay) {
            this.init();
        }

        // Show the inspector overlay
        if (!this.isVisible) {
            this.toggle();
        }

        // Set capture mode state
        this.captureMode = {
            active: true,
            startTime: Date.now(),
            selectedElements: []
        };

        // Add capture mode visual indicator
        this.addCaptureModeIndicator();

        // Enable enhanced element hover tracking
        this.activateHoverTracking();

        // Add capture mode specific keyboard shortcuts
        this.addCaptureModeKeyboardShortcuts();

        // Show capture mode notification
        this.showCaptureModeNotification();

        // Dispatch capture mode activated event
        this.dispatchEvent(new CustomEvent('captureModeActivated', {
            detail: { timestamp: this.captureMode.startTime }
        }));

        console.log('🎯 Element Inspector: Capture mode activated');
    }

    /**
     * Adds visual indicator for capture mode
     */
    addCaptureModeIndicator() {
        // Remove existing indicator if present
        const existingIndicator = document.getElementById('capture-mode-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create capture mode indicator
        const indicator = document.createElement('div');
        indicator.id = 'capture-mode-indicator';
        indicator.innerHTML = `
            <style>
                #capture-mode-indicator {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    z-index: 999999;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: captureModeIndicatorPulse 2s infinite;
                }

                @keyframes captureModeIndicatorPulse {
                    0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4); }
                    50% { box-shadow: 0 4px 25px rgba(59, 130, 246, 0.6); }
                }

                .capture-indicator-icon {
                    font-size: 16px;
                    animation: captureModeIndicatorBlink 1.5s infinite;
                }

                @keyframes captureModeIndicatorBlink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.5; }
                }
            </style>
            <span class="capture-indicator-icon">🎯</span>
            <span>Capture Mode Active</span>
        `;

        document.body.appendChild(indicator);

        // Auto-remove after 5 seconds unless capture mode is still active
        setTimeout(() => {
            if (indicator.parentNode && (!this.captureMode || !this.captureMode.active)) {
                indicator.remove();
            }
        }, 5000);
    }

    /**
     * Activates enhanced hover tracking for capture mode
     */
    activateHoverTracking() {
        // Store original hover handler if not already stored
        if (!this.originalHoverHandler) {
            this.originalHoverHandler = this.currentHoverHandler;
        }

        // Enhanced hover handler for capture mode
        this.currentHoverHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const element = e.target;
            
            // Skip if hovering over inspector elements
            if (this.isInspectorElement(element)) {
                return;
            }

            // Enhanced highlight for capture mode
            this.highlightElementForCapture(element);
            
            // Update info panel with capture-specific information
            this.updateCaptureInfo(element);
        };

        // Replace hover listeners
        document.removeEventListener('mouseover', this.originalHoverHandler);
        document.addEventListener('mouseover', this.currentHoverHandler);
    }

    /**
     * Highlights element with capture mode specific styling
     */
    highlightElementForCapture(element) {
        // Use existing highlight functionality but with enhanced styling
        this.highlightElement(element);
        
        // Add capture-specific styling to highlight box
        if (this.highlightBox) {
            this.highlightBox.style.border = '3px solid #3B82F6';
            this.highlightBox.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)';
            this.highlightBox.style.background = 'rgba(59, 130, 246, 0.1)';
        }
    }

    /**
     * Updates info panel with capture-specific information
     */
    updateCaptureInfo(element) {
        if (!this.infoPanel) return;

        const rect = element.getBoundingClientRect();
        const computedStyles = window.getComputedStyle(element);
        
        // Enhanced info for capture mode
        const captureInfo = `
            <div style="padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; margin-bottom: 12px;">
                <div style="font-weight: 600; color: #3B82F6; margin-bottom: 8px;">🎯 Capture Mode Active</div>
                <div style="font-size: 12px; color: #64748B;">Click to select this element</div>
            </div>
            <div><strong>Element:</strong> ${element.tagName.toLowerCase()}</div>
            ${element.id ? `<div><strong>ID:</strong> ${element.id}</div>` : ''}
            ${element.className ? `<div><strong>Classes:</strong> ${element.className}</div>` : ''}
            <div><strong>Dimensions:</strong> ${Math.round(rect.width)}×${Math.round(rect.height)}px</div>
            <div><strong>Position:</strong> ${Math.round(rect.left)}, ${Math.round(rect.top)}</div>
            ${element.textContent && element.textContent.length < 50 ? `<div><strong>Text:</strong> ${element.textContent.trim()}</div>` : ''}
        `;
        
        this.infoPanel.innerHTML = captureInfo;
    }

    /**
     * Adds capture mode specific keyboard shortcuts
     */
    addCaptureModeKeyboardShortcuts() {
        // Store original keydown handler
        if (!this.originalKeydownHandler) {
            this.originalKeydownHandler = this.handleKeyDown.bind(this);
        }

        // Enhanced keydown handler for capture mode
        this.captureModeKeydownHandler = (e) => {
            // ESC to exit capture mode
            if (e.key === 'Escape') {
                e.preventDefault();
                this.deactivateCaptureMode();
                return;
            }

            // Space to capture current hovered element
            if (e.code === 'Space' && this.hoveredElement) {
                e.preventDefault();
                this.selectElementForCapture(this.hoveredElement);
                return;
            }

            // Call original handler for other shortcuts
            if (this.originalKeydownHandler) {
                this.originalKeydownHandler(e);
            }
        };

        document.addEventListener('keydown', this.captureModeKeydownHandler);
    }

    /**
     * Shows capture mode notification
     */
    showCaptureModeNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(15, 23, 42, 0.95);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 999998;
            border: 1px solid rgba(59, 130, 246, 0.3);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            animation: captureNotificationSlideIn 0.3s ease-out;
        `;

        notification.innerHTML = `
            <style>
                @keyframes captureNotificationSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes captureNotificationSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            </style>
            <div style="font-weight: 600; margin-bottom: 8px;">🎯 Capture Mode Instructions:</div>
            <div style="font-size: 12px; line-height: 1.4; color: #94A3B8;">
                • Hover over elements to preview<br>
                • Click to select for analysis<br>
                • Press <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">Space</kbd> to capture hovered element<br>
                • Press <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">Esc</kbd> to exit capture mode
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'captureNotificationSlideOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    /**
     * Selects an element for capture mode processing
     */
    selectElementForCapture(element) {
        if (!this.captureMode || !this.captureMode.active) {
            return;
        }

        // Add to selected elements
        this.captureMode.selectedElements.push({
            element: element,
            timestamp: Date.now(),
            elementInfo: {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                textContent: element.textContent?.substring(0, 100)
            }
        });

        // Select the element using existing functionality
        this.selectElement(element);

        // Trigger AI analysis if available
        this.analyzeElementWithAI(element);

        // Dispatch element selected event
        this.dispatchEvent(new CustomEvent('elementSelectedInCaptureMode', {
            detail: { 
                element: element,
                captureMode: this.captureMode,
                elementCount: this.captureMode.selectedElements.length
            }
        }));

        console.log('🎯 Element selected in capture mode:', element);
    }

    /**
     * Deactivates capture mode
     */
    deactivateCaptureMode() {
        if (!this.captureMode || !this.captureMode.active) {
            return;
        }

        // Restore original handlers
        if (this.originalHoverHandler) {
            document.removeEventListener('mouseover', this.currentHoverHandler);
            document.addEventListener('mouseover', this.originalHoverHandler);
            this.currentHoverHandler = this.originalHoverHandler;
        }

        if (this.captureModeKeydownHandler) {
            document.removeEventListener('keydown', this.captureModeKeydownHandler);
        }

        // Remove capture mode indicator
        const indicator = document.getElementById('capture-mode-indicator');
        if (indicator) {
            indicator.remove();
        }

        // Clear capture mode state
        const captureStats = {
            duration: Date.now() - this.captureMode.startTime,
            elementsSelected: this.captureMode.selectedElements.length
        };
        
        this.captureMode = { active: false };

        // Dispatch capture mode deactivated event
        this.dispatchEvent(new CustomEvent('captureModeDeactivated', {
            detail: captureStats
        }));

        console.log('🎯 Element Inspector: Capture mode deactivated', captureStats);
    }
}

// Initialize the element inspector
const elementInspector = new ElementInspector();

// Expose to global scope for button handlers
window.elementInspector = elementInspector;

// Enhanced keyboard shortcuts for AI-powered element inspector
document.addEventListener('keydown', (e) => {
    // Alt + I: Toggle inspector
    if (e.altKey && e.key === 'i') {
        e.preventDefault();
        elementInspector.toggle();
    }
    
    // Alt + A: Toggle AI insights panel
    if (e.altKey && e.key === 'a') {
        e.preventDefault();
        elementInspector.toggleAIInsights();
    }
    
    // Alt + C: Toggle chat panel
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        elementInspector.toggleChat();
    }
    
    // Alt + S: Capture screenshot of selected element
    if (e.altKey && e.key === 's' && elementInspector.selectedElement) {
        e.preventDefault();
        elementInspector.captureElementScreenshot();
    }
    
    // Alt + Shift + S: Capture full page screenshot
    if (e.altKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        elementInspector.captureFullScreenshot();
    }
    
    // Alt + R: Re-analyze selected element
    if (e.altKey && e.key === 'r' && elementInspector.selectedElement) {
        e.preventDefault();
        elementInspector.analyzeElementWithAI(elementInspector.selectedElement);
        elementInspector.addChatMessage('Re-analyzing selected element...', 'system');
    }
    
    // Alt + H: Show help
    if (e.altKey && e.key === 'h') {
        e.preventDefault();
        elementInspector.showHelp();
    }
});

console.log('🤖 AI-Powered Element Inspector loaded!\n' +
    'Keyboard shortcuts:\n' +
    '  Alt + I: Toggle inspector\n' +
    '  Alt + A: Toggle AI insights\n' +
    '  Alt + C: Toggle chat\n' +
    '  Alt + S: Screenshot element\n' +
    '  Alt + Shift + S: Screenshot page\n' +
    '  Alt + R: Re-analyze element\n' +
    '  Alt + H: Show help\n' +
    '\nClick any element to get AI-powered analysis and recommendations!');