/**
 * Claude Code CLI WebSocket Bridge
 * Provides seamless communication between browser and Claude Code CLI
 */

class ClaudeCodeCLIBridge {
    constructor() {
        this.websocket = null;
        this.isConnected = false;
        this.sessionId = null;
        this.messageQueue = [];
        this.responseHandlers = new Map();
        this.sessionContext = {
            workingDirectory: null,
            projectFiles: new Set(),
            currentTask: null,
            conversationHistory: []
        };
        
        // CLI Connection Configuration
        this.config = {
            cliPort: parseInt(window.CLI_PORT || '8080'),
            reconnectDelay: 3000,
            heartbeatInterval: 30000,
            maxReconnectAttempts: 5,
            timeout: 120000 // 2 minutes for CLI operations
        };
        
        this.reconnectAttempts = 0;
        this.heartbeatTimer = null;
        this.isReconnecting = false;
        
        // Performance tracking
        this.stats = {
            messagesExchanged: 0,
            averageResponseTime: 0,
            lastResponseTime: 0,
            connectionUptime: 0,
            connectedAt: null
        };
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Initializing Claude Code CLI Bridge...');
        await this.connectToCLI();
        this.setupEventListeners();
        this.startHeartbeat();
    }
    
    /**
     * Connect to Claude Code CLI WebSocket endpoint
     */
    async connectToCLI() {
        try {
            // Check if CLI is available before connecting
            if (!await this.checkCLIAvailability()) {
                // If real CLI not available, use mock mode for testing
                console.log('🎭 Mock CLI mode enabled for testing');
                this.setupMockWebSocket();
                return;
            }
            
            const cliUrl = `ws://localhost:${this.config.cliPort}/cli-bridge`;
            console.log(`🔗 Connecting to Claude Code CLI at ${cliUrl}`);
            
            this.websocket = new WebSocket(cliUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ Connected to Claude Code CLI');
                this.isConnected = true;
                this.isReconnecting = false;
                this.reconnectAttempts = 0;
                this.stats.connectedAt = Date.now();
                
                // Register browser session with CLI
                this.registerSession();
                
                // Process queued messages
                this.processMessageQueue();
                
                // Emit connection event
                this.emit('connected', {
                    sessionId: this.sessionId,
                    timestamp: Date.now()
                });
            };
            
            this.websocket.onmessage = (event) => {
                this.handleCLIMessage(event);
            };
            
            this.websocket.onclose = (event) => {
                console.log('🔌 Claude Code CLI connection closed:', event.code, event.reason);
                this.handleDisconnection();
            };
            
            this.websocket.onerror = (error) => {
                console.error('❌ Claude Code CLI connection error:', error);
                this.handleConnectionError(error);
            };
            
        } catch (error) {
            console.error('❌ Failed to connect to Claude Code CLI:', error);
            this.handleConnectionError(error);
        }
    }
    
