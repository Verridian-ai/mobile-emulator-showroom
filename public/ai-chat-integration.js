/**
 * AI Chat Integration for Screenshot and Element Analysis
 * Enhanced with Claude Code CLI connectivity and real-time communication
 */

class AIChatIntegration {
    constructor() {
        this.isInitialized = false;
        this.activeConnections = new Map();
        this.messageQueue = [];
        this.chatHistory = [];
        this.supportedPlatforms = {
            'claude-cli': 'Claude Code CLI',
            'cursor': 'Cursor IDE', 
            'windsurf': 'Windsurf AI',
            'codellm': 'Code LLM by Aabicus AI'
        };
        this.websocket = null;
        this.screenshotSystem = null;
        this.elementInspector = null;
        
        // Claude CLI integration
        this.cliBridge = null;
        this.cliSessionActive = false;
        this.currentStreamDiv = null;
        this.conversationId = null;
        
        // Performance and logging
        this.performanceTracker = {
            requestTimes: [],
            errorCount: 0,
            successCount: 0,
            cliResponseTimes: []
        };
        
        // CLI-specific state
        this.cliStatus = {
            connected: false,
            sessionId: null,
            workingDirectory: null,
            projectFiles: new Set(),
            currentTask: null
        };
        
        this.initializeIntegration();
    }

    async initializeIntegration() {
        this.setupWebSocket();
        this.createChatUI();
        this.bindEventListeners();
        this.detectAIPlatforms();
        this.setupKeyboardShortcuts();
        await this.initializeCLIBridge();
        
        // Try to connect to screenshot system if available
        this.connectToScreenshotSystem();
        
        // Mark as initialized
        this.isInitialized = true;
        console.log('✅ AI Chat Integration fully initialized');
    }
    
    connectToScreenshotSystem() {
        if (!this.screenshotSystem && window.screenshotCaptureSystem) {
            this.screenshotSystem = window.screenshotCaptureSystem;
            console.log('✅ Connected to screenshot capture system');
        }
        
        if (!this.elementInspector && window.elementInspector) {
            this.elementInspector = window.elementInspector;
            console.log('✅ Connected to element inspector');
        }
    }
    
    /**
     * Initialize Claude CLI Bridge integration
     */
    async initializeCLIBridge() {
        try {
            // Wait for CLI bridge to load
            if (!window.claudeCLIBridge) {
                console.warn('Claude CLI Bridge not loaded, waiting...');
                setTimeout(() => this.initializeCLIBridge(), 1000);
                return;
            }
            
            this.cliBridge = window.claudeCLIBridge;
            
            // Set up CLI event listeners
            this.setupCLIEventListeners();
            
            // Check CLI connection status
            const status = this.cliBridge.getConnectionStatus();
            if (status.connected) {
                this.handleCLIConnected(status);
            } else {
                this.addMessage('🔧 Connecting to Claude Code CLI...', 'system');
                this.updatePlatformIndicator('claude-cli', 'connecting');
            }
            
        } catch (error) {
            console.error('Failed to initialize Claude CLI Bridge:', error);
            this.addMessage('❌ Failed to connect to Claude Code CLI. Please ensure Claude Code CLI is running.', 'system');
        }
    }
    
    /**
     * Set up CLI event listeners
     */
    setupCLIEventListeners() {
        // CLI connection events
        this.cliBridge.on('connected', (event) => {
            this.handleCLIConnected(event.detail);
        });
        
        this.cliBridge.on('disconnected', (event) => {
            this.handleCLIDisconnected(event.detail);
        });
        
        this.cliBridge.on('connection_error', (event) => {
            this.handleCLIConnectionError(event.detail);
        });
        
        // CLI response events
        this.cliBridge.on('cli_response', (event) => {
            this.handleCLIResponse(event.detail);
        });
        
        this.cliBridge.on('cli_error', (event) => {
            this.handleCLIError(event.detail);
        });
        
        // Project context events
        this.cliBridge.on('project_context_update', (event) => {
            this.handleProjectContextUpdate(event.detail);
        });
        
        this.cliBridge.on('task_status_update', (event) => {
            this.handleTaskStatusUpdate(event.detail);
        });
        
        this.cliBridge.on('file_operation_result', (event) => {
            this.handleFileOperationResult(event.detail);
        });
        
        this.cliBridge.on('conversation_update', (event) => {
            this.handleConversationUpdate(event.detail);
        });
    }
    
    /**
     * Handle CLI connected event
     */
    handleCLIConnected(data) {
        this.cliStatus.connected = true;
        this.cliStatus.sessionId = data.sessionId;
        this.cliSessionActive = true;
        
        this.addMessage('✅ Claude Code CLI connected and ready!', 'system');
        this.updatePlatformIndicator('claude-cli', 'connected');
        
        // Request project context
        this.requestProjectContext();
    }
    
    /**
     * Handle CLI disconnected event
     */
    handleCLIDisconnected(data) {
        this.cliStatus.connected = false;
        this.cliSessionActive = false;
        
        this.addMessage(`🔌 Claude Code CLI disconnected (uptime: ${Math.round(data.uptime / 1000)}s)`, 'system');
        this.updatePlatformIndicator('claude-cli', 'disconnected');
    }
    
    /**
     * Handle CLI connection error
     */
    handleCLIConnectionError(data) {
        this.addMessage(`❌ CLI Connection Error: ${data.error}`, 'system');
        this.updatePlatformIndicator('claude-cli', 'error');
    }
    
    /**
     * Handle CLI response
     */
    handleCLIResponse(data) {
        if (data.content) {
            // Handle streaming response if available
            if (data.streaming) {
                this.handleStreamingCLIResponse(data);
            } else {
                this.addMessage(data.content, 'ai');
            }
            
            // Update performance stats
            if (data.metadata && data.metadata.processingTime) {
                this.performanceTracker.cliResponseTimes.push(data.metadata.processingTime);
                this.performanceTracker.successCount++;
            }
        }
    }
    
    /**
     * Handle streaming CLI response
     */
    handleStreamingCLIResponse(data) {
        if (!this.currentStreamDiv) {
            this.currentStreamDiv = this.addStreamingMessage('🤖 Claude is thinking...');
        }
        
        if (data.delta) {
            // Update streaming content
            const currentContent = this.currentStreamDiv.querySelector('.streaming-content').textContent;
            this.updateStreamingMessage(this.currentStreamDiv, currentContent + data.delta);
        }
        
        if (data.finished) {
            // Finalize streaming response
            const finalContent = this.currentStreamDiv.querySelector('.streaming-content').textContent;
            this.finalizeStreamingMessage(this.currentStreamDiv, finalContent);
            this.currentStreamDiv = null;
        }
    }
    
    /**
     * Handle CLI error
     */
    handleCLIError(data) {
        this.addMessage(`❌ CLI Error: ${data.error}`, 'system');
        this.performanceTracker.errorCount++;
    }
    
    /**
     * Handle project context update
     */
    handleProjectContextUpdate(data) {
        if (data.context) {
            this.cliStatus.workingDirectory = data.context.workingDirectory;
            this.cliStatus.projectFiles = new Set(data.context.projectFiles || []);
            this.updateSessionInfoDisplay();
        }
    }
    
    /**
     * Handle task status update
     */
    handleTaskStatusUpdate(data) {
        if (data.task) {
            this.cliStatus.currentTask = data.task;
            this.updateSessionInfoDisplay();
            
            // Show task status in chat
            const statusEmoji = {
                'pending': '📝',
                'in_progress': '🔄',
                'completed': '✅',
                'error': '❌'
            };
            
            const emoji = statusEmoji[data.task.status] || '📝';
            this.addMessage(`${emoji} Task: ${data.task.title} - ${data.task.status}`, 'system');
        }
    }
    
