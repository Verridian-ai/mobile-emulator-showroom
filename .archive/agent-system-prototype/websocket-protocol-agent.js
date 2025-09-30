/**
 * WEBSOCKET PROTOCOL AGENT
 * Manages WebSocket communication protocols, message routing, and connection stability
 * Ensures reliable real-time communication between all agents in the system
 */

class WebSocketProtocolAgent {
  constructor(options = {}) {
    this.agentId = 'websocket-protocol-agent';
    this.version = '1.0.0';
    this.name = 'WebSocket Protocol Agent';
    
    // WebSocket broker connection
    this.brokerWs = null;
    this.brokerURL = options.brokerURL || `ws://${window.location.hostname}:${window.location.port.replace('5174', '7071')}`;
    this.brokerToken = options.brokerToken || 'verridian-protocol-manager';
    this.isRegistered = false;
    
    // Protocol management
    this.protocolVersion = '2.1.0';
    this.messageQueue = new Map();
    this.routingTable = new Map();
    this.connectionStates = new Map();
    this.protocolHandlers = new Map();
    
    // Connection monitoring
    this.heartbeatInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.connectionHealth = {
      latency: 0,
      packetsLost: 0,
      totalMessages: 0,
      lastHeartbeat: null
    };
    
    // Message tracking
    this.pendingMessages = new Map();
    this.messageHistory = [];
    this.messageCounter = 0;
    this.deliveryConfirmations = new Set();
    
    // Protocol optimization
    this.compressionEnabled = true;
    this.batchingEnabled = true;
    this.batchQueue = [];
    this.batchTimer = null;
    this.maxBatchSize = 10;
    this.batchTimeout = 100; // ms
    
    // Error handling and recovery
    this.errorHandlers = new Map();
    this.retryQueue = [];
    this.circuitBreaker = {
      isOpen: false,
      failures: 0,
      threshold: 5,
      timeout: 30000,
      lastFailureTime: null
    };
    
    // Security and validation
    this.trustedOrigins = new Set(['localhost', '127.0.0.1']);
    this.messageValidators = new Map();
    this.rateLimiter = {
      requests: new Map(),
      windowSize: 60000, // 1 minute
      maxRequests: 1000
    };
    
    console.log('🔌 WebSocket Protocol Agent initialized');
  }
  
  async init() {
    try {
      console.log('🚀 Initializing WebSocket Protocol Agent...');
      
      // Setup protocol handlers
      this.setupProtocolHandlers();
      
      // Initialize message validators
      this.initializeMessageValidators();
      
      // Setup error handlers
      this.setupErrorHandlers();
      
      // Connect to broker
      await this.connectToBroker();
      
      // Start heartbeat monitoring
      this.startHeartbeat();
      
      // Initialize protocol optimization
      this.initializeOptimizations();
      
      // Start connection health monitoring
      this.startHealthMonitoring();
      
      console.log('✅ WebSocket Protocol Agent ready');
      return { success: true, agent: this.agentId };
      
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket Protocol Agent:', error);
      throw error;
    }
  }
  
  /**
   * Connect to WebSocket broker with enhanced connection handling
   */
  async connectToBroker() {
    try {
      console.log('🔄 Connecting to broker...');
      
      // Close existing connection if any
      if (this.brokerWs) {
        this.brokerWs.close();
      }
      
      this.brokerWs = new WebSocket(`${this.brokerURL}?token=${this.brokerToken}&agent=${this.agentId}&protocol=${this.protocolVersion}`);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Protocol connection timeout'));
        }, 15000);
        
        this.brokerWs.onopen = () => {
          console.log('✅ Protocol connection established');
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.circuitBreaker.isOpen = false;
          this.circuitBreaker.failures = 0;
          this.registerAgent();
          resolve();
        };
        
        this.brokerWs.onmessage = (event) => {
          this.handleIncomingMessage(event);
        };
        
        this.brokerWs.onclose = (event) => {
          console.log(`❌ Protocol connection closed: ${event.code} - ${event.reason}`);
          this.isRegistered = false;
          this.handleConnectionLoss(event);
        };
        