    /**
     * Check if Claude Code CLI is available and running
     */
    async checkCLIAvailability() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`http://localhost:${this.config.cliPort}/health`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const health = await response.json();
                return health.status === 'ready' && health.cli === 'available';
            }
            return false;
        } catch (error) {
            console.warn('CLI health check failed, will use mock mode:', error.message);
            return false;
        }
    }
    
    /**
     * Set up mock WebSocket for testing when real CLI is not available
     */
    setupMockWebSocket() {
        console.log('🎭 Setting up mock CLI WebSocket...');
        
        // Create mock WebSocket interface
        this.websocket = {
            readyState: 1, // OPEN
            send: (data) => {
                const message = JSON.parse(data);
                console.log('🎭 Mock CLI received:', message.type);
                this.handleMockMessage(message);
            },
            close: () => {
                this.isConnected = false;
                console.log('🎭 Mock CLI connection closed');
            }
        };
        
        // Simulate connection established
        setTimeout(() => {
            this.isConnected = true;
            this.isReconnecting = false;
            this.reconnectAttempts = 0;
            this.stats.connectedAt = Date.now();
            
            // Register browser session with mock CLI
            this.registerSession();
            
            // Process queued messages
            this.processMessageQueue();
            
            // Emit connection event
            this.emit('connected', {
                sessionId: this.sessionId,
                timestamp: Date.now()
            });
        }, 500);
    }
    
    /**
     * Handle messages in mock mode
     */
    async handleMockMessage(message) {
        if (!window.mockCLIServer) {
            console.error('🎭 Mock CLI server not available');
            return;
        }
        
        try {
            const response = await window.mockCLIServer.processMessage(message);
            
            // Simulate network delay
            setTimeout(() => {
                this.handleCLIMessage({ data: JSON.stringify(response) });
            }, 100 + Math.random() * 200);
            
        } catch (error) {
            console.error('🎭 Mock CLI processing error:', error);
        }
    }
    
    /**
     * Register browser session with CLI
     */
    registerSession() {
        this.sessionId = `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const registration = {
            type: 'session_register',
            sessionId: this.sessionId,
            client: 'browser',
            capabilities: {
                fileOperations: false,
                screenshots: true,
                domAccess: true,
                userInteraction: true,
                realTimeUpdates: true
            },
            context: {
                url: window.location.href,
                title: document.title,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                userAgent: navigator.userAgent
            },
            timestamp: Date.now()
        };
        
        this.sendToCLI(registration);
    }
    
    /**
     * Send message to Claude Code CLI
     */
    sendToCLI(message, expectResponse = false) {
        if (!this.isConnected || !this.websocket) {
            console.warn('📨 Queueing message - CLI not connected');
            this.messageQueue.push({ message, expectResponse });
            return null;
        }
        
        // Add metadata to message
        const enrichedMessage = {
            ...message,
            sessionId: this.sessionId,
            messageId: this.generateMessageId(),
            timestamp: Date.now()
        };
        
        // Track response if expected
        if (expectResponse) {
            const responsePromise = new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    this.responseHandlers.delete(enrichedMessage.messageId);
                    reject(new Error('CLI response timeout'));
                }, this.config.timeout);
                
                this.responseHandlers.set(enrichedMessage.messageId, {
                    resolve,
                    reject,
                    timeoutId,
                    sentAt: Date.now()
                });
            });
            
            this.websocket.send(JSON.stringify(enrichedMessage));
            this.stats.messagesExchanged++;
            
            return responsePromise;
        } else {
            this.websocket.send(JSON.stringify(enrichedMessage));
            this.stats.messagesExchanged++;
            return null;
        }
    }
    
    /**
     * Handle messages from Claude Code CLI
     */
    handleCLIMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            // Handle response to a tracked message
            if (data.responseToMessage && this.responseHandlers.has(data.responseToMessage)) {
                const handler = this.responseHandlers.get(data.responseToMessage);
                clearTimeout(handler.timeoutId);
                
                // Calculate response time
                const responseTime = Date.now() - handler.sentAt;
                this.updateResponseTimeStats(responseTime);
                
                if (data.error) {
                    handler.reject(new Error(data.error));
                } else {
                    handler.resolve(data);
                }
                
                this.responseHandlers.delete(data.responseToMessage);
                return;
            }
            
            // Handle different message types from CLI
            switch (data.type) {
                case 'session_registered':
                    this.handleSessionRegistered(data);
                    break;
                    
                case 'cli_response':
                    this.handleCLIResponse(data);
                    break;
                    
                case 'file_operation_result':
                    this.handleFileOperationResult(data);
                    break;
                    
                case 'project_context_update':
                    this.handleProjectContextUpdate(data);
                    break;
                    
                case 'cli_error':
                    this.handleCLIError(data);
                    break;
                    
                case 'conversation_update':
                    this.handleConversationUpdate(data);
                    break;
                    
                case 'task_status_update':
                    this.handleTaskStatusUpdate(data);
                    break;
                    
                case 'heartbeat_response':
                    // CLI is alive
                    break;
                    
                default:
                    console.log('📨 Unhandled CLI message type:', data.type);
                    this.emit('cli_message', data);
            }
            
        } catch (error) {
            console.error('❌ Failed to parse CLI message:', error, event.data);
        }
    }
    
    /**
     * Send chat message to Claude Code CLI
     */
    async sendChatMessage(message, context = {}) {
        const chatRequest = {
            type: 'chat_message',
            message: message.trim(),
            context: {
                ...context,
                url: window.location.href,
                title: document.title,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                sessionContext: this.sessionContext
            }
        };
        
        try {
            const response = await this.sendToCLI(chatRequest, true);
            return response;
        } catch (error) {
            console.error('❌ Chat message failed:', error);
            throw error;
        }
    }
    
    /**
     * Send screenshot to CLI for analysis
     */
    async sendScreenshotForAnalysis(screenshot, prompt = '') {
        const analysisRequest = {
            type: 'screenshot_analysis',
            screenshot: {
                data: screenshot.data,
                metadata: screenshot.metadata || {}
            },
            prompt,
            context: {
                url: window.location.href,
                title: document.title,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };
        
        try {
            const response = await this.sendToCLI(analysisRequest, true);
            return response;
        } catch (error) {
            console.error('❌ Screenshot analysis failed:', error);
            throw error;
        }
    }
    
    /**
     * Request project context from CLI
     */
    async requestProjectContext() {
        const contextRequest = {
            type: 'request_project_context'
        };
        
        try {
            const response = await this.sendToCLI(contextRequest, true);
            this.updateSessionContext(response.context);
            return response.context;
        } catch (error) {
            console.error('❌ Project context request failed:', error);
            throw error;
        }
    }
    
    /**
     * Execute CLI command
     */
    async executeCLICommand(command, args = []) {
        const commandRequest = {
            type: 'execute_command',
            command,
            args,
            workingDirectory: this.sessionContext.workingDirectory
        };
        
        try {
            const response = await this.sendToCLI(commandRequest, true);
            return response;
        } catch (error) {
            console.error('❌ CLI command execution failed:', error);
            throw error;
        }
    }
    
    /**
     * Request file operation through CLI
     */
    async requestFileOperation(operation, filepath, content = null) {
        const fileRequest = {
            type: 'file_operation',
            operation, // 'read', 'write', 'list', 'search', etc.
            filepath,
            content
        };
        
        try {
            const response = await this.sendToCLI(fileRequest, true);
            return response;
        } catch (error) {
            console.error('❌ File operation failed:', error);
            throw error;
        }
    }
    
    /**
     * Start multi-turn conversation with context
     */
    async startConversation(initialMessage, context = {}) {
        const conversationRequest = {
            type: 'start_conversation',
            message: initialMessage,
            context: {
                ...context,
                sessionId: this.sessionId,
                projectContext: this.sessionContext
            }
        };
        
        try {
            const response = await this.sendToCLI(conversationRequest, true);
            this.sessionContext.conversationHistory.push({
                role: 'user',
                content: initialMessage,
                timestamp: Date.now()
            });
            
            if (response.content) {
                this.sessionContext.conversationHistory.push({
                    role: 'assistant',
                    content: response.content,
                    timestamp: Date.now()
                });
            }
            
            return response;
        } catch (error) {
            console.error('❌ Conversation start failed:', error);
            throw error;
        }
    }
    
    /**
     * Continue conversation with context
     */
    async continueConversation(message) {
        return this.sendChatMessage(message, {
            conversationHistory: this.sessionContext.conversationHistory.slice(-10) // Last 10 messages
        });
    }
    
    // Event handling methods
    handleSessionRegistered(data) {
        console.log('✅ CLI session registered:', data.sessionId);
        this.sessionContext.workingDirectory = data.workingDirectory;
        this.sessionContext.projectFiles = new Set(data.projectFiles || []);
        this.emit('session_registered', data);
    }
    
    handleCLIResponse(data) {
        console.log('💬 CLI response received');
        
        // Add to conversation history
        if (data.content) {
            this.sessionContext.conversationHistory.push({
                role: 'assistant',
                content: data.content,
                timestamp: Date.now(),
                metadata: data.metadata || {}
            });
        }
        
        this.emit('cli_response', data);
    }
    
    handleFileOperationResult(data) {
        console.log('📁 File operation result:', data.operation);
        this.emit('file_operation_result', data);
    }
    
    handleProjectContextUpdate(data) {
        console.log('📂 Project context updated');
        this.updateSessionContext(data.context);
        this.emit('project_context_update', data);
    }
    
    handleCLIError(data) {
        console.error('❌ CLI error:', data.error);
        this.emit('cli_error', data);
    }
    
    handleConversationUpdate(data) {
        console.log('🗣️ Conversation updated');
        if (data.messages) {
            this.sessionContext.conversationHistory = data.messages;
        }
        this.emit('conversation_update', data);
    }
    
    handleTaskStatusUpdate(data) {
        console.log('📋 Task status updated:', data.status);
        this.sessionContext.currentTask = data.task;
        this.emit('task_status_update', data);
    }
    
    // Connection management methods
    handleDisconnection() {
        this.isConnected = false;
        this.stopHeartbeat();
        
        // Update stats
        if (this.stats.connectedAt) {
            this.stats.connectionUptime = Date.now() - this.stats.connectedAt;
        }
        
        this.emit('disconnected', {
            sessionId: this.sessionId,
            uptime: this.stats.connectionUptime,
            timestamp: Date.now()
        });
        
        // Attempt reconnection
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.attemptReconnect();
        } else {
            console.error('❌ Max reconnection attempts reached. CLI bridge offline.');
            this.emit('connection_failed', {
                reason: 'max_attempts_reached',
                attempts: this.reconnectAttempts
            });
        }
    }
    
    handleConnectionError(error) {
        console.error('❌ CLI connection error:', error);
        this.emit('connection_error', { error: error.message, timestamp: Date.now() });
    }
    
    async attemptReconnect() {
        if (this.isReconnecting) return;
        
        this.isReconnecting = true;
        this.reconnectAttempts++;
        
        console.log(`🔄 Attempting CLI reconnection (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, this.config.reconnectDelay));
        await this.connectToCLI();
    }
    
    // Utility methods
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const { message, expectResponse } = this.messageQueue.shift();
            this.sendToCLI(message, expectResponse);
        }
    }
    
    generateMessageId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    updateResponseTimeStats(responseTime) {
        this.stats.lastResponseTime = responseTime;
        if (this.stats.averageResponseTime === 0) {
            this.stats.averageResponseTime = responseTime;
        } else {
            this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
        }
    }
    
    updateSessionContext(context) {
        Object.assign(this.sessionContext, context);
        this.emit('context_updated', { context: this.sessionContext });
    }
    
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.sendToCLI({
                    type: 'heartbeat',
                    timestamp: Date.now()
                });
            }
        }, this.config.heartbeatInterval);
    }
    
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    // Simple event emitter implementation
    emit(eventType, data) {
        const event = new CustomEvent(`cli_bridge_${eventType}`, { detail: data });
        window.dispatchEvent(event);
    }
    
    on(eventType, handler) {
        window.addEventListener(`cli_bridge_${eventType}`, handler);
    }
    
    off(eventType, handler) {
        window.removeEventListener(`cli_bridge_${eventType}`, handler);
    }
    
    // Public API methods
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            sessionId: this.sessionId,
            reconnectAttempts: this.reconnectAttempts,
            stats: { ...this.stats }
        };
    }
    
    getSessionContext() {
        return { ...this.sessionContext };
    }
    
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
        }
        this.stopHeartbeat();
        this.isConnected = false;
    }
    
    async reconnect() {
        this.disconnect();
        this.reconnectAttempts = 0;
        await this.connectToCLI();
    }
}

// Initialize global CLI bridge
window.claudeCLIBridge = new ClaudeCodeCLIBridge();

console.log('🌉 Claude Code CLI Bridge initialized');