    /**
     * Handle file operation result
     */
    handleFileOperationResult(data) {
        const operationEmoji = {
            'read': '📄',
            'write': '✏️',
            'list': '📊',
            'search': '🔍'
        };
        
        const emoji = operationEmoji[data.operation] || '💾';
        
        if (data.success) {
            this.addMessage(`${emoji} File operation '${data.operation}' completed successfully`, 'system');
            
            // Update project files if listing
            if (data.operation === 'list' && data.result) {
                this.cliStatus.projectFiles = new Set(data.result);
                this.updateSessionInfoDisplay();
            }
        } else {
            this.addMessage(`${emoji} File operation '${data.operation}' failed: ${data.error}`, 'system');
        }
    }
    
    /**
     * Handle conversation update
     */
    handleConversationUpdate(data) {
        if (data.messages) {
            // Update conversation history display
            this.conversationId = data.conversationId;
            console.log('Conversation updated:', data.messages.length, 'messages');
        }
    }

    setupWebSocket() {
        // Use environment variable or configuration for WebSocket URL
        const wsToken = window.WEBSOCKET_TOKEN || 'secure-token';
        const brokerUrl = `ws://localhost:${window.BROKER_PORT || 7071}?token=${wsToken}`;
        
        try {
            this.websocket = new WebSocket(brokerUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ AI Chat Integration connected to broker');
                this.isInitialized = true;
                this.sendMessage({
                    type: 'ai_chat_ready',
                    timestamp: Date.now(),
                    platforms: Object.keys(this.supportedPlatforms),
                    capabilities: {
                        screenshotAnalysis: true,
                        elementInspection: true,
                        codeGeneration: true,
                        designFeedback: true,
                        accessibility: true,
                        performance: true,
                        visionAnalysis: true,
                        realTimeInsights: true,
                        designPatternRecognition: true,
                        mobileResponsivenessAnalysis: true,
                        automatedSuggestions: true,
                        fileOperations: true,
                        projectContext: true,
                        multiTurnConversations: true,
                        cliIntegration: true
                    }
                });
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.websocket.onclose = () => {
                console.warn('🔄 AI Chat disconnected, attempting reconnect...');
                this.isInitialized = false;
                setTimeout(() => this.setupWebSocket(), 3000);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ AI Chat WebSocket error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to setup AI Chat WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'ai_platform_connected':
                this.handlePlatformConnection(data);
                break;
            case 'ai_response':
                this.handleAIResponse(data);
                break;
            case 'screenshot_analysis_request':
                this.handleScreenshotAnalysisRequest(data);
                break;
            case 'element_analysis_request':
                this.handleElementAnalysisRequest(data);
                break;
            case 'code_generation_request':
                this.handleCodeGenerationRequest(data);
                break;
            case 'design_feedback_request':
                this.handleDesignFeedbackRequest(data);
                break;
            case 'vision_analysis_complete':
                this.handleVisionAnalysisComplete(data);
                break;
            case 'real_time_insight':
                this.handleRealTimeInsight(data);
                break;
            case 'automated_suggestion':
                this.handleAutomatedSuggestion(data);
                break;
        }
    }

    sendMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
        }
    }

