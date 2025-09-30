/**
 * Integration Initializer
 * Ensures all computer vision and AI analysis components work together seamlessly
 */

class IntegrationInitializer {
    constructor() {
        this.components = {
            screenshotSystem: null,
            aiChatIntegration: null,
            claudeVisionHandler: null,
            elementInspector: null,
            aiPromptTemplates: null,
            stabilityAgent: null,
            protocolBridge: null
        };
        this.integrationStatus = {
            initialized: false,
            errors: [],
            warnings: []
        };
        this.initializationAttempts = 0;
        this.maxAttempts = 3;
    }

    async initialize() {
        this.initializationAttempts++;
        console.log(`🚀 Starting integration initialization (attempt ${this.initializationAttempts})`);

        try {
            // Wait for DOM to be ready
            if (document.readyState !== 'complete') {
                await this.waitForDOMReady();
            }

            // Wait for all components to be available
            await this.waitForComponents();

            // Initialize components in the correct order
            await this.initializeComponents();

            // Set up integrations between components
            await this.setupIntegrations();
            
            // Additional connection checks
            await this.performConnectionChecks();

            // Perform integration tests
            await this.runIntegrationTests();

            // Set up keyboard shortcuts and UI enhancements
            this.setupGlobalFeatures();

            this.integrationStatus.initialized = true;
            console.log('✅ Integration initialization completed successfully');

            // Show initialization complete notification
            this.showInitializationNotification();

        } catch (error) {
            console.error('❌ Integration initialization failed:', error);
            this.integrationStatus.errors.push(error.message);

            if (this.initializationAttempts < this.maxAttempts) {
                console.log(`🔄 Retrying initialization in 2 seconds...`);
                setTimeout(() => this.initialize(), 2000);
            } else {
                console.error('❌ Maximum initialization attempts reached');
                this.showInitializationError();
            }
        }
    }

    async waitForDOMReady() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    async waitForComponents() {
        console.log('⏳ Waiting for components to load...');
        
        const maxWait = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        const startTime = Date.now();

        while (Date.now() - startTime < maxWait) {
            // Check if all required components are available
            const componentsAvailable = {
                AIPromptTemplates: window.AIPromptTemplates,
                screenshotCaptureSystem: window.screenshotCaptureSystem,
                aiChatIntegration: window.aiChatIntegration,
                claudeVisionHandler: window.claudeVisionHandler,
                elementInspector: window.elementInspector,
                WebSocketBrokerStabilityAgent: window.WebSocketBrokerStabilityAgent,
                EnhancedProtocolIntegrationBridge: window.EnhancedProtocolIntegrationBridge
            };

            const allLoaded = Object.values(componentsAvailable).every(component => component !== undefined);

            if (allLoaded) {
                console.log('✅ All components loaded successfully');
                
                // Store component references
                this.components = {
                    aiPromptTemplates: new window.AIPromptTemplates(),
                    screenshotSystem: window.screenshotCaptureSystem,
                    aiChatIntegration: window.aiChatIntegration,
                    claudeVisionHandler: window.claudeVisionHandler,
                    elementInspector: window.elementInspector,
                    stabilityAgent: new window.WebSocketBrokerStabilityAgent(),
                    protocolBridge: new window.EnhancedProtocolIntegrationBridge()
                };
                
                return;
            }

            // Log what's still loading
            const missing = Object.entries(componentsAvailable)
                .filter(([name, component]) => !component)
                .map(([name]) => name);
            
            if (missing.length > 0) {
                console.log(`⏳ Still waiting for: ${missing.join(', ')}`);
            }

            await this.sleep(checkInterval);
        }

        throw new Error('Components failed to load within timeout');
    }

