/**
 * ENHANCED PROTOCOL INTEGRATION BRIDGE
 * Seamlessly integrates Enhanced WebSocket Protocols with existing broker system
 * Provides backward compatibility and gradual migration capabilities
 * Part of the Verridian AI specialized agent ecosystem
 */

class EnhancedProtocolIntegrationBridge {
  constructor(options = {}) {
    this.bridgeId = 'enhanced-protocol-integration-bridge';
    this.version = '1.0.0';
    this.name = 'Enhanced Protocol Integration Bridge';
    
    // Core components integration
    this.enhancedProtocols = null;
    this.stabilityAgent = null;
    this.protocolAgent = null;
    this.brokerConnection = null;
    
    // Protocol negotiation and capability detection
    this.protocolNegotiation = {
      supportedVersions: ['1.0.0', '2.0.0', '2.1.0'],
      defaultVersion: '2.1.0',
      clientCapabilities: new Map(),
      protocolMigrationEnabled: options.enableProtocolMigration !== false,
      migrationThreshold: options.migrationThreshold || 0.8, // 80% client support
      negotiationTimeout: options.negotiationTimeout || 10000
    };
    
    // Message routing and compatibility layer
    this.messageRouting = {
      enhancedMessageTypes: new Set([
        'element_selected',
        'screenshot_capture', 
        'ide_message',
        'device_context_update',
        'ai_analysis_request',
        'collaboration_event'
      ]),
      legacyMessageTypes: new Set([
        'agent_message',
        'status_update',
        'health_check',
        'registration',
        'broadcast'
      ]),
      routingTable: new Map(),
      messageTransformers: new Map(),
      fallbackHandlers: new Map()
    };
    
    // Migration management
    this.migrationManager = {
      phaseStatus: 'preparation', // preparation, gradual, full_enhanced, complete
      clientMigrationStatus: new Map(),
      migrationMetrics: {
        totalClients: 0,
        enhancedClients: 0,
        legacyClients: 0,
        migrationProgress: 0
      },
      migrationSchedule: {
        preparationDuration: options.preparationDuration || 300000, // 5 minutes
        gradualMigrationDuration: options.gradualMigrationDuration || 1800000, // 30 minutes
        fullEnhancedDuration: options.fullEnhancedDuration || 600000 // 10 minutes
      }
    };
    
    // Performance monitoring and metrics
    this.performanceMonitoring = {
      messageLatencies: {
        enhanced: [],
        legacy: [],
        transformed: []
      },
      throughputMetrics: {
        messagesPerSecond: 0,
        enhancedMessagesPerSecond: 0,
        legacyMessagesPerSecond: 0
      },
      errorRates: {
        protocolNegotiationErrors: 0,
        messageTransformationErrors: 0,
        routingErrors: 0
      },
      metricsInterval: null,
      metricsReportingInterval: options.metricsReportingInterval || 60000
    };
    
    // Bridge event system
    this.eventHandlers = new Map();
    this.bridgeEvents = {
      PROTOCOL_NEGOTIATED: 'protocol_negotiated',
      CLIENT_MIGRATED: 'client_migrated',
      MESSAGE_TRANSFORMED: 'message_transformed',
      MIGRATION_PHASE_CHANGED: 'migration_phase_changed',
      PERFORMANCE_THRESHOLD_EXCEEDED: 'performance_threshold_exceeded'
    };
    
    console.log('🔧 Enhanced Protocol Integration Bridge initialized');
  }
  