    createChatUI() {
        // Create floating chat panel
        const chatPanel = document.createElement('div');
        chatPanel.id = 'ai-chat-panel';
        chatPanel.className = 'ai-chat-panel collapsed';
        chatPanel.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <span class="chat-icon">🤖</span>
                    <span>AI Assistant</span>
                    <span class="platform-indicator" id="platform-indicator">Claude</span>
                </div>
                <div class="chat-controls">
                    <button id="minimize-chat" class="chat-btn" title="Minimize">−</button>
                    <button id="expand-chat" class="chat-btn" title="Expand">□</button>
                    <button id="close-chat" class="chat-btn" title="Close">×</button>
                </div>
            </div>
            
            <div class="chat-body" id="chat-body">
                <div class="chat-messages" id="chat-messages">
                    <div class="welcome-message">
                        <p>👋 AI Assistant ready! I can help you with:</p>
                        <ul>
                            <li>📸 Analyzing screenshots and UI elements</li>
                            <li>🎨 Providing design feedback and suggestions</li>
                            <li>♿ Checking accessibility compliance</li>
                            <li>⚡ Performance optimization tips</li>
                            <li>💻 Generating code improvements</li>
                        </ul>
                        <p>Shortcuts: <kbd>Ctrl+Shift+A</kbd> toggle, <kbd>Ctrl+Shift+Q</kbd> screenshot, <kbd>Ctrl+Shift+C</kbd> CLI commands, <kbd>Ctrl+Shift+F</kbd> files!</p>
                    </div>
                </div>
                
                <div class="screenshot-preview" id="screenshot-preview" style="display: none;">
                    <img id="preview-image" alt="Screenshot preview" />
                    <div class="preview-controls">
                        <button id="send-screenshot" class="btn-primary">Send to AI</button>
                        <button id="cancel-screenshot" class="btn-secondary">Cancel</button>
                    </div>
                </div>
                
                <div class="cli-session-info" id="session-info" style="display: none;"></div>
                
                <div class="chat-input-container">
                    <div class="input-toolbar">
                        <button id="screenshot-btn" class="tool-btn" title="Take Screenshot">📸</button>
                        <button id="element-select-btn" class="tool-btn" title="Select Element">🔍</button>
                        <button id="full-analysis-btn" class="tool-btn" title="Full Page Analysis">📊</button>
                        <button id="accessibility-check-btn" class="tool-btn" title="Accessibility Check">♿</button>
                        <button id="performance-analysis-btn" class="tool-btn" title="Performance Analysis">⚡</button>
                        <button id="design-pattern-btn" class="tool-btn" title="Design Patterns">🎨</button>
                        <button id="mobile-analysis-btn" class="tool-btn" title="Mobile Analysis">📱</button>
                        <button id="file-operations-btn" class="tool-btn" title="File Operations">📁</button>
                        <button id="cli-command-btn" class="tool-btn" title="CLI Commands">⌨️</button>
                    </div>
                    <div class="input-area">
                        <textarea 
                            id="chat-input" 
                            placeholder="Ask me anything about the UI, or use the tools above..."
                            rows="2"
                        ></textarea>
                        <button id="send-message" class="send-btn">
                            <span>Send</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="chat-toggle" id="chat-toggle">
                <span>AI Chat</span>
                <span class="toggle-icon">💬</span>
            </div>
        `;

        // Add styles
        this.addChatStyles();
        
        document.body.appendChild(chatPanel);
        this.bindChatEvents();
    }

    addChatStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-chat-panel {
                position: fixed;
                right: 20px;
                bottom: 20px;
                width: 400px;
                max-width: 90vw;
                max-height: 600px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 10000;
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .ai-chat-panel.collapsed {
                height: 60px;
            }

            .ai-chat-panel.expanded {
                height: 600px;
                width: 500px;
            }

            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(59, 130, 246, 0.1);
                border-bottom: 1px solid rgba(59, 130, 246, 0.2);
                cursor: pointer;
            }

            .chat-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: #1e40af;
            }

            .platform-indicator {
                background: #3b82f6;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
            }

            .chat-controls {
                display: flex;
                gap: 4px;
            }

            .chat-btn {
                width: 28px;
                height: 28px;
                border: none;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.2s;
            }

            .chat-btn:hover {
                background: rgba(0, 0, 0, 0.2);
            }

            .chat-body {
                display: flex;
                flex-direction: column;
                height: calc(100% - 60px);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .ai-chat-panel:not(.collapsed) .chat-body {
                opacity: 1;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                max-height: 400px;
            }

            .welcome-message {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
            }

            .welcome-message ul {
                margin: 8px 0;
                padding-left: 20px;
            }

            .welcome-message li {
                margin: 4px 0;
            }

            .chat-message {
                margin: 8px 0;
                padding: 12px;
                border-radius: 8px;
                max-width: 85%;
            }

            .user-message {
                background: #3b82f6;
                color: white;
                margin-left: auto;
            }

            .ai-message {
                background: rgba(107, 114, 128, 0.1);
                border: 1px solid rgba(107, 114, 128, 0.2);
            }

            .screenshot-message {
                border: 2px solid #3b82f6;
                background: rgba(59, 130, 246, 0.05);
            }

            .screenshot-preview {
                padding: 16px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
                text-align: center;
            }

            .screenshot-preview img {
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .preview-controls {
                margin-top: 12px;
                display: flex;
                gap: 8px;
                justify-content: center;
            }

            .btn-primary, .btn-secondary {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
            }

            .btn-primary {
                background: #3b82f6;
                color: white;
            }

            .btn-primary:hover {
                background: #2563eb;
            }

            .btn-secondary {
                background: rgba(0, 0, 0, 0.1);
                color: #374151;
            }

            .btn-secondary:hover {
                background: rgba(0, 0, 0, 0.2);
            }

            .chat-input-container {
                border-top: 1px solid rgba(0, 0, 0, 0.1);
                padding: 12px;
            }

            .input-toolbar {
                display: flex;
                gap: 4px;
                margin-bottom: 8px;
            }

            .tool-btn {
                padding: 6px 10px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                background: rgba(255, 255, 255, 0.8);
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .tool-btn:hover {
                background: rgba(59, 130, 246, 0.1);
                border-color: #3b82f6;
            }

            .tool-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .input-area {
                display: flex;
                gap: 8px;
                align-items: flex-end;
            }

            #chat-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                resize: none;
                font-family: inherit;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }

            #chat-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .send-btn {
                padding: 8px 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: 500;
                transition: background 0.2s;
            }

            .send-btn:hover {
                background: #2563eb;
            }

            .send-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .chat-toggle {
                position: absolute;
                bottom: -45px;
                right: 0;
                background: #3b82f6;
                color: white;
                padding: 8px 16px;
                border-radius: 8px 8px 0 0;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .ai-chat-panel:not(.collapsed) .chat-toggle {
                display: none;
            }

            .chat-toggle:hover {
                background: #2563eb;
                transform: translateY(-2px);
            }

            kbd {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-family: monospace;
            }
            
            /* Streaming message styles */
            .streaming .streaming-content {
                position: relative;
            }
            
            .streaming-cursor {
                animation: blink 1s infinite;
                color: #3b82f6;
                font-weight: bold;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            /* CLI session info styles */
            .cli-session-info {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                border-radius: 6px;
                padding: 8px 12px;
                margin: 8px 12px;
                font-size: 11px;
                line-height: 1.4;
            }
            
            .session-details {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .session-details span {
                background: rgba(16, 185, 129, 0.15);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
            }
            
            .session-id {
                color: #059669;
            }
            
            .working-dir {
                color: #0d9488;
            }
            
            .file-count {
                color: #0891b2;
            }
            
            .current-task {
                color: #7c3aed;
                font-weight: 500;
            }
            
            /* File operation buttons */
            .file-op-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                margin: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            }
            
            .file-op-btn:hover {
                background: #2563eb;
            }
            
            /* CLI command mode indicator */
            .cli-command-mode .chat-input-container {
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
            }
            
            .cli-command-mode #chat-input {
                background: rgba(99, 102, 241, 0.05);
                border-color: #6366f1;
            }
            
            /* Error message styles */
            .error-message {
                background: rgba(239, 68, 68, 0.1) !important;
                border: 1px solid rgba(239, 68, 68, 0.3) !important;
                color: #dc2626;
            }
            
            /* Performance indicator */
            .performance-stats {
                font-size: 11px;
                color: #6b7280;
                margin-top: 4px;
                opacity: 0.8;
            }

            @media (max-width: 480px) {
                .ai-chat-panel {
                    right: 10px;
                    bottom: 10px;
                    width: calc(100vw - 20px);
                }
                
                .ai-chat-panel.expanded {
                    width: calc(100vw - 20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindChatEvents() {
        const chatPanel = document.getElementById('ai-chat-panel');
        const chatToggle = document.getElementById('chat-toggle');
        const chatHeader = document.querySelector('.chat-header');
        const minimizeBtn = document.getElementById('minimize-chat');
        const expandBtn = document.getElementById('expand-chat');
        const closeBtn = document.getElementById('close-chat');
        const sendBtn = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');

        // Toggle chat visibility
        chatToggle.addEventListener('click', () => {
            chatPanel.classList.remove('collapsed');
        });

        chatHeader.addEventListener('click', () => {
            chatPanel.classList.toggle('collapsed');
        });

        // Control buttons
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatPanel.classList.add('collapsed');
        });

        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatPanel.classList.toggle('expanded');
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatPanel.style.display = 'none';
        });

        // Send message
        sendBtn.addEventListener('click', () => {
            this.sendChatMessage();
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.sendChatMessage();
            }
        });

        // Tool buttons
        document.getElementById('screenshot-btn').addEventListener('click', () => {
            this.captureScreenshotForChat();
        });

        document.getElementById('element-select-btn').addEventListener('click', () => {
            this.startElementSelection();
        });

        document.getElementById('full-analysis-btn').addEventListener('click', () => {
            this.performFullAnalysis();
        });

        document.getElementById('accessibility-check-btn').addEventListener('click', () => {
            this.checkAccessibility();
        });

        document.getElementById('performance-analysis-btn').addEventListener('click', () => {
            this.analyzePerformance();
        });

        document.getElementById('design-pattern-btn').addEventListener('click', () => {
            this.analyzeDesignPatterns();
        });

        document.getElementById('mobile-analysis-btn').addEventListener('click', () => {
            this.analyzeMobileResponsiveness();
        });

        document.getElementById('file-operations-btn').addEventListener('click', () => {
            this.showFileOperationsMenu();
        });

        document.getElementById('cli-command-btn').addEventListener('click', () => {
            this.showCLICommandPrompt();
        });

        // Screenshot preview controls
        document.getElementById('send-screenshot').addEventListener('click', () => {
            this.sendScreenshotToAI();
        });

        document.getElementById('cancel-screenshot').addEventListener('click', () => {
            this.cancelScreenshot();
        });
    }

    bindEventListeners() {
        // Listen for screenshot system events
        document.addEventListener('screenshotCaptured', (event) => {
            this.handleScreenshotCaptured(event.detail);
        });

        // Listen for element inspector events
        document.addEventListener('elementInspected', (event) => {
            this.handleElementInspected(event.detail);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + A for AI chat toggle
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggleChat();
            }

            // Ctrl/Cmd + Shift + Q for quick screenshot analysis
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Q') {
                e.preventDefault();
                this.quickScreenshotAnalysis();
            }
            
            // Ctrl/Cmd + Shift + C for CLI command mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.showCLICommandPrompt();
            }
            
            // Ctrl/Cmd + Shift + F for file operations
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.showFileOperationsMenu();
            }
            
            // Ctrl/Cmd + Shift + P for project context refresh
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.requestProjectContext();
            }
            
            // Escape to cancel CLI command mode
            if (e.key === 'Escape' && this.nextMessageIsCLICommand) {
                e.preventDefault();
                this.nextMessageIsCLICommand = false;
                const chatInput = document.getElementById('chat-input');
                chatInput.placeholder = 'Ask me anything about the UI, or use the tools above...';
                this.addMessage('❌ CLI command mode cancelled', 'system');
            }
        });
    }

    detectAIPlatforms() {
        // Detect which AI platforms are available
        const platforms = [];

        // Check for Claude Code
        if (window.claude || document.querySelector('[data-claude]')) {
            platforms.push('claude');
        }

        // Check for Cursor IDE
        if (window.cursor || document.querySelector('[data-cursor]')) {
            platforms.push('cursor');
        }

        // Check for Windsurf
        if (window.windsurf || document.querySelector('[data-windsurf]')) {
            platforms.push('windsurf');
        }

        // Check for Code LLM
        if (window.codellm || document.querySelector('[data-codellm]')) {
            platforms.push('codellm');
        }

        console.log('🔍 Detected AI platforms:', platforms);
        this.updatePlatformIndicator(platforms[0] || 'claude');
    }

    updatePlatformIndicator(platform) {
        const indicator = document.getElementById('platform-indicator');
        if (indicator) {
            indicator.textContent = this.supportedPlatforms[platform] || 'AI Assistant';
        }
    }

    async captureScreenshotForChat() {
        if (!this.screenshotSystem) {
            console.warn('Screenshot system not available, attempting to use global reference');
            // Try to get the screenshot system from the global scope
            if (window.screenshotCaptureSystem) {
                this.screenshotSystem = window.screenshotCaptureSystem;
            } else {
                this.addMessage('❌ Screenshot system not available. Please ensure all components are loaded.', 'system');
                return;
            }
        }

        try {
            this.addMessage('📸 Taking screenshot...', 'system');
            const screenshot = await this.screenshotSystem.captureFullPage();
            this.showScreenshotPreview(screenshot);
        } catch (error) {
            console.error('Failed to capture screenshot:', error);
            this.addMessage('❌ Failed to capture screenshot. Error: ' + error.message, 'system');
        }
    }

    showScreenshotPreview(screenshot) {
        const preview = document.getElementById('screenshot-preview');
        const previewImage = document.getElementById('preview-image');
        
        previewImage.src = screenshot.data;
        preview.style.display = 'block';
        
        this.pendingScreenshot = screenshot;
    }

    async sendScreenshotToAI() {
        if (!this.pendingScreenshot) return;

        const chatInput = document.getElementById('chat-input');
        const customPrompt = chatInput.value.trim();
        
        const defaultPrompt = `📸 Please analyze this screenshot of my web application. 
        
Look for:
- UI/UX issues and improvements
- Accessibility concerns
- Design consistency
- Performance indicators
- Mobile responsiveness
- Overall user experience

${customPrompt ? `Additional context: ${customPrompt}` : ''}`;

        this.addMessage('📸 Screenshot sent for analysis...', 'user', this.pendingScreenshot.data);
        
        // Disable screenshot controls during processing
        const sendBtn = document.getElementById('send-screenshot');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Analyzing...';
        
        try {
            // Send to Claude API with screenshot
            await this.sendToClaudeAPI(defaultPrompt, {
                screenshot: this.pendingScreenshot.data,
                pageInfo: {
                    url: window.location.href,
                    title: document.title
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                analysisType: 'screenshot',
                maxTokens: 4096
            });
            
        } catch (error) {
            console.error('Failed to analyze screenshot:', error);
            this.addMessage('❌ Failed to analyze screenshot. Please try again.', 'system');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send to AI';
        }
        
        // Also send to WebSocket broker
        const analysisRequest = {
            type: 'screenshot_analysis_request',
            screenshot: this.pendingScreenshot.data,
            metadata: this.pendingScreenshot.metadata,
            prompt: defaultPrompt,
            timestamp: Date.now()
        };

        this.sendMessage(analysisRequest);
        this.hideScreenshotPreview();
        chatInput.value = '';
    }

    cancelScreenshot() {
        this.hideScreenshotPreview();
        this.pendingScreenshot = null;
    }

    hideScreenshotPreview() {
        document.getElementById('screenshot-preview').style.display = 'none';
    }

    async startElementSelection() {
        if (!this.elementInspector) {
            console.warn('Element inspector not available, attempting to use global reference');
            // Try to get the element inspector from the global scope
            if (window.elementInspector) {
                this.elementInspector = window.elementInspector;
            } else {
                this.addMessage('❌ Element inspector not available. Please ensure all components are loaded.', 'system');
                return;
            }
        }

        try {
            this.elementInspector.activateCaptureMode();
            this.addMessage('🔍 Click on any element to analyze it with AI', 'system');
        } catch (error) {
            console.error('Failed to start element selection:', error);
            this.addMessage('❌ Failed to start element selection. Error: ' + error.message, 'system');
        }
    }

    async performFullAnalysis() {
        this.addMessage('📊 Starting comprehensive page analysis...', 'system');
        
        const analysisData = {
            url: window.location.href,
            title: document.title,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            elements: this.analyzePageElements(),
            performance: await this.getPerformanceMetrics(),
            accessibility: await this.getAccessibilityInfo()
        };

        const request = {
            type: 'full_page_analysis_request',
            data: analysisData,
            timestamp: Date.now()
        };

        this.sendMessage(request);
    }

    async checkAccessibility() {
        this.addMessage('♿ Checking accessibility compliance...', 'system');
        
        const accessibilityData = await this.getAccessibilityInfo();
        
        try {
            // Send accessibility analysis to Claude
            const prompt = `Please analyze the accessibility of this web page:\n\n${JSON.stringify(accessibilityData, null, 2)}\n\nProvide specific recommendations for improving accessibility compliance, focusing on WCAG 2.1 guidelines.`;
            
            await this.sendToClaudeAPI(prompt, {
                pageInfo: {
                    url: window.location.href,
                    title: document.title
                },
                analysisType: 'accessibility',
                maxTokens: 3072
            });
            
        } catch (error) {
            console.error('Failed accessibility analysis:', error);
            this.addMessage('❌ Failed to analyze accessibility. Please try again.', 'system');
        }
        
        // Also send to WebSocket broker
        const request = {
            type: 'accessibility_analysis_request',
            data: accessibilityData,
            timestamp: Date.now()
        };

        this.sendMessage(request);
    }

    analyzePageElements() {
        const elements = [];
        const importantSelectors = [
            'h1, h2, h3, h4, h5, h6',
            'button',
            'a[href]',
            'input, textarea, select',
            '[role="button"]',
            '.btn, .button',
            'nav, .nav, .navigation',
            'form'
        ];

        importantSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                elements.push({
                    tagName: el.tagName.toLowerCase(),
                    text: el.textContent?.slice(0, 100),
                    attributes: this.getElementAttributes(el),
                    accessibility: this.getElementAccessibility(el)
                });
            });
        });

        return elements.slice(0, 50); // Limit to avoid overwhelming
    }

    getElementAttributes(element) {
        const attrs = {};
        ['id', 'class', 'type', 'role', 'aria-label', 'aria-describedby', 'href'].forEach(attr => {
            if (element.hasAttribute(attr)) {
                attrs[attr] = element.getAttribute(attr);
            }
        });
        return attrs;
    }

    getElementAccessibility(element) {
        return {
            role: element.getAttribute('role'),
            ariaLabel: element.getAttribute('aria-label'),
            tabIndex: element.tabIndex,
            hasAltText: element.tagName === 'IMG' ? !!element.alt : null
        };
    }

    async getPerformanceMetrics() {
        if (!window.performance) return null;

        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        return {
            loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
            domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
            resourceCount: performance.getEntriesByType('resource').length
        };
    }

    async getAccessibilityInfo() {
        const info = {
            hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
            hasAltTexts: [...document.querySelectorAll('img')].every(img => img.alt),
            hasLabels: [...document.querySelectorAll('input, textarea, select')].every(input => 
                input.labels?.length > 0 || input.getAttribute('aria-label')
            ),
            hasLandmarks: document.querySelectorAll('nav, main, aside, header, footer').length > 0,
            colorContrast: this.checkBasicColorContrast(),
            keyboardAccessible: this.checkKeyboardAccessibility()
        };

        return info;
    }

    checkBasicColorContrast() {
        // Basic contrast check - in production you'd use more sophisticated tools
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        let lowContrastCount = 0;

        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = style.backgroundColor;
            
            // Simplified contrast check
            if (color === bgColor || color === 'rgba(0, 0, 0, 0)') {
                lowContrastCount++;
            }
        });

        return {
            totalElements: textElements.length,
            lowContrastElements: lowContrastCount,
            ratio: lowContrastCount / textElements.length
        };
    }

    checkKeyboardAccessibility() {
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
        let accessibleCount = 0;

        interactiveElements.forEach(el => {
            if (el.tabIndex >= 0 && !el.disabled) {
                accessibleCount++;
            }
        });

        return {
            totalInteractive: interactiveElements.length,
            keyboardAccessible: accessibleCount,
            ratio: accessibleCount / interactiveElements.length
        };
    }

    async sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        chatInput.value = '';
        
        // Reset placeholder if it was changed
        chatInput.placeholder = 'Ask me anything about the UI, or use the tools above...';
        
        // Disable send button during processing
        const sendBtn = document.getElementById('send-message');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        
        try {
            // Check if this is a CLI command
            if (this.nextMessageIsCLICommand) {
                this.nextMessageIsCLICommand = false;
                await this.executeCLICommand(message);
            } else if (this.cliBridge && this.cliSessionActive) {
                // Send to Claude CLI
                const context = {
                    pageInfo: {
                        url: window.location.href,
                        title: document.title
                    },
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    analysisType: 'general',
                    projectContext: this.cliStatus
                };
                
                // If this is part of an ongoing conversation, continue it
                if (this.conversationId) {
                    await this.cliBridge.continueConversation(message);
                } else {
                    const response = await this.cliBridge.sendChatMessage(message, context);
                    if (response.conversationId) {
                        this.conversationId = response.conversationId;
                    }
                }
            } else {
                throw new Error('Claude CLI not available');
            }
            
        } catch (error) {
            console.error('Failed to send message to Claude CLI:', error);
            this.addMessage('❌ Failed to send message to Claude CLI. Please ensure Claude Code CLI is running.', 'system');
        } finally {
            // Re-enable send button
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<span>Send</span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>';
        }
        
        // Also send to WebSocket broker for other integrations
        const request = {
            type: 'chat_message',
            message: message,
            context: {
                url: window.location.href,
                timestamp: Date.now(),
                cliSession: this.cliStatus.sessionId
            }
        };

        this.sendMessage(request);
    }

    addMessage(content, type = 'system', screenshot = null) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${type}-message ${screenshot ? 'screenshot-message' : ''}`;
        
        if (screenshot) {
            // Create elements safely to prevent XSS
            const img = document.createElement('img');
            img.src = screenshot;
            img.alt = 'Screenshot';
            img.style.cssText = 'max-width: 100%; border-radius: 4px; margin-bottom: 8px;';
            
            const textDiv = document.createElement('div');
            textDiv.textContent = content;
            
            messageEl.appendChild(img);
            messageEl.appendChild(textDiv);
        } else {
            messageEl.textContent = content;
        }

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in chat history
        this.chatHistory.push({
            content,
            type,
            screenshot,
            timestamp: Date.now()
        });
    }