    async initializeComponents() {
        console.log('🔧 Initializing component integrations...');

        // Initialize screenshot system with AI prompt templates
        if (this.components.screenshotSystem && this.components.aiPromptTemplates) {
            this.components.screenshotSystem.aiPrompts = this.components.aiPromptTemplates;
            console.log('✅ Screenshot system integrated with AI prompt templates');
        }

        // Initialize WebSocket stability agent
        if (this.components.stabilityAgent) {
            try {
                await this.components.stabilityAgent.init();
                console.log('✅ WebSocket stability agent initialized');
            } catch (error) {
                console.error('❌ Failed to initialize stability agent:', error);
                this.integrationStatus.errors.push(`Stability agent initialization failed: ${error.message}`);
            }
        }

        // Initialize enhanced protocol integration bridge
        if (this.components.protocolBridge && this.components.stabilityAgent) {
            try {
                // Create a minimal enhanced protocols instance for bridge integration
                const enhancedProtocols = { on: () => {}, emit: () => {} }; // Placeholder
                const protocolAgent = { on: () => {}, emit: () => {} }; // Placeholder
                
                await this.components.protocolBridge.init(
                    enhancedProtocols, 
                    this.components.stabilityAgent, 
                    protocolAgent
                );
                console.log('✅ Enhanced protocol integration bridge initialized');
            } catch (error) {
                console.error('❌ Failed to initialize protocol bridge:', error);
                this.integrationStatus.errors.push(`Protocol bridge initialization failed: ${error.message}`);
            }
        }

        console.log('✅ Component initialization completed');
    }

    async setupIntegrations() {
        console.log('🔗 Setting up component integrations...');

        try {
            // Integrate screenshot system with AI chat
            if (this.components.screenshotSystem && this.components.aiChatIntegration) {
                this.components.aiChatIntegration.setScreenshotSystem(this.components.screenshotSystem);
                console.log('✅ Screenshot system integrated with AI chat');
            } else {
                console.warn('⚠️ Screenshot system or AI chat integration missing:', {
                    screenshotSystem: !!this.components.screenshotSystem,
                    aiChatIntegration: !!this.components.aiChatIntegration
                });
            }

            // Integrate element inspector with screenshot system and AI chat
            if (this.components.elementInspector) {
                if (this.components.screenshotSystem) {
                    this.components.screenshotSystem.setElementInspector(this.components.elementInspector);
                    console.log('✅ Element inspector integrated with screenshot system');
                }
                
                if (this.components.aiChatIntegration) {
                    this.components.aiChatIntegration.setElementInspector(this.components.elementInspector);
                    console.log('✅ Element inspector integrated with AI chat');
                }
            }

            // Set up protocol bridge integrations
            if (this.components.protocolBridge) {
                try {
                    // Connect protocol bridge to WebSocket stability agent
                    if (this.components.stabilityAgent) {
                        this.components.protocolBridge.setStabilityAgent(this.components.stabilityAgent);
                        console.log('✅ Protocol bridge connected to stability agent');
                    }

                    // Connect protocol bridge to screenshot system for enhanced capture messages
                    if (this.components.screenshotSystem) {
                        this.components.protocolBridge.setScreenshotSystem(this.components.screenshotSystem);
                        console.log('✅ Protocol bridge connected to screenshot system');
                    }

                    // Connect protocol bridge to element inspector for selection tracking
                    if (this.components.elementInspector) {
                        this.components.protocolBridge.setElementInspector(this.components.elementInspector);
                        console.log('✅ Protocol bridge connected to element inspector');
                    }

                    // Connect protocol bridge to AI chat for IDE integration
                    if (this.components.aiChatIntegration) {
                        this.components.protocolBridge.setAIChatIntegration(this.components.aiChatIntegration);
                        console.log('✅ Protocol bridge connected to AI chat integration');
                    }

                    // Set up protocol bridge event listeners for enhanced messaging
                    this.setupProtocolBridgeEvents();
                    
                } catch (error) {
                    console.error('❌ Protocol bridge integration setup failed:', error);
                    this.integrationStatus.warnings.push(`Protocol bridge integration warning: ${error.message}`);
                }
            }

            // Set up cross-component event handling
            this.setupCrossComponentEvents();

            console.log('✅ All integrations set up successfully');

        } catch (error) {
            console.error('❌ Integration setup failed:', error);
            this.integrationStatus.warnings.push(`Integration setup warning: ${error.message}`);
        }
    }
    