  /**
   * Initialize the integration bridge
   */
  async init(enhancedProtocols, stabilityAgent, protocolAgent) {
    try {
      console.log('🚀 Initializing Enhanced Protocol Integration Bridge...');
      
      // Store component references
      this.enhancedProtocols = enhancedProtocols;
      this.stabilityAgent = stabilityAgent;
      this.protocolAgent = protocolAgent;
      
      // Get broker connection from stability agent
      this.brokerConnection = stabilityAgent.brokerWs;
      
      // Setup protocol negotiation
      this.setupProtocolNegotiation();
      
      // Initialize message routing
      this.initializeMessageRouting();
      
      // Setup transformation handlers
      this.setupMessageTransformers();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Begin migration preparation phase
      this.startMigrationPreparation();
      
      // Register bridge event handlers
      this.registerBridgeEventHandlers();
      
      console.log('✅ Enhanced Protocol Integration Bridge ready');
      return { success: true, bridge: this.bridgeId };
      
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Protocol Integration Bridge:', error);
      throw error;
    }
  }
  
  /**
   * Setup protocol negotiation system
   */
  setupProtocolNegotiation() {
    console.log('🤝 Setting up protocol negotiation...');
    
    // Handle client connection and capability detection
    this.on('client_connected', async (clientInfo) => {
      try {
        const capabilities = await this.detectClientCapabilities(clientInfo);
        const negotiatedProtocol = await this.negotiateProtocol(clientInfo, capabilities);
        
        this.protocolNegotiation.clientCapabilities.set(clientInfo.clientId, {
          ...capabilities,
          negotiatedProtocol,
          timestamp: Date.now()
        });
        
        this.emitBridgeEvent(this.bridgeEvents.PROTOCOL_NEGOTIATED, {
          clientId: clientInfo.clientId,
          protocol: negotiatedProtocol,
          capabilities
        });
        
      } catch (error) {
        console.error('❌ Protocol negotiation failed:', error);
        this.performanceMonitoring.errorRates.protocolNegotiationErrors++;
      }
    });
  }
  
  /**
   * Detect client capabilities
   */
  async detectClientCapabilities(clientInfo) {
    const capabilities = {
      supportsEnhancedProtocols: false,
      supportedMessageTypes: [],
      protocolVersion: '1.0.0',
      features: []
    };
    
    // Check for enhanced protocol support markers
    if (clientInfo.userAgent && clientInfo.userAgent.includes('VerridianEnhanced')) {
      capabilities.supportsEnhancedProtocols = true;
      capabilities.protocolVersion = this.extractProtocolVersion(clientInfo.userAgent);
    }
    
    // Detect supported message types through handshake
    if (clientInfo.supportedMessageTypes) {
      capabilities.supportedMessageTypes = clientInfo.supportedMessageTypes;
      
      // Check for enhanced message type support
      const hasEnhancedTypes = clientInfo.supportedMessageTypes.some(type => 
        this.messageRouting.enhancedMessageTypes.has(type)
      );
      
      if (hasEnhancedTypes) {
        capabilities.supportsEnhancedProtocols = true;
      }
    }
    
    // Feature detection
    const detectedFeatures = [];
    if (clientInfo.supportsIDE) detectedFeatures.push('ide_integration');
    if (clientInfo.supportsScreenshots) detectedFeatures.push('screenshot_capture');
    if (clientInfo.supportsCollaboration) detectedFeatures.push('real_time_collaboration');
    if (clientInfo.supportsElementSelection) detectedFeatures.push('element_selection');
    
    capabilities.features = detectedFeatures;
    
    return capabilities;
  }
  
  /**
   * Negotiate protocol version with client
   */
  async negotiateProtocol(clientInfo, capabilities) {
    let negotiatedVersion = '1.0.0'; // Default fallback
    
    if (capabilities.supportsEnhancedProtocols) {
      // Find highest mutually supported version
      const clientVersion = capabilities.protocolVersion;
      const supportedVersions = this.protocolNegotiation.supportedVersions;
      
      // Simple version matching (should be more sophisticated in production)
      if (supportedVersions.includes(clientVersion)) {
        negotiatedVersion = clientVersion;
      } else {
        // Find best compatible version
        negotiatedVersion = this.findCompatibleVersion(clientVersion, supportedVersions);
      }
    }
    
    console.log(`🤝 Negotiated protocol ${negotiatedVersion} for client ${clientInfo.clientId}`);
    return negotiatedVersion;
  }
  
