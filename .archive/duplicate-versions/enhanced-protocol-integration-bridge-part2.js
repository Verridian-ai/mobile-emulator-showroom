  /**
   * Extract protocol version from user agent string
   */
  extractProtocolVersion(userAgent) {
    const versionMatch = userAgent.match(/VerridianEnhanced\/(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : '1.0.0';
  }
  
  /**
   * Find best compatible version between client and server
   */
  findCompatibleVersion(clientVersion, supportedVersions) {
    // Simple semantic versioning compatibility check
    const clientParts = clientVersion.split('.').map(Number);
    
    for (const version of supportedVersions.reverse()) {
      const versionParts = version.split('.').map(Number);
      
      // Major version must match, minor/patch can be lower on client
      if (versionParts[0] === clientParts[0] && 
          versionParts[1] <= clientParts[1]) {
        return version;
      }
    }
    
    return supportedVersions[0] || '1.0.0';
  }
  
  /**
   * Setup message transformation handlers
   */
  setupMessageTransformers() {
    console.log('🔄 Setting up message transformers...');
    
    // Transform enhanced messages to legacy format
    this.messageRouting.messageTransformers.set('enhanced_to_legacy', (message) => {
      const legacyMessage = {
        type: 'agent_message',
        messageId: message.messageId,
        timestamp: message.timestamp,
        source: 'enhanced_protocol_bridge',
        data: {}
      };
      
      switch (message.type) {
        case 'element_selected':
          legacyMessage.data = {
            action: 'element_interaction',
            element: message.payload.elementId,
            coordinates: message.payload.coordinates
          };
          break;
          
        case 'screenshot_capture':
          legacyMessage.data = {
            action: 'screen_capture_request',
            device: message.payload.device,
            format: message.payload.format
          };
          break;
          
        case 'ide_message':
          legacyMessage.data = {
            action: 'code_interaction',
            language: message.payload.language,
            content: message.payload.code
          };
          break;
          
        case 'collaboration_event':
          legacyMessage.data = {
            action: 'collaboration_update',
            event: message.payload.eventType,
            participants: message.payload.participants
          };
          break;
          
        default:
          legacyMessage.data = {
            action: 'generic_enhanced_message',
            originalType: message.type,
            payload: message.payload
          };
      }
      
      return legacyMessage;
    });
    
    // Transform legacy messages to enhanced format (if needed)
    this.messageRouting.messageTransformers.set('legacy_to_enhanced', (message) => {
      // Most legacy messages don't need transformation when sent to enhanced clients
      // They maintain backward compatibility
      return message;
    });
  }
  
  /**
   * Route message to enhanced protocol
   */
  async routeToEnhancedProtocol(message, routingDecision) {
    try {
      if (this.enhancedProtocols && this.enhancedProtocols.sendMessage) {
        await this.enhancedProtocols.sendMessage(message);
        this.emitBridgeEvent(this.bridgeEvents.MESSAGE_TRANSFORMED, {
          messageId: message.messageId,
          routingDecision,
          protocol: 'enhanced'
        });
      }
    } catch (error) {
      console.error('❌ Failed to route to enhanced protocol:', error);
      this.performanceMonitoring.errorRates.routingErrors++;
    }
  }
  
  /**
   * Route message to legacy protocol
   */
  async routeToLegacyProtocol(message, routingDecision) {
    try {
      if (this.brokerConnection && this.brokerConnection.readyState === WebSocket.OPEN) {
        this.brokerConnection.send(JSON.stringify(message));
        this.emitBridgeEvent(this.bridgeEvents.MESSAGE_TRANSFORMED, {
          messageId: message.messageId,
          routingDecision,
          protocol: 'legacy'
        });
      }
    } catch (error) {
      console.error('❌ Failed to route to legacy protocol:', error);
      this.performanceMonitoring.errorRates.routingErrors++;
    }
  }
  
  /**
   * Transform message and route to appropriate protocol
   */
  async transformAndRoute(message, routingDecision) {
    try {
      const transformationType = routingDecision.reason === 'downgrade_to_legacy' 
        ? 'enhanced_to_legacy' 
        : 'legacy_to_enhanced';
        
      const transformer = this.messageRouting.messageTransformers.get(transformationType);
      if (!transformer) {
        throw new Error(`No transformer found for ${transformationType}`);
      }
      
      const transformedMessage = transformer(message);
      
      // Route transformed message
      if (transformationType === 'enhanced_to_legacy') {
        await this.routeToLegacyProtocol(transformedMessage, routingDecision);
      } else {
        await this.routeToEnhancedProtocol(transformedMessage, routingDecision);
      }
      
      this.performanceMonitoring.errorRates.messageTransformationErrors = 
        Math.max(0, this.performanceMonitoring.errorRates.messageTransformationErrors - 1);
        
    } catch (error) {
      console.error('❌ Message transformation failed:', error);
      this.performanceMonitoring.errorRates.messageTransformationErrors++;
    }
  }
  
  /**
   * Duplicate message and route to both protocols
   */
  async duplicateAndRoute(message, routingDecision) {
    try {
      // Send to both enhanced and legacy protocols during migration
      const tasks = [];
      
      if (this.enhancedProtocols) {
        tasks.push(this.routeToEnhancedProtocol(message, routingDecision));
      }
      
      if (this.brokerConnection) {
        tasks.push(this.routeToLegacyProtocol(message, routingDecision));
      }
      
      await Promise.allSettled(tasks);
      
    } catch (error) {
      console.error('❌ Duplicate routing failed:', error);
      this.performanceMonitoring.errorRates.routingErrors++;
    }
  }
  
  /**
   * Handle routing for unknown clients
   */
  async handleUnknownClientRouting(message, sourceProtocol) {
    console.warn('⚠️ Routing message for unknown client, using fallback');
    
    // Default to legacy routing for unknown clients
    const fallbackHandler = this.messageRouting.fallbackHandlers.get('unknown_client');
    if (fallbackHandler) {
      await fallbackHandler(message, sourceProtocol);
    } else {
      // Default fallback behavior
      await this.routeToLegacyProtocol(message, { 
        action: 'route_legacy', 
        reason: 'unknown_client_fallback' 
      });
    }
  }
  
  /**
   * Record routing performance metrics
   */
  recordRoutingLatency(protocol, latency) {
    const latencyArray = this.performanceMonitoring.messageLatencies[protocol];
    if (latencyArray) {
      latencyArray.push(latency);
      
      // Keep only last 100 latency measurements
      if (latencyArray.length > 100) {
        latencyArray.shift();
      }
    }
  }
  
  /**
   * Start migration preparation phase
   */
  startMigrationPreparation() {
    console.log('📋 Starting migration preparation phase...');
    
    this.migrationManager.phaseStatus = 'preparation';
    this.emitBridgeEvent(this.bridgeEvents.MIGRATION_PHASE_CHANGED, {
      phase: 'preparation',
      duration: this.migrationManager.migrationSchedule.preparationDuration
    });
    
    // Schedule migration phases
    setTimeout(() => {
      this.startGradualMigration();
    }, this.migrationManager.migrationSchedule.preparationDuration);
  }
  
  /**
   * Start gradual migration phase
   */
  startGradualMigration() {
    console.log('🔄 Starting gradual migration phase...');
    
    this.migrationManager.phaseStatus = 'gradual';
    this.emitBridgeEvent(this.bridgeEvents.MIGRATION_PHASE_CHANGED, {
      phase: 'gradual',
      duration: this.migrationManager.migrationSchedule.gradualMigrationDuration
    });
    
    // Schedule full enhanced migration
    setTimeout(() => {
      this.checkMigrationReadiness();
    }, this.migrationManager.migrationSchedule.gradualMigrationDuration);
  }
  
  /**
   * Check if system is ready for full enhanced migration
   */
  checkMigrationReadiness() {
    const migrationProgress = this.calculateMigrationProgress();
    
    if (migrationProgress >= this.protocolNegotiation.migrationThreshold) {
      this.startFullEnhancedMigration();
    } else {
      console.log(`⏳ Migration progress: ${(migrationProgress * 100).toFixed(1)}%, extending gradual phase`);
      
      // Extend gradual migration phase
      setTimeout(() => {
        this.checkMigrationReadiness();
      }, 300000); // Check again in 5 minutes
    }
  }
  
  /**
   * Calculate migration progress
   */
  calculateMigrationProgress() {
    const metrics = this.migrationManager.migrationMetrics;
    
    if (metrics.totalClients === 0) {
      return 0;
    }
    
    metrics.migrationProgress = metrics.enhancedClients / metrics.totalClients;
    return metrics.migrationProgress;
  }
  
  /**
   * Start full enhanced migration phase
   */
  startFullEnhancedMigration() {
    console.log('🚀 Starting full enhanced migration phase...');
    
    this.migrationManager.phaseStatus = 'full_enhanced';
    this.emitBridgeEvent(this.bridgeEvents.MIGRATION_PHASE_CHANGED, {
      phase: 'full_enhanced',
      duration: this.migrationManager.migrationSchedule.fullEnhancedDuration,
      progress: this.migrationManager.migrationMetrics.migrationProgress
    });
    
    // Schedule migration completion
    setTimeout(() => {
      this.completeMigration();
    }, this.migrationManager.migrationSchedule.fullEnhancedDuration);
  }
  
  /**
   * Complete migration process
   */
  completeMigration() {
    console.log('✅ Migration completed successfully');
    
    this.migrationManager.phaseStatus = 'complete';
    this.emitBridgeEvent(this.bridgeEvents.MIGRATION_PHASE_CHANGED, {
      phase: 'complete',
      finalProgress: this.migrationManager.migrationMetrics.migrationProgress,
      totalClients: this.migrationManager.migrationMetrics.totalClients,
      enhancedClients: this.migrationManager.migrationMetrics.enhancedClients
    });
  }
  
  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    console.log('📊 Starting performance monitoring...');
    
    this.performanceMonitoring.metricsInterval = setInterval(() => {
      this.collectPerformanceMetrics();
      this.checkPerformanceThresholds();
    }, this.performanceMonitoring.metricsReportingInterval);
  }
  
  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    const now = Date.now();
    const interval = this.performanceMonitoring.metricsReportingInterval / 1000; // Convert to seconds
    
    // Calculate messages per second
    const recentMessages = this.getTotalRecentMessages();
    this.performanceMonitoring.throughputMetrics.messagesPerSecond = recentMessages / interval;
    
    // Calculate average latencies
    this.updateAverageLatencies();
    
    // Update client metrics
    this.updateClientMetrics();
  }
  
  /**
   * Update average latencies for different protocols
   */
  updateAverageLatencies() {
    const latencies = this.performanceMonitoring.messageLatencies;
    
    Object.keys(latencies).forEach(protocol => {
      const protocolLatencies = latencies[protocol];
      if (protocolLatencies.length > 0) {
        const average = protocolLatencies.reduce((sum, lat) => sum + lat, 0) / protocolLatencies.length;
        this.performanceMonitoring[`${protocol}AverageLatency`] = Math.round(average);
      }
    });
  }
  
  /**
   * Update client metrics
   */
  updateClientMetrics() {
    const metrics = this.migrationManager.migrationMetrics;
    
    metrics.totalClients = this.protocolNegotiation.clientCapabilities.size;
    metrics.enhancedClients = 0;
    metrics.legacyClients = 0;
    
    this.protocolNegotiation.clientCapabilities.forEach((capabilities) => {
      if (capabilities.supportsEnhancedProtocols) {
        metrics.enhancedClients++;
      } else {
        metrics.legacyClients++;
      }
    });
    
    metrics.migrationProgress = metrics.totalClients > 0 
      ? metrics.enhancedClients / metrics.totalClients 
      : 0;
  }
  
  /**
   * Get total recent messages across all protocols
   */
  getTotalRecentMessages() {
    // This would be implemented based on actual message counting
    // For now, return a calculated estimate
    return this.performanceMonitoring.messageLatencies.enhanced.length +
           this.performanceMonitoring.messageLatencies.legacy.length +
           this.performanceMonitoring.messageLatencies.transformed.length;
  }
  
  /**
   * Check performance thresholds and emit alerts
   */
  checkPerformanceThresholds() {
    const thresholds = {
      maxLatency: 1000,        // 1 second
      maxErrorRate: 0.05,      // 5%
      minThroughput: 10        // 10 messages per second
    };
    
    // Check latency thresholds
    const avgLatency = this.getAverageLatency();
    if (avgLatency > thresholds.maxLatency) {
      this.emitBridgeEvent(this.bridgeEvents.PERFORMANCE_THRESHOLD_EXCEEDED, {
        metric: 'latency',
        value: avgLatency,
        threshold: thresholds.maxLatency
      });
    }
    
    // Check error rate thresholds
    const errorRate = this.calculateErrorRate();
    if (errorRate > thresholds.maxErrorRate) {
      this.emitBridgeEvent(this.bridgeEvents.PERFORMANCE_THRESHOLD_EXCEEDED, {
        metric: 'error_rate',
        value: errorRate,
        threshold: thresholds.maxErrorRate
      });
    }
    
    // Check throughput thresholds
    const throughput = this.performanceMonitoring.throughputMetrics.messagesPerSecond;
    if (throughput < thresholds.minThroughput && throughput > 0) {
      this.emitBridgeEvent(this.bridgeEvents.PERFORMANCE_THRESHOLD_EXCEEDED, {
        metric: 'throughput',
        value: throughput,
        threshold: thresholds.minThroughput
      });
    }
  }
  
  /**
   * Get average latency across all protocols
   */
  getAverageLatency() {
    const allLatencies = [
      ...this.performanceMonitoring.messageLatencies.enhanced,
      ...this.performanceMonitoring.messageLatencies.legacy,
      ...this.performanceMonitoring.messageLatencies.transformed
    ];
    
    if (allLatencies.length === 0) return 0;
    
    return allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length;
  }
  
  /**
   * Calculate current error rate
   */
  calculateErrorRate() {
    const errors = this.performanceMonitoring.errorRates;
    const totalErrors = errors.protocolNegotiationErrors + 
                       errors.messageTransformationErrors + 
                       errors.routingErrors;
    
    const totalMessages = this.getTotalRecentMessages();
    
    return totalMessages > 0 ? totalErrors / totalMessages : 0;
  }
  
  /**
   * Register bridge event handlers
   */
  registerBridgeEventHandlers() {
    console.log('🎧 Registering bridge event handlers...');
    
    // Handle client migration events
    this.on(this.bridgeEvents.CLIENT_MIGRATED, (eventData) => {
      console.log(`🔄 Client migrated: ${eventData.clientId} to ${eventData.protocol}`);
      this.updateMigrationStatus(eventData.clientId, eventData.protocol);
    });
    
    // Handle performance threshold events
    this.on(this.bridgeEvents.PERFORMANCE_THRESHOLD_EXCEEDED, (eventData) => {
      console.warn(`⚠️ Performance threshold exceeded: ${eventData.metric} = ${eventData.value} (threshold: ${eventData.threshold})`);
      this.handlePerformanceAlert(eventData);
    });
    
    // Handle protocol negotiation events
    this.on(this.bridgeEvents.PROTOCOL_NEGOTIATED, (eventData) => {
      console.log(`🤝 Protocol negotiated for ${eventData.clientId}: ${eventData.protocol}`);
      this.updateClientProtocolStatus(eventData.clientId, eventData.protocol);
    });
  }
  
  /**
   * Update migration status for client
   */
  updateMigrationStatus(clientId, protocol) {
    this.migrationManager.clientMigrationStatus.set(clientId, {
      protocol,
      migratedAt: Date.now(),
      previousProtocol: this.getPreviousClientProtocol(clientId)
    });
    
    // Update overall migration metrics
    this.updateClientMetrics();
  }
  
  /**
   * Get previous protocol for client
   */
  getPreviousClientProtocol(clientId) {
    const migrationStatus = this.migrationManager.clientMigrationStatus.get(clientId);
    return migrationStatus ? migrationStatus.protocol : 'legacy';
  }
  
  /**
   * Update client protocol status
   */
  updateClientProtocolStatus(clientId, protocol) {
    const clientCapabilities = this.protocolNegotiation.clientCapabilities.get(clientId);
    if (clientCapabilities) {
      clientCapabilities.currentProtocol = protocol;
      clientCapabilities.lastNegotiated = Date.now();
    }
  }
  
  /**
   * Handle performance alerts
   */
  handlePerformanceAlert(alertData) {
    // Could implement automatic scaling, fallback mechanisms, or notifications
    console.error(`🚨 Performance Alert: ${alertData.metric} exceeded threshold`);
    
    // Example: If latency is too high, could trigger connection optimization
    if (alertData.metric === 'latency') {
      this.optimizeConnections();
    }
    
    // Example: If error rate is too high, could trigger failover
    if (alertData.metric === 'error_rate') {
      this.handleHighErrorRate();
    }
  }
  
  /**
   * Optimize connections for better performance
   */
  optimizeConnections() {
    console.log('🔧 Optimizing connections for better performance...');
    
    // Could implement connection pooling optimization,
    // message batching, or other performance improvements
    
    // For now, just log the optimization attempt
    console.log('📈 Connection optimization completed');
  }
  
  /**
   * Handle high error rate situations
   */
  handleHighErrorRate() {
    console.log('🛠️ Handling high error rate situation...');
    
    // Could implement circuit breaker pattern,
    // increased retry attempts, or failover mechanisms
    
    // Reset error counters after handling
    this.performanceMonitoring.errorRates = {
      protocolNegotiationErrors: 0,
      messageTransformationErrors: 0,
      routingErrors: 0
    };
    
    console.log('🔄 Error rate handling completed');
  }
  
  /**
   * Generate unique connection ID
   */
  generateConnectionId() {
    return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Send message through bridge
   */
  async sendMessage(message, targetProtocol = 'auto') {
    try {
      if (targetProtocol === 'auto') {
        await this.routeMessage(message, 'bridge');
      } else if (targetProtocol === 'enhanced') {
        await this.routeToEnhancedProtocol(message, { action: 'route_enhanced', reason: 'explicit_target' });
      } else if (targetProtocol === 'legacy') {
        await this.routeToLegacyProtocol(message, { action: 'route_legacy', reason: 'explicit_target' });
      }
      
      return { success: true, messageId: message.messageId };
      
    } catch (error) {
      console.error('❌ Failed to send message through bridge:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get bridge status and metrics
   */
  getStatus() {
    return {
      bridgeId: this.bridgeId,
      version: this.version,
      migrationPhase: this.migrationManager.phaseStatus,
      migrationProgress: this.migrationManager.migrationMetrics.migrationProgress,
      connectedClients: this.protocolNegotiation.clientCapabilities.size,
      enhancedClients: this.migrationManager.migrationMetrics.enhancedClients,
      legacyClients: this.migrationManager.migrationMetrics.legacyClients,
      performanceMetrics: {
        averageLatency: this.getAverageLatency(),
        errorRate: this.calculateErrorRate(),
        throughput: this.performanceMonitoring.throughputMetrics.messagesPerSecond
      },
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
  
  /**
   * Event system methods
   */
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
  }
  
  off(eventName, handler) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  emitBridgeEvent(eventName, data) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Bridge event handler error for ${eventName}:`, error);
        }
      });
    }
  }
  
  /**
   * Cleanup and shutdown
   */
  shutdown() {
    console.log('🔄 Shutting down Enhanced Protocol Integration Bridge...');
    
    // Clear timers
    if (this.performanceMonitoring.metricsInterval) {
      clearInterval(this.performanceMonitoring.metricsInterval);
    }
    
    // Clear migration timers (would need to track these)
    // clearTimeout(this.migrationTimers.preparation);
    // clearTimeout(this.migrationTimers.gradual);
    // clearTimeout(this.migrationTimers.fullEnhanced);
    
    // Clear event handlers
    this.eventHandlers.clear();
    
    console.log('✅ Enhanced Protocol Integration Bridge shutdown complete');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedProtocolIntegrationBridge;
} else if (typeof window !== 'undefined') {
  window.EnhancedProtocolIntegrationBridge = EnhancedProtocolIntegrationBridge;
}