    async performConnectionChecks() {
        console.log('🔍 Performing connection checks...');
        
        // Force AI Chat Integration to reconnect to screenshot system
        if (this.components.aiChatIntegration && this.components.aiChatIntegration.connectToScreenshotSystem) {
            this.components.aiChatIntegration.connectToScreenshotSystem();
        }
        
        // Verify connections
        const connections = {
            aiChatHasScreenshots: !!(this.components.aiChatIntegration?.screenshotSystem),
            aiChatHasElementInspector: !!(this.components.aiChatIntegration?.elementInspector),
            screenshotSystemReady: !!(this.components.screenshotSystem?.getCapabilities),
            elementInspectorReady: !!(this.components.elementInspector)
        };
        
        console.log('🔗 Connection status:', connections);
        
        // Fix missing connections
        if (!connections.aiChatHasScreenshots && this.components.screenshotSystem) {
            console.log('🔧 Fixing screenshot system connection...');
            this.components.aiChatIntegration.setScreenshotSystem(this.components.screenshotSystem);
        }
        
        if (!connections.aiChatHasElementInspector && this.components.elementInspector) {
            console.log('🔧 Fixing element inspector connection...');
            this.components.aiChatIntegration.setElementInspector(this.components.elementInspector);
        }
        
        console.log('✅ Connection checks completed');
    }

    setupCrossComponentEvents() {
        // Set up events for seamless component communication
        
        // Screenshot analysis completion
        document.addEventListener('visionAnalysisComplete', (event) => {
            const { analysisType, insights, suggestions } = event.detail;
            console.log(`🔍 Vision analysis completed: ${analysisType}`);
            
            // Optionally trigger additional actions based on analysis
            this.handleAnalysisCompletion(analysisType, insights, suggestions);
        });

        // Element selection for analysis
        document.addEventListener('elementSelected', (event) => {
            const { element, context } = event.detail;
            console.log('🎯 Element selected for analysis:', element);
            
            // Auto-trigger screenshot capture for selected element
            if (this.components.screenshotSystem) {
                this.components.screenshotSystem.captureElement(element, { 
                    autoAnalyze: true,
                    context: context 
                });
            }
        });

        // Real-time insights
        document.addEventListener('realTimeInsight', (event) => {
            const { insight, priority, category } = event.detail;
            console.log(`💡 Real-time insight (${priority}):`, insight);
        });
    }

    setupProtocolBridgeEvents() {
        // Set up enhanced protocol bridge event listeners for real-time collaboration
        console.log('🌉 Setting up protocol bridge event handlers...');

        if (!this.components.protocolBridge) return;

        try {
            // Handle element selection events for enhanced protocol transmission
            document.addEventListener('elementSelected', (event) => {
                const { element, context } = event.detail;
                
                if (this.components.protocolBridge.sendElementSelectedMessage) {
                    const elementData = {
                        elementId: element.id || element.tagName + '_' + Date.now(),
                        elementType: element.tagName.toLowerCase(),
                        elementClass: element.className,
                        parentPath: this.getElementPath(element),
                        coordinates: element.getBoundingClientRect(),
                        deviceContext: this.getDeviceContext(),
                        sessionId: this.getSessionId(),
                        userId: this.getUserId()
                    };
                    
                    this.components.protocolBridge.sendElementSelectedMessage(elementData);
                }
            });

            // Handle screenshot capture events for enhanced protocol messaging
            document.addEventListener('screenshotCaptured', (event) => {
                const { imageData, metadata } = event.detail;
                
                if (this.components.protocolBridge.sendScreenshotCaptureMessage) {
                    const captureData = {
                        device: metadata.device || 'browser',
                        format: metadata.format || 'png',
                        quality: metadata.quality || 90,
                        fullPage: metadata.fullPage || false,
                        annotations: metadata.annotations || [],
                        sessionId: this.getSessionId()
                    };
                    
                    this.components.protocolBridge.sendScreenshotCaptureMessage(captureData);
                }
            });

            // Handle AI analysis requests for enhanced protocol routing
            document.addEventListener('aiAnalysisRequested', (event) => {
                const { analysisType, targetElements, context, priority } = event.detail;
                
                if (this.components.protocolBridge.sendAIAnalysisRequest) {
                    const analysisData = {
                        analysisType: analysisType,
                        targetElements: targetElements,
                        context: context,
                        urgency: priority || 'medium',
                        expectedFormat: 'json',
                        userId: this.getUserId(),
                        sessionId: this.getSessionId()
                    };
                    
                    this.components.protocolBridge.sendAIAnalysisRequest(analysisData);
                }
            });

            // Handle IDE integration events
            document.addEventListener('ideCodeUpdate', (event) => {
                const { code, language, filePath, action } = event.detail;
                
                if (this.components.protocolBridge.sendIDEMessage) {
                    const ideData = {
                        ideType: 'browser-ide',
                        messageType: 'code_update',
                        code: code,
                        language: language,
                        filePath: filePath,
                        action: action,
                        metadata: { timestamp: Date.now() }
                    };
                    
                    this.components.protocolBridge.sendIDEMessage(ideData);
                }
            });

            console.log('✅ Protocol bridge event handlers configured');

        } catch (error) {
            console.error('❌ Failed to set up protocol bridge events:', error);
            this.integrationStatus.warnings.push(`Protocol bridge events setup failed: ${error.message}`);
        }
    }

