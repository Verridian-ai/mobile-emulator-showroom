/**
 * WEBSOCKET BROKER STABILITY AGENT
 * Ensures reliable WebSocket connections with failover, recovery, and monitoring
 * Part of the Verridian AI specialized agent ecosystem
 */

class WebSocketBrokerStabilityAgent {
  constructor(options = {}) {
    this.agentId = 'websocket-broker-stability-agent';
    this.version = '1.0.0';
    this.name = 'WebSocket Broker Stability Agent';
    
    // Connection management
    this.connectionState = {
      status: 'disconnected', // disconnected, connecting, connected, reconnecting, failed
      lastConnected: null,
      lastDisconnected: null,
      reconnectAttempts: 0,
      totalReconnects: 0,
      connectionId: null,
      currentBroker: null,
      networkQuality: 'unknown'
    };
    
    // WebSocket broker endpoints
    this.brokerEndpoints = {
      primary: options.primaryBroker || `ws://${window.location.hostname}:${window.location.port.replace('5174', '7071')}`,
      fallbacks: options.fallbackBrokers || []
    };
    
    // Recovery system with exponential backoff
    this.recoverySystem = {
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      baseRetryDelay: options.baseRetryDelay || 1000,
      maxRetryDelay: options.maxRetryDelay || 30000,
      backoffMultiplier: options.backoffMultiplier || 1.5,
      heartbeatInterval: options.heartbeatInterval || 30000,
      timeoutThreshold: options.timeoutThreshold || 10000,
      reconnectTimer: null,
      heartbeatTimer: null
    };
    
    // Message reliability
    this.messageQueue = {
      pending: new Map(),
      acknowledged: new Map(),
      failed: new Map(),
      maxPendingTime: options.maxPendingTime || 60000,
      maxRetries: options.maxRetries || 3
    };
    
    // Failover management
    this.failoverSystem = {
      enabled: options.enableFailover !== false,
      fallbackBrokers: options.fallbackBrokers || [],
      currentBrokerIndex: 0,
      consecutiveFailures: 0,
      maxConsecutiveFailures: options.maxConsecutiveFailures || 3,
      failoverCooldown: options.failoverCooldown || 30000,
      lastFailoverTime: null
    };
    
    // Agent registry and health monitoring
    this.agentRegistry = {
      connectedAgents: new Map(),
      healthChecks: new Map(),
      lastHealthScan: null,
      healthCheckInterval: options.healthCheckInterval || 45000,
      unhealthyThreshold: options.unhealthyThreshold || 3
    };
    
    // Network monitoring
    this.networkMonitoring = {
      latencyHistory: [],
      maxLatencyHistory: 50,
      qualityThresholds: {
        excellent: 50,
        good: 150,
        fair: 300,
        poor: 500
      },
      lastQualityCheck: null
    };
    
    // Event system for stability notifications
    this.eventHandlers = new Map();
    this.stabilityEvents = {
      CONNECTION_ESTABLISHED: 'connection_established',
      CONNECTION_LOST: 'connection_lost',
      RECONNECTION_SUCCESS: 'reconnection_success',
      RECONNECTION_FAILED: 'reconnection_failed',
      FAILOVER_TRIGGERED: 'failover_triggered',
      AGENT_HEALTH_CHANGED: 'agent_health_changed',
      NETWORK_QUALITY_CHANGED: 'network_quality_changed',
      MESSAGE_DELIVERY_FAILED: 'message_delivery_failed'
    };
    
    // Performance metrics
    this.performanceMetrics = {
      connectionUptime: 0,
      totalMessages: 0,
      successfulMessages: 0,
      failedMessages: 0,
      avgLatency: 0,
      reconnectionCount: 0,
      failoverCount: 0
    };
    
    // Primary WebSocket connection
    this.brokerWs = null;
    this.brokerToken = options.brokerToken || 'verridian-stability-monitor';
    
    console.log('🔧 WebSocket Broker Stability Agent initialized');
  }
  
  async init() {
    try {
      console.log('🚀 Initializing WebSocket Broker Stability Agent...');
      
      // Start connection management
      await this.establishConnection();
      
      // Initialize heartbeat system
      this.startHeartbeat();
      
      // Start agent health monitoring
      this.startHealthMonitoring();
      
      // Initialize message queue processing
      this.startMessageQueueProcessing();
      
      // Set up network quality monitoring
      this.startNetworkMonitoring();
      
      console.log('✅ WebSocket Broker Stability Agent ready');
      return { success: true, agent: this.agentId };
      
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket Broker Stability Agent:', error);
      throw error;
    }
  }
  