  /**
   * Initialize message routing system
   */
  initializeMessageRouting() {
    console.log('🗺️ Initializing message routing...');
    
    // Setup routing table
    this.messageRouting.enhancedMessageTypes.forEach(messageType => {
      this.messageRouting.routingTable.set(messageType, 'enhanced');
    });
    
    this.messageRouting.legacyMessageTypes.forEach(messageType => {
      this.messageRouting.routingTable.set(messageType, 'legacy');
    });
    
    // Intercept messages from protocol agent
    if (this.protocolAgent && this.protocolAgent.on) {
      this.protocolAgent.on('message_received', (message) => {
        this.routeMessage(message, 'legacy');
      });
    }
    
    // Intercept messages from enhanced protocols
    if (this.enhancedProtocols && this.enhancedProtocols.on) {
      this.enhancedProtocols.on('message_received', (message) => {
        this.routeMessage(message, 'enhanced');
      });
    }
  }
  
  /**
   * Route message based on client capabilities and message type
   */
  async routeMessage(message, sourceProtocol) {
    try {
      const startTime = Date.now();
      const messageType = message.type || message.messageType;
      const targetClientId = message.targetClient || message.recipientId;
      
      // Get client capabilities
      const clientCapabilities = this.protocolNegotiation.clientCapabilities.get(targetClientId);
      
      if (!clientCapabilities) {
        // Unknown client, use fallback routing
        await this.handleUnknownClientRouting(message, sourceProtocol);
        return;
      }
      
      const clientSupportsEnhanced = clientCapabilities.supportsEnhancedProtocols;
      const routingDecision = this.makeRoutingDecision(messageType, clientSupportsEnhanced, sourceProtocol);
      
      switch (routingDecision.action) {
        case 'route_enhanced':
          await this.routeToEnhancedProtocol(message, routingDecision);
          break;
          
        case 'route_legacy':
          await this.routeToLegacyProtocol(message, routingDecision);
          break;
          
        case 'transform_and_route':
          await this.transformAndRoute(message, routingDecision);
          break;
          
        case 'duplicate_route':
          await this.duplicateAndRoute(message, routingDecision);
          break;
          
        default:
          console.warn('⚠️ Unknown routing decision:', routingDecision);
      }
      
      // Record performance metrics
      const latency = Date.now() - startTime;
      this.recordRoutingLatency(sourceProtocol, latency);
      
    } catch (error) {
      console.error('❌ Message routing failed:', error);
      this.performanceMonitoring.errorRates.routingErrors++;
    }
  }
  
  /**
   * Make intelligent routing decision
   */
  makeRoutingDecision(messageType, clientSupportsEnhanced, sourceProtocol) {
    const isEnhancedMessage = this.messageRouting.enhancedMessageTypes.has(messageType);
    const isLegacyMessage = this.messageRouting.legacyMessageTypes.has(messageType);
    
    // Decision matrix
    if (isEnhancedMessage && clientSupportsEnhanced) {
      return { action: 'route_enhanced', reason: 'enhanced_to_enhanced' };
    }
    
    if (isLegacyMessage && !clientSupportsEnhanced) {
      return { action: 'route_legacy', reason: 'legacy_to_legacy' };
    }
    
    if (isEnhancedMessage && !clientSupportsEnhanced) {
      return { action: 'transform_and_route', reason: 'downgrade_to_legacy' };
    }
    
    if (isLegacyMessage && clientSupportsEnhanced) {
      return { action: 'route_legacy', reason: 'legacy_compatible' };
    }
    
    // During migration phase, some messages might need dual routing
    if (this.migrationManager.phaseStatus === 'gradual') {
      return { action: 'duplicate_route', reason: 'migration_redundancy' };
    }
    
    return { action: 'route_legacy', reason: 'default_fallback' };
  }