    // Helper methods for protocol bridge integration
    getElementPath(element) {
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            const selector = current.tagName.toLowerCase();
            const id = current.id ? `#${current.id}` : '';
            const classes = current.className ? `.${current.className.split(' ').join('.')}` : '';
            path.unshift(`${selector}${id}${classes}`);
            current = current.parentElement;
        }
        
        return path;
    }

    getDeviceContext() {
        return {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            userAgent: navigator.userAgent,
            pixelRatio: window.devicePixelRatio || 1,
            timestamp: Date.now()
        };
    }

    getSessionId() {
        return this.integrationStatus.sessionId || 'session_' + Date.now();
    }

    getUserId() {
        return 'user_' + (Math.random().toString(36).substr(2, 9));
    }

    handleAnalysisCompletion(analysisType, insights, suggestions) {
        // Handle completed analysis results
        
        // Auto-generate follow-up suggestions for accessibility issues
        if (analysisType === 'accessibility' && insights.some(i => i.includes('issue'))) {
            setTimeout(() => {
                this.generateFollowUpSuggestions('accessibility', insights);
            }, 1000);
        }

        // Auto-suggest performance optimizations
        if (analysisType === 'performance' && suggestions.length > 0) {
            setTimeout(() => {
                this.generatePerformanceRecommendations(suggestions);
            }, 1500);
        }
    }

    generateFollowUpSuggestions(type, insights) {
        if (this.components.aiChatIntegration) {
            this.components.aiChatIntegration.addMessage(
                `🔍 Follow-up analysis recommended: Consider running a detailed ${type} audit for comprehensive findings.`,
                'system'
            );
        }
    }

    generatePerformanceRecommendations(suggestions) {
        if (this.components.aiChatIntegration) {
            const quickWins = suggestions.filter(s => 
                s.toLowerCase().includes('image') || 
                s.toLowerCase().includes('cache') ||
                s.toLowerCase().includes('compress')
            );

            if (quickWins.length > 0) {
                this.components.aiChatIntegration.addMessage(
                    `⚡ Quick performance wins identified: ${quickWins.slice(0, 2).join(', ')}`,
                    'system'
                );
            }
        }
    }

    async runIntegrationTests() {
        console.log('🧪 Running integration tests...');

        const tests = [
            () => this.testScreenshotCapture(),
            () => this.testAIIntegration(),
            () => this.testElementInspection(),
            () => this.testVisionAnalysis(),
            () => this.testProtocolBridge()
        ];

        for (const test of tests) {
            try {
                await test();
            } catch (error) {
                console.warn('⚠️ Integration test failed:', error.message);
                this.integrationStatus.warnings.push(`Test failure: ${error.message}`);
            }
        }

        console.log('✅ Integration tests completed');
    }

    async testScreenshotCapture() {
        if (!this.components.screenshotSystem) {
            throw new Error('Screenshot system not available');
        }

        const capabilities = this.components.screenshotSystem.getCapabilities();
        if (!capabilities.visionAnalysis) {
            throw new Error('Vision analysis capability not enabled');
        }

        console.log('✅ Screenshot capture test passed');
    }

    async testAIIntegration() {
        if (!this.components.aiChatIntegration) {
            throw new Error('AI chat integration not available');
        }

        if (!this.components.aiChatIntegration.isInitialized) {
            throw new Error('AI chat integration not initialized');
        }

        console.log('✅ AI integration test passed');
    }

    async testElementInspection() {
        if (!this.components.elementInspector) {
            console.log('⚠️ Element inspector not available (optional)');
            return;
        }

        console.log('✅ Element inspection test passed');
    }

    async testVisionAnalysis() {
        if (!this.components.claudeVisionHandler) {
            throw new Error('Claude vision handler not available');
        }

        const status = this.components.claudeVisionHandler.getQueueStatus();
        if (!status.isInitialized) {
            throw new Error('Claude vision handler not initialized');
        }

        console.log('✅ Vision analysis test passed');
    }

    async testProtocolBridge() {
        if (!this.components.protocolBridge) {
            throw new Error('Protocol bridge not available');
        }

        // Test protocol bridge initialization status
        if (!this.components.protocolBridge.isInitialized) {
            throw new Error('Protocol bridge not initialized');
        }

        // Test stability agent connection
        if (this.components.stabilityAgent && !this.components.protocolBridge.hasStabilityAgent) {
            throw new Error('Protocol bridge missing stability agent connection');
        }

        // Test enhanced protocol capabilities
        const capabilities = this.components.protocolBridge.getCapabilities?.() || {};
        const requiredCapabilities = [
            'element_selected',
            'screenshot_capture', 
            'ai_analysis_request',
            'ide_message'
        ];

        for (const capability of requiredCapabilities) {
            if (!capabilities[capability]) {
                console.warn(`⚠️ Protocol bridge missing capability: ${capability}`);
            }
        }

        // Test message creation functionality
        if (!this.components.protocolBridge.createMessage) {
            throw new Error('Protocol bridge missing message creation functionality');
        }

        // Test protocol version compatibility
        const protocolVersion = this.components.protocolBridge.getProtocolVersion?.() || '1.0.0';
        if (!protocolVersion.startsWith('1.')) {
            console.warn(`⚠️ Protocol bridge version may not be compatible: ${protocolVersion}`);
        }

        console.log('✅ Protocol bridge test passed');
    }

    setupGlobalFeatures() {
        console.log('🌟 Setting up global features...');

        // Enhanced keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Add integration status indicator to UI
        this.addStatusIndicator();

        // Set up global error handling for components
        this.setupErrorHandling();

        // Initialize welcome tutorial
        this.initializeWelcomeTutorial();

        console.log('✅ Global features set up');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global shortcut for quick AI analysis (Ctrl/Cmd + Shift + I)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.triggerQuickAnalysis();
            }

            // Toggle real-time analysis (Ctrl/Cmd + Shift + R)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.toggleRealTimeAnalysis();
            }

            // Show integration status (Ctrl/Cmd + Shift + ?)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
                e.preventDefault();
                this.showIntegrationStatus();
            }
        });
    }

    async triggerQuickAnalysis() {
        if (this.components.aiChatIntegration) {
            await this.components.aiChatIntegration.quickScreenshotAnalysis();
        }
    }

    toggleRealTimeAnalysis() {
        if (this.components.aiChatIntegration) {
            if (this.components.aiChatIntegration.realTimeAnalysisEnabled) {
                this.components.aiChatIntegration.disableRealTimeAnalysis();
            } else {
                this.components.aiChatIntegration.enableRealTimeAnalysis();
            }
        }
    }

    showIntegrationStatus() {
        const status = {
            initialized: this.integrationStatus.initialized,
            components: Object.keys(this.components).filter(key => this.components[key]),
            errors: this.integrationStatus.errors.length,
            warnings: this.integrationStatus.warnings.length
        };

        console.table(status);
        
        if (this.components.aiChatIntegration) {
            this.components.aiChatIntegration.addMessage(
                `🔧 Integration Status: ${status.components.length} components active, ${status.errors} errors, ${status.warnings} warnings`,
                'system'
            );
        }
    }

    addStatusIndicator() {
        // Add a small status indicator to show integration health
        const indicator = document.createElement('div');
        indicator.id = 'integration-status-indicator';
        indicator.innerHTML = '🟢';
        indicator.title = 'AI Analysis Integration: Active';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            font-size: 12px;
            z-index: 9999;
            background: rgba(255, 255, 255, 0.9);
            padding: 4px;
            border-radius: 50%;
            cursor: pointer;
        `;

        indicator.addEventListener('click', () => this.showIntegrationStatus());
        document.body.appendChild(indicator);

        // Update indicator based on status
        if (this.integrationStatus.errors.length > 0) {
            indicator.innerHTML = '🔴';
            indicator.title = 'AI Analysis Integration: Errors detected';
        } else if (this.integrationStatus.warnings.length > 0) {
            indicator.innerHTML = '🟡';
            indicator.title = 'AI Analysis Integration: Warnings present';
        }
    }

    setupErrorHandling() {
        // Global error handler for component integration issues
        window.addEventListener('error', (event) => {
            if (event.error && event.error.stack && 
                (event.error.stack.includes('ai-') || 
                 event.error.stack.includes('screenshot-') ||
                 event.error.stack.includes('claude-'))) {
                
                console.error('🚨 Component integration error:', event.error);
                this.integrationStatus.errors.push(event.error.message);
                
                // Update status indicator
                const indicator = document.getElementById('integration-status-indicator');
                if (indicator) {
                    indicator.innerHTML = '🔴';
                    indicator.title = 'AI Analysis Integration: Error detected';
                }
            }
        });
    }

    initializeWelcomeTutorial() {
        // Show welcome tutorial if this is the first time
        const hasSeenTutorial = localStorage.getItem('ai-analysis-tutorial-seen');
        
        if (!hasSeenTutorial && this.components.aiChatIntegration) {
            setTimeout(() => {
                this.components.aiChatIntegration.addMessage(
                    `🎉 Welcome to AI-Powered Analysis! 
                    
New features available:
• 📸 Take screenshots and get instant AI feedback
• ♿ Automated accessibility analysis  
• ⚡ Performance optimization suggestions
• 🎨 Design pattern recognition
• 📱 Mobile responsiveness checking

Try these shortcuts:
• Ctrl+Shift+C - Capture and analyze screenshot
• Ctrl+Shift+I - Quick AI analysis
• Ctrl+Shift+R - Toggle real-time analysis

Click the tools in the AI chat panel to get started!`,
                    'system'
                );
                
                localStorage.setItem('ai-analysis-tutorial-seen', 'true');
            }, 3000);
        }
    }

    showInitializationNotification() {
        // Show a subtle notification that the system is ready
        const notification = document.createElement('div');
        notification.textContent = '🤖 AI Analysis System Ready';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showInitializationError() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <strong>⚠️ AI Analysis System Error</strong><br>
            Some features may not work properly.<br>
            <small>Check console for details</small>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Keep error notification longer
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    getIntegrationStatus() {
        return {
            ...this.integrationStatus,
            components: Object.keys(this.components).filter(key => this.components[key])
        };
    }

    restartIntegration() {
        this.integrationStatus.initialized = false;
        this.integrationStatus.errors = [];
        this.integrationStatus.warnings = [];
        this.initializationAttempts = 0;
        this.initialize();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.integrationInitializer = new IntegrationInitializer();
    
    // Start initialization with a small delay to ensure all scripts are loaded
    setTimeout(() => {
        window.integrationInitializer.initialize();
    }, 1000);
});

console.log('🔧 Integration Initializer loaded and ready');