        this.brokerWs.onerror = (error) => {
          console.error('❌ Protocol connection error:', error);
          clearTimeout(timeout);
          this.handleConnectionError(error);
          reject(error);
        };
      });
      
    } catch (error) {
      console.error('❌ Failed to connect to broker:', error);
      throw error;
    }
  }
  
  /**
   * Register agent with enhanced protocol capabilities
   */
  registerAgent() {
    const registrationMessage = {
      role: 'protocol-agent',
      agentId: this.agentId,
      name: this.name,
      version: this.version,
      protocolVersion: this.protocolVersion,
      capabilities: [
        'message-routing',
        'connection-management',
        'protocol-optimization',
        'message-validation',
        'error-recovery',
        'heartbeat-monitoring',
        'batch-processing',
        'compression-support',
        'rate-limiting',
        'circuit-breaking'
      ],
      supportedProtocols: ['websocket', 'sse', 'polling'],
      features: {
        compression: this.compressionEnabled,
        batching: this.batchingEnabled,
        heartbeat: true,
        messageTracking: true,
        errorRecovery: true
      },
      timestamp: Date.now()
    };
    
    console.log('🤖 Registering protocol agent with broker...');
    this.sendMessage(registrationMessage);
  }
  
  /**
   * Handle incoming messages with protocol processing
   */
  async handleIncomingMessage(event) {
    try {
      const startTime = performance.now();
      let data;
      
      // Parse message data
      try {
        data = JSON.parse(event.data);
      } catch (parseError) {
        console.error('❌ Failed to parse message:', parseError);
        return;
      }
      
      // Update connection health
      this.updateConnectionHealth(startTime);
      
      // Validate message
      if (!this.validateMessage(data)) {
        console.warn('⚠️ Invalid message received:', data.type || 'unknown');
        return;
      }
      
      // Check rate limiting
      if (!this.checkRateLimit(data)) {
        console.warn('⚠️ Rate limit exceeded for message type:', data.type);
        return;
      }
      
      // Handle registration confirmation
      if (data.ok && data.registered === 'protocol-agent') {
        this.isRegistered = true;
        console.log('✅ Registered as protocol agent');
        this.processMessageQueue();
        return;
      }
      
      // Route message to appropriate handler
      if (data.type) {
        await this.routeMessage(data);
      }
      
      // Track message delivery
      if (data.requestId) {
        this.trackMessageDelivery(data.requestId);
      }
      
    } catch (error) {
      console.error('❌ Failed to handle incoming message:', error);
      this.handleProtocolError('message_processing', error);
    }
  }
  
  /**
   * Route messages to appropriate handlers
   */
  async routeMessage(data) {
    const { type, requestId, targetAgent, ...payload } = data;
    
    try {
      // Handle protocol-specific messages
      if (this.protocolHandlers.has(type)) {
        const handler = this.protocolHandlers.get(type);
        const response = await handler(payload);
        
        if (requestId) {
          this.sendResponseToBroker(requestId, type, response);
        }
        return;
      }
      
      // Route to specific agent if specified
      if (targetAgent && targetAgent !== this.agentId) {
        this.forwardMessage(data);
        return;
      }
      
      // Handle general protocol requests
      switch (type) {
        case 'protocol_health_check':
          await this.handleHealthCheck(payload);
          break;
        case 'protocol_optimization_request':
          await this.handleOptimizationRequest(payload);
          break;
        case 'connection_status_request':
          await this.handleConnectionStatusRequest(payload);
          break;
        case 'message_delivery_confirm':
          this.handleDeliveryConfirmation(payload);
          break;
        default:
          console.warn(`⚠️ Unknown protocol message type: ${type}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to route message ${type}:`, error);
      this.sendErrorToBroker(requestId, type, error.message);
    }
  }
  
  /**
   * Setup protocol handlers for different message types
   */
  setupProtocolHandlers() {
    // Connection management handlers
    this.protocolHandlers.set('heartbeat', async (payload) => {
      return {
        status: 'alive',
        timestamp: Date.now(),
        health: this.getConnectionHealth()
      };
    });
    
    this.protocolHandlers.set('connection_upgrade', async (payload) => {
      return await this.handleConnectionUpgrade(payload);
    });
    
    // Message routing handlers
    this.protocolHandlers.set('route_message', async (payload) => {
      return await this.handleMessageRouting(payload);
    });
    
    this.protocolHandlers.set('broadcast_message', async (payload) => {
      return await this.handleBroadcastMessage(payload);
    });
    
    // Protocol optimization handlers
    this.protocolHandlers.set('enable_compression', async (payload) => {
      this.compressionEnabled = payload.enabled;
      return { compression: this.compressionEnabled };
    });
    
    this.protocolHandlers.set('configure_batching', async (payload) => {
      this.batchingEnabled = payload.enabled;
      this.maxBatchSize = payload.maxSize || this.maxBatchSize;
      this.batchTimeout = payload.timeout || this.batchTimeout;
      return { 
        batching: this.batchingEnabled,
        maxSize: this.maxBatchSize,
        timeout: this.batchTimeout
      };
    });
    
    console.log(`📋 Setup ${this.protocolHandlers.size} protocol handlers`);
  }
  
  /**
   * Initialize message validators
   */
  initializeMessageValidators() {
    // Basic message structure validator
    this.messageValidators.set('structure', (message) => {
      return message && typeof message === 'object' && 
             (message.type || message.role || message.ok !== undefined);
    });
    
    // Agent message validator
    this.messageValidators.set('agent_message', (message) => {
      if (!message.type) return false;
      return message.requestId || message.targetAgent || message.broadcast;
    });
    
    // Protocol message validator
    this.messageValidators.set('protocol_message', (message) => {
      const protocolTypes = ['heartbeat', 'connection_upgrade', 'route_message', 'broadcast_message'];
      return protocolTypes.includes(message.type);
    });
    
    // Security validator
    this.messageValidators.set('security', (message) => {
      // Check for malicious patterns
      const dangerous = ['<script', 'javascript:', 'eval(', 'Function('];
      const messageStr = JSON.stringify(message);
      return !dangerous.some(pattern => messageStr.includes(pattern));
    });
    
    console.log(`🔒 Setup ${this.messageValidators.size} message validators`);
  }
  
  /**
   * Setup error handlers for different error types
   */
  setupErrorHandlers() {
    this.errorHandlers.set('connection_lost', async (error, context) => {
      console.log('🔄 Handling connection loss...');
      await this.attemptReconnection();
    });
    
    this.errorHandlers.set('message_failed', async (error, context) => {
      console.log('🔄 Handling message failure...');
      this.addToRetryQueue(context.message);
    });
    
    this.errorHandlers.set('protocol_error', async (error, context) => {
      console.log('🔄 Handling protocol error...');
      this.updateCircuitBreaker();
      
      if (this.circuitBreaker.isOpen) {
        console.warn('⚠️ Circuit breaker activated - temporary service degradation');
      }
    });
    
    console.log(`⚠️ Setup ${this.errorHandlers.size} error handlers`);
  }
  
  /**
   * Send message with protocol enhancements
   */
  sendMessage(message, options = {}) {
    if (!this.brokerWs || this.brokerWs.readyState !== WebSocket.OPEN) {
      if (!this.isRegistered) {
        // Queue message for later delivery
        const messageId = `msg_${++this.messageCounter}`;
        this.messageQueue.set(messageId, { message, options, timestamp: Date.now() });
        console.log(`📤 Queued message: ${message.type || 'unknown'} (${messageId})`);
        return messageId;
      }
      console.error('❌ Cannot send message: broker not connected');
      return null;
    }
    
    try {
      // Add protocol metadata
      const protocolMessage = {
        ...message,
        messageId: `msg_${++this.messageCounter}`,
        timestamp: Date.now(),
        protocolVersion: this.protocolVersion,
        compressed: this.compressionEnabled && options.compress !== false
      };
      
      // Handle batching if enabled
      if (this.batchingEnabled && options.batch !== false) {
        this.addToBatch(protocolMessage);
        return protocolMessage.messageId;
      }
      
      // Send message immediately
      this.brokerWs.send(JSON.stringify(protocolMessage));
      
      // Track message for delivery confirmation
      if (options.trackDelivery) {
        this.pendingMessages.set(protocolMessage.messageId, {
          message: protocolMessage,
          timestamp: Date.now(),
          retries: 0
        });
      }
      
      console.log(`📤 Sent: ${message.type || 'unknown'} (${protocolMessage.messageId})`);
      return protocolMessage.messageId;
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      this.handleProtocolError('send_failed', error, { message, options });
      return null;
    }
  }
  
  /**
   * Process queued messages when connection is restored
   */
  processMessageQueue() {
    if (this.messageQueue.size === 0) return;
    
    console.log(`📬 Processing ${this.messageQueue.size} queued messages...`);
    
    for (const [messageId, queuedItem] of this.messageQueue) {
      const { message, options } = queuedItem;
      
      // Check if message is still valid (not too old)
      if (Date.now() - queuedItem.timestamp > 300000) { // 5 minutes
        console.warn(`⚠️ Discarding old queued message: ${messageId}`);
        continue;
      }
      
      this.sendMessage(message, { ...options, batch: false });
    }
    
    this.messageQueue.clear();
    console.log('✅ Message queue processed');
  }
  
  /**
   * Add message to batch for optimized delivery
   */
  addToBatch(message) {
    this.batchQueue.push(message);
    
    if (this.batchQueue.length >= this.maxBatchSize) {
      this.flushBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushBatch(), this.batchTimeout);
    }
  }
  
  /**
   * Flush batch of messages
   */
  flushBatch() {
    if (this.batchQueue.length === 0) return;
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    const batch = {
      type: 'message_batch',
      messages: this.batchQueue.slice(),
      batchId: `batch_${Date.now()}`,
      count: this.batchQueue.length,
      timestamp: Date.now()
    };
    
    if (this.brokerWs && this.brokerWs.readyState === WebSocket.OPEN) {
      this.brokerWs.send(JSON.stringify(batch));
      console.log(`📦 Sent batch: ${batch.count} messages (${batch.batchId})`);
    }
    
    this.batchQueue.length = 0;
  }
  
  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isRegistered) {
        const heartbeat = {
          type: 'heartbeat',
          agentId: this.agentId,
          timestamp: Date.now(),
          health: this.getConnectionHealth()
        };
        
        this.sendMessage(heartbeat, { batch: false });
        this.connectionHealth.lastHeartbeat = Date.now();
      }
    }, 30000); // Every 30 seconds
    
    console.log('💓 Heartbeat monitoring started');
  }
  
  /**
   * Handle connection loss with recovery logic
   */
  handleConnectionLoss(event) {
    console.log('📡 Connection lost - initiating recovery...');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Trigger error handler
    this.handleProtocolError('connection_lost', new Error(`Connection closed: ${event.code}`));
  }
  
  /**
   * Attempt reconnection with exponential backoff
   */
  async attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts} in ${delay}ms...`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      await this.connectToBroker();
      this.startHeartbeat();
    } catch (error) {
      console.error('❌ Reconnection failed:', error);
      this.attemptReconnection();
    }
  }
  
  /**
   * Validate incoming messages
   */
  validateMessage(message) {
    for (const [name, validator] of this.messageValidators) {
      if (!validator(message)) {
        console.warn(`⚠️ Message failed ${name} validation:`, message);
        return false;
      }
    }
    return true;
  }
  
  /**
   * Check rate limiting for messages
   */
  checkRateLimit(message) {
    const now = Date.now();
    const key = `${message.type || 'unknown'}_${message.agentId || 'anonymous'}`;
    
    if (!this.rateLimiter.requests.has(key)) {
      this.rateLimiter.requests.set(key, []);
    }
    
    const requests = this.rateLimiter.requests.get(key);
    
    // Remove old requests outside the window
    const cutoff = now - this.rateLimiter.windowSize;
    const validRequests = requests.filter(timestamp => timestamp > cutoff);
    
    // Check if we're over the limit
    if (validRequests.length >= this.rateLimiter.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.rateLimiter.requests.set(key, validRequests);
    
    return true;
  }
  
  /**
   * Update connection health metrics
   */
  updateConnectionHealth(startTime) {
    this.connectionHealth.totalMessages++;
    this.connectionHealth.latency = performance.now() - startTime;
    
    // Clean up old history
    if (this.messageHistory.length > 1000) {
      this.messageHistory = this.messageHistory.slice(-500);
    }
    
    this.messageHistory.push({
      timestamp: Date.now(),
      latency: this.connectionHealth.latency
    });
  }
  
  /**
   * Get current connection health status
   */
  getConnectionHealth() {
    return {
      ...this.connectionHealth,
      connected: this.brokerWs?.readyState === WebSocket.OPEN,
      registered: this.isRegistered,
      queuedMessages: this.messageQueue.size,
      pendingMessages: this.pendingMessages.size,
      circuitBreakerOpen: this.circuitBreaker.isOpen
    };
  }
  
  /**
   * Handle protocol errors
   */
  handleProtocolError(errorType, error, context = {}) {
    console.error(`🚨 Protocol error [${errorType}]:`, error);
    
    if (this.errorHandlers.has(errorType)) {
      const handler = this.errorHandlers.get(errorType);
      handler(error, context);
    }
  }
  
  /**
   * Send successful response back to broker
   */
  sendResponseToBroker(requestId, originalType, responseData) {
    const message = {
      type: 'protocol_response',
      requestId,
      status: 'success',
      data: responseData,
      metadata: {
        agent: this.agentId,
        protocol: originalType,
        timestamp: Date.now()
      }
    };
    
    this.sendMessage(message);
  }
  
  /**
   * Send error response back to broker
   */
  sendErrorToBroker(requestId, originalType, errorMessage) {
    const message = {
      type: 'protocol_error',
      requestId,
      error: errorMessage,
      metadata: {
        agent: this.agentId,
        protocol: originalType,
        timestamp: Date.now()
      }
    };
    
    this.sendMessage(message);
  }
  
  /**
   * Get agent status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      version: this.version,
      protocolVersion: this.protocolVersion,
      connected: this.brokerWs?.readyState === WebSocket.OPEN,
      registered: this.isRegistered,
      health: this.getConnectionHealth(),
      features: {
        compression: this.compressionEnabled,
        batching: this.batchingEnabled,
        heartbeat: !!this.heartbeatInterval
      },
      statistics: {
        messagesProcessed: this.connectionHealth.totalMessages,
        queuedMessages: this.messageQueue.size,
        pendingMessages: this.pendingMessages.size,
        batchQueueSize: this.batchQueue.length,
        reconnectAttempts: this.reconnectAttempts
      },
      timestamp: Date.now()
    };
  }
  
  /**
   * Initialize protocol optimizations
   */
  initializeOptimizations() {
    // Start batch processing
    if (this.batchingEnabled) {
      console.log('📦 Batch processing enabled');
    }
    
    // Enable compression if supported
    if (this.compressionEnabled) {
      console.log('🗜️ Message compression enabled');
    }
    
    // Initialize circuit breaker
    console.log('⚡ Circuit breaker initialized');
  }
  
  /**
   * Start connection health monitoring
   */
  startHealthMonitoring() {
    setInterval(() => {
      const health = this.getConnectionHealth();
      
      // Log health status periodically
      if (health.totalMessages % 100 === 0) {
        console.log(`📊 Health: ${health.totalMessages} msgs, ${health.latency.toFixed(2)}ms latency`);
      }
      
      // Check for connection issues
      if (health.latency > 5000) {
        console.warn('⚠️ High latency detected:', health.latency);
      }
      
      // Clean up expired pending messages
      for (const [messageId, pending] of this.pendingMessages) {
        if (Date.now() - pending.timestamp > 60000) { // 1 minute
          this.pendingMessages.delete(messageId);
        }
      }
      
    }, 10000); // Every 10 seconds
    
    console.log('📊 Health monitoring started');
  }
  
  /**
   * Update circuit breaker state
   */
  updateCircuitBreaker() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;
      
      // Reset after timeout
      setTimeout(() => {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
        console.log('🔄 Circuit breaker reset');
      }, this.circuitBreaker.timeout);
    }
  }
  
  /**
   * Gracefully disconnect
   */
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.flushBatch();
    }
    
    if (this.brokerWs) {
      console.log('🔄 Disconnecting protocol agent...');
      this.isRegistered = false;
      this.brokerWs.close();
      this.brokerWs = null;
    }
  }
}

// Initialize and register the agent
if (typeof window !== 'undefined') {
  window.WebSocketProtocolAgent = WebSocketProtocolAgent;
  
  // Auto-initialize if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const protocolAgent = new WebSocketProtocolAgent();
      protocolAgent.init().catch(console.error);
    });
  } else {
    const protocolAgent = new WebSocketProtocolAgent();
    protocolAgent.init().catch(console.error);
  }
}