    handlePlatformConnection(data) {
        console.log(`✅ AI Platform connected: ${data.platform}`);
        this.activeConnections.set(data.platform, data);
        this.updatePlatformIndicator(data.platform);
    }

    handleAIResponse(data) {
        const { response, type, platform } = data;
        
        let emoji = '🤖';
        switch (type) {
            case 'screenshot_analysis': emoji = '📸'; break;
            case 'accessibility_check': emoji = '♿'; break;
            case 'performance_analysis': emoji = '⚡'; break;
            case 'design_feedback': emoji = '🎨'; break;
        }

        this.addMessage(`${emoji} ${response}`, 'ai');
    }
    
    /**
     * Send message to Claude API with streaming support
     */
    async sendToClaudeAPI(message, context = {}) {
        if (!this.claudeAPI || !this.claudeAPI.isConfigured()) {
            throw new Error('Claude API not configured');
        }
        
        const startTime = performance.now();
        
        try {
            // Check rate limits
            await this.claudeAPI.checkRateLimit();
            
            // Prepare the request
            const requestBody = {
                ...this.claudeAPI.getModelConfig({
                    stream: true,
                    max_tokens: context.maxTokens || 4096
                }),
                messages: this.buildClaudeMessages(message, context)
            };
            
            // Start streaming request
            return await this.streamClaudeResponse(requestBody, startTime);
            
        } catch (error) {
            this.handleAPIError(error, startTime);
            throw error;
        }
    }
    