  /**
   * Establish WebSocket connection with failover support
   */
  async establishConnection() {
    const brokerUrl = this.getCurrentBrokerUrl();
    
    try {
      console.log(`🔄 Connecting to broker: ${brokerUrl}`);
      this.connectionState.status = 'connecting';
      
      this.brokerWs = new WebSocket(`${brokerUrl}?token=${this.brokerToken}&agent=${this.agentId}&role=stability-monitor`);
      
      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          this.handleConnectionFailure('Connection timeout');
          reject(new Error('Connection timeout'));
        }, this.recoverySystem.timeoutThreshold);
        
        this.brokerWs.onopen = () => {
          console.log('✅ Connected to WebSocket broker');
          clearTimeout(connectionTimeout);
          this.handleConnectionSuccess();
          resolve();
        };
        
        this.brokerWs.onmessage = (event) => {
          this.handleBrokerMessage(event);
        };
        
        this.brokerWs.onclose = (event) => {
          console.log(`❌ WebSocket connection closed: ${event.code} ${event.reason}`);
          clearTimeout(connectionTimeout);
          this.handleConnectionLoss();
        };
        
        this.brokerWs.onerror = (error) => {
          console.error('❌ WebSocket connection error:', error);
          clearTimeout(connectionTimeout);
          this.handleConnectionFailure(error.message || 'Connection error');
          reject(error);
        };
      });
      
    } catch (error) {
      this.handleConnectionFailure(error.message);
      throw error;
    }
  }
  
  /**
   * Handle successful connection
   */
  handleConnectionSuccess() {
    this.connectionState.status = 'connected';
    this.connectionState.lastConnected = Date.now();
    this.connectionState.reconnectAttempts = 0;
    this.connectionState.connectionId = this.generateConnectionId();
    this.connectionState.currentBroker = this.getCurrentBrokerUrl();
    
    // Reset consecutive failures
    this.failoverSystem.consecutiveFailures = 0;
    
    // Update performance metrics
    this.performanceMetrics.reconnectionCount = this.connectionState.totalReconnects;
    
    // Emit stability event
    this.emitStabilityEvent(this.stabilityEvents.CONNECTION_ESTABLISHED, {
      broker: this.connectionState.currentBroker,
      connectionId: this.connectionState.connectionId,
      attempts: this.connectionState.reconnectAttempts
    });
    
    // Register with broker as stability monitor
    this.registerAsStabilityMonitor();
  }
  
  /**
   * Handle connection failure
   */
  handleConnectionFailure(reason) {
    console.error(`❌ Connection failed: ${reason}`);
    
    this.connectionState.status = 'failed';
    this.connectionState.lastDisconnected = Date.now();
    this.failoverSystem.consecutiveFailures++;
    
    // Emit stability event
    this.emitStabilityEvent(this.stabilityEvents.CONNECTION_LOST, {
      reason,
      consecutiveFailures: this.failoverSystem.consecutiveFailures,
      broker: this.getCurrentBrokerUrl()
    });
    
    // Check if failover should be triggered
    if (this.shouldTriggerFailover()) {
      this.triggerFailover();
    }
    
    // Attempt reconnection
    this.scheduleReconnection();
  }
  
  /**
   * Handle connection loss
   */
  handleConnectionLoss() {
    if (this.connectionState.status === 'connected') {
      this.connectionState.status = 'disconnected';
      this.connectionState.lastDisconnected = Date.now();
      
      // Clear heartbeat timer
      if (this.recoverySystem.heartbeatTimer) {
        clearInterval(this.recoverySystem.heartbeatTimer);
        this.recoverySystem.heartbeatTimer = null;
      }
      
      // Emit stability event
      this.emitStabilityEvent(this.stabilityEvents.CONNECTION_LOST, {
        lastConnected: this.connectionState.lastConnected,
        connectionDuration: Date.now() - this.connectionState.lastConnected
      });
      
      // Attempt reconnection
      this.scheduleReconnection();
    }
  }
  
  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnection() {
    if (this.connectionState.reconnectAttempts >= this.recoverySystem.maxReconnectAttempts) {
      console.error('❌ Maximum reconnection attempts reached');
      this.connectionState.status = 'failed';
      
      this.emitStabilityEvent(this.stabilityEvents.RECONNECTION_FAILED, {
        attempts: this.connectionState.reconnectAttempts,
        maxAttempts: this.recoverySystem.maxReconnectAttempts
      });
      
      return;
    }
    
    this.connectionState.reconnectAttempts++;
    this.connectionState.status = 'reconnecting';
    
    // Calculate exponential backoff delay
    const delay = Math.min(
      this.recoverySystem.baseRetryDelay * Math.pow(this.recoverySystem.backoffMultiplier, this.connectionState.reconnectAttempts - 1),
      this.recoverySystem.maxRetryDelay
    );
    
    console.log(`🔄 Scheduling reconnection attempt ${this.connectionState.reconnectAttempts} in ${delay}ms`);
    
    this.recoverySystem.reconnectTimer = setTimeout(() => {
      console.log(`🔄 Reconnection attempt ${this.connectionState.reconnectAttempts}/${this.recoverySystem.maxReconnectAttempts}`);
      this.establishConnection()
        .then(() => {
          this.connectionState.totalReconnects++;
          this.emitStabilityEvent(this.stabilityEvents.RECONNECTION_SUCCESS, {
            attempt: this.connectionState.reconnectAttempts,
            totalReconnects: this.connectionState.totalReconnects
          });
        })
        .catch(() => {
          this.scheduleReconnection();
        });
    }, delay);
  }
  
  /**
   * Check if failover should be triggered
   */
  shouldTriggerFailover() {
    if (!this.failoverSystem.enabled || this.failoverSystem.fallbackBrokers.length === 0) {
      return false;
    }
    
    // Check consecutive failures threshold
    if (this.failoverSystem.consecutiveFailures >= this.failoverSystem.maxConsecutiveFailures) {
      // Check cooldown period
      if (this.failoverSystem.lastFailoverTime && 
          Date.now() - this.failoverSystem.lastFailoverTime < this.failoverSystem.failoverCooldown) {
        return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Trigger failover to next broker
   */
  triggerFailover() {
    if (this.failoverSystem.fallbackBrokers.length === 0) {
      console.error('❌ No fallback brokers available');
      return;
    }
    
    // Move to next broker
    this.failoverSystem.currentBrokerIndex = 
      (this.failoverSystem.currentBrokerIndex + 1) % this.failoverSystem.fallbackBrokers.length;
    
    this.failoverSystem.lastFailoverTime = Date.now();
    this.failoverSystem.consecutiveFailures = 0;
    this.performanceMetrics.failoverCount++;
    
    const newBroker = this.getCurrentBrokerUrl();
    console.log(`🔄 Failing over to broker ${this.failoverSystem.currentBrokerIndex + 1}: ${newBroker}`);
    
    // Reset reconnection attempts for new broker
    this.connectionState.reconnectAttempts = 0;
    
    // Emit failover event
    this.emitStabilityEvent(this.stabilityEvents.FAILOVER_TRIGGERED, {
      fromBroker: this.connectionState.currentBroker,
      toBroker: newBroker,
      reason: 'consecutive_failures',
      failoverCount: this.performanceMetrics.failoverCount
    });
  }
  
  /**
   * Get current broker URL
   */
  getCurrentBrokerUrl() {
    if (this.failoverSystem.currentBrokerIndex === 0) {
      return this.brokerEndpoints.primary;
    } else {
      return this.failoverSystem.fallbackBrokers[this.failoverSystem.currentBrokerIndex - 1];
    }
  }
  
  /**
   * Register as stability monitor with broker
   */
  registerAsStabilityMonitor() {
    const registrationMessage = {
      role: 'specialized-agent',
      agentId: this.agentId,
      name: this.name,
      version: this.version,
      capabilities: [
        'connection-monitoring',
        'failover-management',
        'message-reliability',
        'agent-health-tracking',
        'network-quality-assessment',
        'stability-analytics'
      ],
      specialization: 'websocket-stability',
      timestamp: Date.now()
    };
    
    console.log('🤖 Registering as stability monitor...');
    this.sendMessage(registrationMessage);
  }
  
  /**
   * Handle incoming broker messages
   */
  async handleBrokerMessage(event) {
    try {
      const data = JSON.parse(event.data);
      const messageLatency = Date.now() - (data.timestamp || Date.now());
      
      // Update network quality metrics
      this.updateNetworkMetrics(messageLatency);
      
      // Handle registration confirmation
      if (data.ok && data.registered === 'specialized-agent') {
        console.log('✅ Registered as stability monitor');
        return;
      }
      
      // Handle message acknowledgment
      if (data.type === 'message_ack' && data.messageId) {
        this.handleMessageAcknowledgment(data.messageId);
        return;
      }
      
      // Handle agent health reports
      if (data.type === 'agent_health_report') {
        this.updateAgentHealth(data);
        return;
      }
      
      // Handle stability requests
      if (data.type && this.isStabilityRequest(data.type)) {
        await this.handleStabilityRequest(data);
        return;
      }
      
    } catch (error) {
      console.error('❌ Failed to handle broker message:', error);
    }
  }
  
  /**
   * Check if message is a stability request
   */
  isStabilityRequest(type) {
    const stabilityTypes = [
      'stability_status_request',
      'connection_health_request',
      'agent_registry_request',
      'network_quality_request',
      'failover_status_request'
    ];
    
    return stabilityTypes.includes(type);
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.WebSocketBrokerStabilityAgent = WebSocketBrokerStabilityAgent;
}