    /**
     * Build messages array for Claude API
     */
    buildClaudeMessages(userMessage, context = {}) {
        const messages = [];
        
        // Add system message with context
        const systemMessage = this.buildSystemMessage(context);
        if (systemMessage) {
            messages.push({ role: 'assistant', content: systemMessage });
        }
        
        // Add recent chat history for context (last 5 messages)
        const recentHistory = this.chatHistory.slice(-5).filter(msg => 
            msg.type === 'user' || msg.type === 'ai'
        );
        
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });
        
        // Add current user message
        if (context.screenshot) {
            // For screenshot analysis
            messages.push({
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: userMessage
                    },
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: 'image/png',
                            data: context.screenshot.replace(/^data:image\/png;base64,/, '')
                        }
                    }
                ]
            });
        } else {
            messages.push({ role: 'user', content: userMessage });
        }
        
        return messages;
    }
    
    /**
     * Build system message with context
     */
    buildSystemMessage(context) {
        const systemParts = [
            "You are an expert UI/UX analyst and web development assistant.",
            "You analyze screenshots, provide design feedback, check accessibility, and help improve user interfaces."
        ];
        
        if (context.pageInfo) {
            systemParts.push(`\nPage context: URL: ${context.pageInfo.url}, Title: ${context.pageInfo.title}`);
        }
        
        if (context.viewport) {
            systemParts.push(`\nViewport: ${context.viewport.width}x${context.viewport.height}`);
        }
        
        if (context.analysisType) {
            switch (context.analysisType) {
                case 'screenshot':
                    systemParts.push("\nFocus on visual design, layout, and user experience issues.");
                    break;
                case 'accessibility':
                    systemParts.push("\nFocus on accessibility compliance, WCAG guidelines, and inclusive design.");
                    break;
                case 'performance':
                    systemParts.push("\nFocus on performance indicators and optimization opportunities.");
                    break;
            }
        }
        
        systemParts.push("\nProvide specific, actionable feedback. Be concise but thorough.");
        
        return systemParts.join('');
    }
    
    /**
     * Stream Claude API response
     */
    async streamClaudeResponse(requestBody, startTime) {
        const response = await fetch(this.claudeAPI.buildUrl('messages'), {
            method: 'POST',
            headers: this.claudeAPI.getHeaders(),
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }
        
        // Create streaming message container
        this.currentStreamDiv = this.addStreamingMessage('🤖 Claude is thinking...');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';
        
        try {
            while (true) {
                const { value, done } = await reader.read();
                
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const event = JSON.parse(data);
                            
                            if (event.type === 'content_block_delta') {
                                const text = event.delta?.text;
                                if (text) {
                                    fullResponse += text;
                                    this.updateStreamingMessage(this.currentStreamDiv, fullResponse);
                                }
                            }
                            
                        } catch (parseError) {
                            console.warn('Failed to parse streaming data:', parseError);
                        }
                    }
                }
            }
            
            // Mark streaming complete
            this.finalizeStreamingMessage(this.currentStreamDiv, fullResponse);
            
            // Track usage and performance
            const endTime = performance.now();
            const tokens = this.claudeAPI.estimateTokens(fullResponse);
            this.claudeAPI.trackUsage(tokens);
            this.trackPerformance(startTime, endTime, true);
            
            return fullResponse;
            
        } catch (streamError) {
            this.handleStreamingError(streamError);
            throw streamError;
        }
    }
    
    /**
     * Add streaming message to chat
     */
    addStreamingMessage(initialText) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message ai-message streaming';
        
        const contentEl = document.createElement('div');
        contentEl.className = 'streaming-content';
        contentEl.textContent = initialText;
        
        const cursorEl = document.createElement('span');
        cursorEl.className = 'streaming-cursor';
        cursorEl.textContent = '▋';
        contentEl.appendChild(cursorEl);
        
        messageEl.appendChild(contentEl);
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageEl;
    }
    
    /**
     * Update streaming message content
     */
    updateStreamingMessage(messageEl, content) {
        const contentEl = messageEl.querySelector('.streaming-content');
        const cursorEl = messageEl.querySelector('.streaming-cursor');
        
        contentEl.textContent = content;
        contentEl.appendChild(cursorEl);
        
        // Auto-scroll
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * Finalize streaming message
     */
    finalizeStreamingMessage(messageEl, finalContent) {
        const contentEl = messageEl.querySelector('.streaming-content');
        const cursorEl = messageEl.querySelector('.streaming-cursor');
        
        if (cursorEl) {
            cursorEl.remove();
        }
        
        messageEl.classList.remove('streaming');
        contentEl.textContent = finalContent;
        
        // Store in chat history
        this.chatHistory.push({
            content: finalContent,
            type: 'ai',
            timestamp: Date.now()
        });
    }
    
    /**
     * Handle streaming errors
     */
    handleStreamingError(error) {
        if (this.currentStreamDiv) {
            const contentEl = this.currentStreamDiv.querySelector('.streaming-content');
            const cursorEl = this.currentStreamDiv.querySelector('.streaming-cursor');
            
            if (cursorEl) cursorEl.remove();
            
            this.currentStreamDiv.classList.remove('streaming');
            this.currentStreamDiv.classList.add('error-message');
            contentEl.textContent = `❌ Error: ${error.message}`;
        }
    }
    
    /**
     * Track API performance
     */
    trackPerformance(startTime, endTime, success) {
        const duration = endTime - startTime;
        this.performanceTracker.requestTimes.push(duration);
        
        if (success) {
            this.performanceTracker.successCount++;
        } else {
            this.performanceTracker.errorCount++;
        }
        
        // Log performance stats
        console.log(`Claude API ${success ? 'success' : 'error'}: ${Math.round(duration)}ms`);
    }
    
    /**
     * Handle API errors with retry logic
     */
    async handleAPIError(error, startTime) {
        this.trackPerformance(startTime, performance.now(), false);
        
        // Check for rate limit errors
        if (error.message.includes('rate limit') || error.message.includes('429')) {
            this.addMessage('⏳ Rate limit reached. Please wait before sending another message.', 'system');
            return;
        }
        
        // Check for authentication errors
        if (error.message.includes('401') || error.message.includes('authentication')) {
            this.addMessage('🔑 Authentication failed. Please check your API key.', 'system');
            this.addConfigurationPrompt();
            return;
        }
        
        // Generic error handling
        console.error('Claude API Error:', error);
        this.addMessage(`❌ Error: ${error.message}`, 'system');
    }

    handleScreenshotCaptured(screenshot) {
        if (screenshot.aiRequest) {
            this.sendScreenshotForAnalysis(screenshot);
        }
    }

    handleElementInspected(elementData) {
        this.addMessage(`🔍 Analyzing element: ${elementData.tagName}`, 'system');
        
        const request = {
            type: 'element_analysis_request',
            element: elementData,
            timestamp: Date.now()
        };

        this.sendMessage(request);
    }

    async quickScreenshotAnalysis() {
        if (!this.screenshotSystem) return;
        
        try {
            const screenshot = await this.screenshotSystem.captureFullPage();
            this.sendScreenshotForAnalysis(screenshot);
        } catch (error) {
            console.error('Quick analysis failed:', error);
        }
    }

    sendScreenshotForAnalysis(screenshot) {
        this.addMessage('📸 Quick screenshot analysis...', 'user', screenshot.data);
        
        const request = {
            type: 'screenshot_analysis_request',
            screenshot: screenshot.data,
            metadata: screenshot.metadata,
            prompt: 'Quick UI/UX analysis - highlight the most important issues and opportunities.',
            timestamp: Date.now()
        };

        this.sendMessage(request);
    }

    toggleChat() {
        const chatPanel = document.getElementById('ai-chat-panel');
        chatPanel.classList.toggle('collapsed');
    }

    // Integration points for external systems
    setScreenshotSystem(screenshotSystem) {
        this.screenshotSystem = screenshotSystem;
    }

    setElementInspector(elementInspector) {
        this.elementInspector = elementInspector;
    }

    /**
     * Add configuration prompt to chat
     */
    addConfigurationPrompt() {
        const messagesContainer = document.getElementById('chat-messages');
        const promptEl = document.createElement('div');
        promptEl.className = 'chat-message system-message config-prompt';
        promptEl.innerHTML = `
            <p>🔧 <strong>Configure Claude API</strong></p>
            <p>To use AI chat features, you need to configure your Claude API key.</p>
            <button class="config-btn" onclick="window.aiChatIntegration.promptForConfiguration()">Configure Now</button>
        `;
        
        messagesContainer.appendChild(promptEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * Prompt user for API configuration
     */
    async promptForConfiguration() {
        const success = await this.claudeAPI.promptForApiKey();
        if (success) {
            this.addMessage('✅ Claude API configured successfully!', 'system');
            this.updatePlatformIndicator('claude');
            
            // Remove configuration prompts
            document.querySelectorAll('.config-prompt').forEach(el => el.remove());
        }
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const avgResponseTime = this.performanceTracker.requestTimes.length > 0 
            ? this.performanceTracker.requestTimes.reduce((a, b) => a + b, 0) / this.performanceTracker.requestTimes.length
            : 0;
            
        return {
            totalRequests: this.performanceTracker.successCount + this.performanceTracker.errorCount,
            successRate: this.performanceTracker.successCount / (this.performanceTracker.successCount + this.performanceTracker.errorCount) * 100,
            averageResponseTime: Math.round(avgResponseTime),
            apiUsage: this.claudeAPI ? this.claudeAPI.getUsageStats() : null
        };
    }
    
    // Public API
    getChatHistory() {
        return [...this.chatHistory];
    }

    clearChatHistory() {
        this.chatHistory = [];
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <p>👋 AI Assistant ready! I can help you with:</p>
                <ul>
                    <li>📸 Analyzing screenshots and UI elements</li>
                    <li>🎨 Providing design feedback and suggestions</li>
                    <li>♿ Checking accessibility compliance</li>
                    <li>⚡ Performance optimization tips</li>
                    <li>💻 Generating code improvements</li>
                </ul>
                <p>Use <kbd>Ctrl+Shift+C</kbd> to capture and send screenshots!</p>
            </div>
        `;
    }

    getActiveConnections() {
        return new Map(this.activeConnections);
    }
    
    /**
     * Request project context from CLI
     */
    async requestProjectContext() {
        if (this.cliBridge && this.cliSessionActive) {
            try {
                const context = await this.cliBridge.requestProjectContext();
                this.addMessage(`📋 Project context loaded: ${context.projectFiles?.length || 0} files in ${context.workingDirectory || 'unknown directory'}`, 'system');
                
                // Show session info
                const sessionInfo = document.getElementById('session-info');
                if (sessionInfo) {
                    sessionInfo.style.display = 'block';
                }
                this.updateSessionInfoDisplay();
                
            } catch (error) {
                console.error('Failed to load project context:', error);
            }
        }
    }
    
    /**
     * Update session information display
     */
    updateSessionInfoDisplay() {
        const sessionInfo = document.getElementById('session-info');
        if (sessionInfo) {
            sessionInfo.innerHTML = `
                <div class="session-details">
                    <span class="session-id">Session: ${this.cliStatus.sessionId?.substring(0, 8) || 'N/A'}</span>
                    <span class="working-dir">Dir: ${this.cliStatus.workingDirectory || 'N/A'}</span>
                    <span class="file-count">Files: ${this.cliStatus.projectFiles.size}</span>
                    ${this.cliStatus.currentTask ? `<span class="current-task">Task: ${this.cliStatus.currentTask.title}</span>` : ''}
                </div>
            `;
        }
    }
    
    /**
     * Show file operations menu
     */
    showFileOperationsMenu() {
        const operations = [
            { label: 'List Project Files', action: 'list_files' },
            { label: 'Search Files', action: 'search_files' },
            { label: 'Read File', action: 'read_file' },
            { label: 'Project Structure', action: 'project_structure' }
        ];
        
        const menuHtml = operations.map(op => 
            `<button class="file-op-btn" data-action="${op.action}">${op.label}</button>`
        ).join('');
        
        this.addMessage(`📁 File Operations:\n\n${menuHtml}`, 'system');
        
        // Add event listeners to operation buttons
        setTimeout(() => {
            document.querySelectorAll('.file-op-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    this.executeFileOperation(action);
                });
            });
        }, 100);
    }
    
    /**
     * Execute file operation
     */
    async executeFileOperation(action) {
        if (!this.cliBridge || !this.cliSessionActive) {
            this.addMessage('❌ CLI not available for file operations', 'system');
            return;
        }
        
        try {
            switch (action) {
                case 'list_files':
                    const files = await this.cliBridge.requestFileOperation('list', '.');
                    this.addMessage(`📊 Found ${files.result?.length || 0} files in project`, 'system');
                    break;
                    
                case 'search_files':
                    const searchTerm = prompt('Enter search term:');
                    if (searchTerm) {
                        const searchResults = await this.cliBridge.requestFileOperation('search', '.', searchTerm);
                        this.addMessage(`🔍 Search for "${searchTerm}" found ${searchResults.result?.length || 0} matches`, 'system');
                    }
                    break;
                    
                case 'read_file':
                    const filepath = prompt('Enter file path:');
                    if (filepath) {
                        const content = await this.cliBridge.requestFileOperation('read', filepath);
                        this.addMessage(`📄 File content loaded: ${filepath} (${content.result?.length || 0} characters)`, 'system');
                    }
                    break;
                    
                case 'project_structure':
                    const structure = await this.cliBridge.requestFileOperation('structure', '.');
                    this.addMessage('🌳 Project structure analyzed', 'system');
                    break;
                    
                default:
                    this.addMessage(`❌ Unknown file operation: ${action}`, 'system');
            }
        } catch (error) {
            console.error('File operation failed:', error);
            this.addMessage(`❌ File operation failed: ${error.message}`, 'system');
        }
    }
    
    /**
     * Show CLI command prompt
     */
    showCLICommandPrompt() {
        const chatInput = document.getElementById('chat-input');
        chatInput.placeholder = 'Enter CLI command (e.g., "Create a new component", "Run tests", "Build project")';
        chatInput.focus();
        
        this.addMessage('⌨️ CLI Command Mode: Enter any development command or request...', 'system');
        
        // Set a flag to handle the next message as a CLI command
        this.nextMessageIsCLICommand = true;
    }
    
    /**
     * Execute CLI command
     */
    async executeCLICommand(command) {
        if (!this.cliBridge || !this.cliSessionActive) {
            this.addMessage('❌ CLI not available for command execution', 'system');
            return;
        }
        
        try {
            this.addMessage(`⌨️ Executing: ${command}`, 'user');
            const result = await this.cliBridge.executeCLICommand(command);
            
            if (result.success) {
                this.addMessage(`✅ Command executed successfully`, 'system');
                if (result.output) {
                    this.addMessage(`Output:\n${result.output}`, 'ai');
                }
            } else {
                this.addMessage(`❌ Command failed: ${result.error}`, 'system');
            }
        } catch (error) {
            console.error('CLI command execution failed:', error);
            this.addMessage(`❌ CLI command failed: ${error.message}`, 'system');
        }
    }

    // Enhanced Analysis Methods
    async analyzePerformance() {
        this.addMessage('⚡ Starting performance analysis...', 'system');
        
        // Ensure screenshot system is available
        if (!this.screenshotSystem && window.screenshotCaptureSystem) {
            this.screenshotSystem = window.screenshotCaptureSystem;
        }
        
        if (this.screenshotSystem) {
            try {
                const screenshot = await this.screenshotSystem.captureFullPage({ autoAnalyze: false });
                
                const request = {
                    type: 'performance_analysis_request',
                    screenshot: screenshot.data,
                    timestamp: Date.now()
                };

                this.sendMessage(request);
                this.trackAnalysisRequest('performance', screenshot.metadata);
            } catch (error) {
                console.error('Performance analysis failed:', error);
                this.addMessage('❌ Failed to capture screenshot for performance analysis. Error: ' + error.message, 'system');
            }
        } else {
            this.addMessage('❌ Screenshot system not available for performance analysis.', 'system');
        }
    }

    async analyzeDesignPatterns() {
        this.addMessage('🎨 Analyzing design patterns and consistency...', 'system');
        
        // Ensure screenshot system is available
        if (!this.screenshotSystem && window.screenshotCaptureSystem) {
            this.screenshotSystem = window.screenshotCaptureSystem;
        }
        
        if (this.screenshotSystem) {
            try {
                const screenshot = await this.screenshotSystem.captureFullPage({ autoAnalyze: false });
                
                const request = {
                    type: 'design_pattern_analysis',
                    screenshot: screenshot.data,
                    timestamp: Date.now()
                };

                this.sendMessage(request);
                this.trackAnalysisRequest('design_patterns', screenshot.metadata);
            } catch (error) {
                console.error('Design pattern analysis failed:', error);
                this.addMessage('❌ Failed to capture screenshot for design pattern analysis. Error: ' + error.message, 'system');
            }
        } else {
            this.addMessage('❌ Screenshot system not available for design pattern analysis.', 'system');
        }
    }

    async analyzeMobileResponsiveness() {
        this.addMessage('📱 Analyzing mobile responsiveness...', 'system');
        
        // Ensure screenshot system is available
        if (!this.screenshotSystem && window.screenshotCaptureSystem) {
            this.screenshotSystem = window.screenshotCaptureSystem;
        }
        
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            orientation: screen.orientation?.type || 'unknown'
        };
        
        if (this.screenshotSystem) {
            try {
                const screenshot = await this.screenshotSystem.captureFullPage({ autoAnalyze: false });
                
                const request = {
                    type: 'mobile_responsiveness_analysis',
                    screenshot: screenshot.data,
                viewport: viewport,
                timestamp: Date.now()
            };

                this.sendMessage(request);
                this.trackAnalysisRequest('mobile_responsiveness', { viewport, ...screenshot.metadata });
            } catch (error) {
                console.error('Mobile responsiveness analysis failed:', error);
                this.addMessage('❌ Failed to capture screenshot for mobile responsiveness analysis. Error: ' + error.message, 'system');
            }
        } else {
            this.addMessage('❌ Screenshot system not available for mobile responsiveness analysis.', 'system');
        }
    }

    // Enhanced Message Handlers
    handleVisionAnalysisComplete(data) {
        const { analysis, analysisType, insights, suggestions } = data;
        
        let emoji = '🔍';
        switch (analysisType) {
            case 'accessibility': emoji = '♿'; break;
            case 'performance': emoji = '⚡'; break;
            case 'design_patterns': emoji = '🎨'; break;
            case 'mobile_responsiveness': emoji = '📱'; break;
        }

        this.addMessage(`${emoji} Analysis Complete: ${analysis}`, 'ai');
        
        if (insights && insights.length > 0) {
            this.addMessage(`💡 Key Insights: ${insights.join(', ')}`, 'ai');
        }
        
        if (suggestions && suggestions.length > 0) {
            this.addMessage(`🛠️ Recommendations: ${suggestions.join(', ')}`, 'ai');
        }
    }

    handleRealTimeInsight(data) {
        const { insight, priority, category } = data;
        
        const priorityEmoji = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        
        this.addMessage(`${priorityEmoji[priority] || '💡'} Real-time Insight (${category}): ${insight}`, 'ai');
    }

    handleAutomatedSuggestion(data) {
        const { suggestion, implementation, effort } = data;
        
        const effortEmoji = {
            low: '⚡',
            medium: '🔧',
            high: '🏗️'
        };
        
        this.addMessage(`${effortEmoji[effort] || '💡'} Automated Suggestion: ${suggestion}`, 'ai');
        
        if (implementation) {
            this.addMessage(`📝 Implementation: ${implementation}`, 'ai');
        }
    }

    // Analysis Tracking and Context
    trackAnalysisRequest(type, metadata) {
        this.chatHistory.push({
            type: 'analysis_request',
            analysisType: type,
            metadata: metadata,
            timestamp: Date.now()
        });
    }

    enableRealTimeAnalysis() {
        // Enable real-time analysis mode for continuous insights
        if (!this.realTimeAnalysisEnabled) {
            this.realTimeAnalysisEnabled = true;
            this.addMessage('🔄 Real-time analysis mode enabled', 'system');
            
            // Set up periodic analysis if not already running
            if (!this.realTimeInterval) {
                this.realTimeInterval = setInterval(() => {
                    this.performQuickAnalysis();
                }, 30000); // Every 30 seconds
            }
        }
    }

    disableRealTimeAnalysis() {
        if (this.realTimeAnalysisEnabled) {
            this.realTimeAnalysisEnabled = false;
            this.addMessage('⏸️ Real-time analysis mode disabled', 'system');
            
            if (this.realTimeInterval) {
                clearInterval(this.realTimeInterval);
                this.realTimeInterval = null;
            }
        }
    }

    async performQuickAnalysis() {
        if (!this.realTimeAnalysisEnabled || !this.screenshotSystem) return;
        
        try {
            const quickScreenshot = await this.screenshotSystem.captureFullPageImage(0.5); // Lower quality for speed
            
            const quickRequest = {
                type: 'quick_insight_request',
                screenshot: quickScreenshot,
                context: {
                    url: window.location.href,
                    timestamp: Date.now(),
                    isRealTime: true
                }
            };
            
            this.sendMessage(quickRequest);
        } catch (error) {
            console.warn('Quick analysis failed:', error);
        }
    }

    requestAutomatedSuggestions() {
        const request = {
            type: 'request_automated_suggestions',
            context: {
                url: window.location.href,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                timestamp: Date.now()
            }
        };
        
        this.sendMessage(request);
    }

    // Enhanced sendScreenshotToAI with improved prompting
    async sendScreenshotToAI() {
        if (!this.pendingScreenshot) return;

        const chatInput = document.getElementById('chat-input');
        const customPrompt = chatInput.value.trim();
        
        const enhancedPrompt = `📸 Please analyze this screenshot of my web application using advanced computer vision analysis.

Perform comprehensive analysis covering:

🎨 VISUAL DESIGN & UX:
- Visual hierarchy and information architecture
- Color usage, contrast, and accessibility
- Typography quality and readability
- Layout effectiveness and spacing
- Brand consistency and professional appearance

♿ ACCESSIBILITY COMPLIANCE:
- WCAG 2.1 AA compliance indicators
- Color contrast ratios
- Visual accessibility barriers
- Interactive element accessibility
- Screen reader compatibility signs

⚡ PERFORMANCE INDICATORS:
- Visual performance optimization opportunities
- Loading state effectiveness
- Image optimization potential
- Layout efficiency indicators

📱 MOBILE RESPONSIVENESS:
- Mobile-friendly design elements
- Touch target appropriateness
- Content prioritization for mobile
- Responsive design implementation

🔧 ACTIONABLE RECOMMENDATIONS:
- Prioritized improvement suggestions
- Specific implementation guidance
- Best practice recommendations
- Quick wins and major improvements

${customPrompt ? `\n📝 ADDITIONAL CONTEXT:\n${customPrompt}` : ''}

Provide detailed, specific, and actionable feedback with clear priorities.`;

        this.addMessage('📸 Screenshot sent for comprehensive analysis...', 'user', this.pendingScreenshot.data);
        
        const analysisRequest = {
            type: 'screenshot_analysis_request',
            screenshot: this.pendingScreenshot.data,
            metadata: this.pendingScreenshot.metadata,
            prompt: enhancedPrompt,
            timestamp: Date.now()
        };

        this.sendMessage(analysisRequest);
        this.hideScreenshotPreview();
        chatInput.value = '';
        
        // Enable real-time analysis mode
        this.enableRealTimeAnalysis();
    }

    // Enhanced accessibility checking
    async checkAccessibility() {
        this.addMessage('♿ Checking accessibility compliance...', 'system');
        
        try {
            const accessibilityData = await this.getAccessibilityInfo();
            
            // Ensure screenshot system is available
            if (!this.screenshotSystem && window.screenshotCaptureSystem) {
                this.screenshotSystem = window.screenshotCaptureSystem;
            }
            
            // Capture screenshot for visual accessibility analysis
            if (this.screenshotSystem) {
                const screenshot = await this.screenshotSystem.captureFullPage({ autoAnalyze: false });
                
                const request = {
                    type: 'accessibility_analysis_request',
                    screenshot: screenshot.data,
                    accessibilityData: accessibilityData,
                    timestamp: Date.now()
                };

                this.sendMessage(request);
                
                // Track analysis for insights
                this.trackAnalysisRequest('accessibility', accessibilityData);
            } else {
                this.addMessage('❌ Screenshot system not available for accessibility analysis.', 'system');
            }
        } catch (error) {
            console.error('Accessibility analysis failed:', error);
            this.addMessage('❌ Failed to perform accessibility analysis. Error: ' + error.message, 'system');
        }
    }

    // Enhanced full page analysis
    async performFullAnalysis() {
        this.addMessage('📊 Starting comprehensive page analysis...', 'system');
        
        try {
            // Ensure screenshot system is available
            if (!this.screenshotSystem && window.screenshotCaptureSystem) {
                this.screenshotSystem = window.screenshotCaptureSystem;
            }

            const analysisData = {
                url: window.location.href,
                title: document.title,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                elements: this.analyzePageElements(),
                performance: await this.getPerformanceMetrics(),
                accessibility: await this.getAccessibilityInfo()
            };

            // Capture screenshot for visual analysis
            if (this.screenshotSystem) {
                const screenshot = await this.screenshotSystem.captureFullPage({ autoAnalyze: false });
                
                const request = {
                    type: 'full_page_analysis_request',
                    screenshot: screenshot.data,
                    data: analysisData,
                    timestamp: Date.now()
                };

                this.sendMessage(request);
                
                // Request automated suggestions
                this.requestAutomatedSuggestions();
            } else {
                this.addMessage('❌ Screenshot system not available for full page analysis.', 'system');
            }
        } catch (error) {
            console.error('Full page analysis failed:', error);
            this.addMessage('❌ Failed to perform full page analysis. Error: ' + error.message, 'system');
        }
    }
}

// Initialize AI Chat Integration
window.aiChatIntegration = new AIChatIntegration();

console.log('💬 AI Chat Integration initialized for Claude Code CLI, Cursor, Windsurf, and Code LLM');