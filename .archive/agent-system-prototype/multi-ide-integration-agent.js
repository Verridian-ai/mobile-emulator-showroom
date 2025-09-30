/**
 * Multi-IDE Integration Agent
 * Provides seamless integration with multiple IDE systems for enhanced human-AI collaboration
 * Part of the Verridian AI Mobile Testing Platform
 */

class MultiIDEIntegrationAgent {
  constructor(options = {}) {
    this.options = {
      brokerURL: options.brokerURL || `ws://localhost:${window.BROKER_PORT || 7071}`,
      brokerToken: options.brokerToken || window.BROWSERLESS_TOKEN || 'default-token',
      maxContextSize: options.maxContextSize || 50000, // Max context size in characters
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      enableAutoSync: options.enableAutoSync !== false,
      syncInterval: options.syncInterval || 5000,
      supportedIDEs: options.supportedIDEs || ['claude-code', 'cursor', 'windsurf', 'vscode', 'webstorm'],
      ...options
    };

    // Core properties
    this.brokerWs = null;
    this.clientId = null;
    this.isRegistered = false;
    this.isActive = true;

    // IDE connections and context management
    this.connectedIDEs = new Map();
    this.contextSessions = new Map();
    this.sharedContext = {
      screenshots: [],
      elements: [],
      codeSnippets: [],
      testResults: [],
      deviceState: {},
      userNotes: [],
      timestamp: Date.now()
    };

    // Agent integration references
    this.screenshotAgent = null;
    this.elementAgent = null;
    this.deviceAgent = null;

    // Performance monitoring
    this.metrics = {
      contextsShared: 0,
      ideConnections: 0,
      syncOperations: 0,
      errors: 0,
      lastActivity: Date.now()
    };

    // UI elements
    this.uiContainer = null;
    this.statusIndicator = null;
    this.ideList = null;
    this.contextViewer = null;

    console.log('🔗 Multi-IDE Integration Agent initialized', this.options);
    this.createUI();
  }

  /**
   * Initialize the Multi-IDE Integration Agent
   */
  async init() {
    try {
      console.log('🚀 Initializing Multi-IDE Integration Agent...');

      // Connect to WebSocket broker
      await this.connectToBroker();

      // Discover and connect to other agents
      await this.discoverAgents();

      // Start context synchronization
      if (this.options.enableAutoSync) {
        this.startAutoSync();
      }

      // Set up event listeners
      this.setupEventListeners();

      console.log('✅ Multi-IDE Integration Agent ready');
      this.updateUI();

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Multi-IDE Integration Agent:', error);
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Connect to WebSocket broker
   */
  async connectToBroker() {
    return new Promise((resolve, reject) => {
      console.log('🔄 Connecting to WebSocket broker...');
      
      const wsUrl = `${this.options.brokerURL}?token=${this.options.brokerToken}&role=multi-ide-agent`;
      this.brokerWs = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        reject(new Error('Broker connection timeout'));
      }, 10000);

      this.brokerWs.onopen = () => {
        console.log('✅ Connected to broker');
        clearTimeout(timeout);
        this.registerAgent();
        resolve();
      };

      this.brokerWs.onmessage = (event) => {
        this.handleBrokerMessage(event);
      };

      this.brokerWs.onclose = () => {
        console.log('❌ Disconnected from broker');
        this.isRegistered = false;
        this.updateUI();
        
        // Auto-reconnect
        setTimeout(() => {
          if (this.isActive && !this.isRegistered) {
            this.connectToBroker().catch(console.error);
          }
        }, 3000);
      };

      this.brokerWs.onerror = (error) => {
        console.error('❌ Broker connection error:', error);
        clearTimeout(timeout);
        this.metrics.errors++;
        reject(error);
      };
    });
  }

  /**
   * Register agent with broker
   */
  registerAgent() {
    const registrationData = {
      type: 'agent_registration',
      role: 'multi-ide-integration',
      capabilities: [
        'context-sharing',
        'ide-integration',
        'code-synchronization',
        'collaborative-editing',
        'session-management',
        'cross-platform-communication'
      ],
      supportedIDEs: this.options.supportedIDEs,
      timestamp: Date.now()
    };

    console.log('🤖 Registering Multi-IDE Integration Agent...');
    this.sendToBroker(registrationData);
  }

  /**
   * Handle incoming WebSocket messages
   */
  async handleBrokerMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'registration_success':
          this.handleRegistrationSuccess(data);
          break;
        case 'ide_connection_request':
          await this.handleIDEConnectionRequest(data);
          break;
        case 'context_share_request':
          await this.handleContextShareRequest(data);
          break;
        case 'code_sync_request':
          await this.handleCodeSyncRequest(data);
          break;
        case 'agent_discovery':
          this.handleAgentDiscovery(data);
          break;
        case 'screenshot_captured':
          this.handleScreenshotUpdate(data);
          break;
        case 'element_selected':
          this.handleElementUpdate(data);
          break;
        case 'device_state_change':
          this.handleDeviceStateChange(data);
          break;
        case 'ide_disconnect':
          this.handleIDEDisconnect(data);
          break;
        default:
          console.log('📨 Unhandled message type:', data.type);
      }
    } catch (error) {
      console.error('❌ Failed to handle broker message:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Handle successful agent registration
   */
  handleRegistrationSuccess(data) {
    this.isRegistered = true;
    this.clientId = data.clientId;
    console.log('✅ Multi-IDE Integration Agent registered:', this.clientId);
    this.updateUI();
  }

  /**
   * Handle IDE connection requests
   */
  async handleIDEConnectionRequest(data) {
    const { ideType, ideId, capabilities, metadata } = data;
    
    console.log(`🔌 IDE connection request from ${ideType} (${ideId})`);

    try {
      // Validate IDE type
      if (!this.options.supportedIDEs.includes(ideType)) {
        throw new Error(`Unsupported IDE type: ${ideType}`);
      }

      // Create IDE session
      const ideSession = {
        id: ideId,
        type: ideType,
        capabilities,
        metadata,
        connected: true,
        lastActivity: Date.now(),
        contextSize: 0,
        sharedContexts: 0
      };

      this.connectedIDEs.set(ideId, ideSession);
      this.metrics.ideConnections++;

      // Send connection confirmation
      this.sendToBroker({
        type: 'ide_connection_response',
        status: 'success',
        ideId,
        capabilities: [
          'context-sharing',
          'screenshot-integration',
          'element-analysis',
          'device-context',
          'collaborative-editing'
        ],
        timestamp: Date.now()
      });

      // Share current context with new IDE
      await this.shareContextWithIDE(ideId);

      console.log(`✅ IDE connected: ${ideType} (${ideId})`);
      this.updateUI();

    } catch (error) {
      console.error(`❌ Failed to connect IDE ${ideType}:`, error);
      this.metrics.errors++;
      
      this.sendToBroker({
        type: 'ide_connection_response',
        status: 'error',
        ideId,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle context sharing requests from IDEs
   */
  async handleContextShareRequest(data) {
    const { ideId, requestType, contextData, options = {} } = data;
    
    console.log(`📤 Context share request from IDE ${ideId}: ${requestType}`);

    try {
      let responseData;

      switch (requestType) {
        case 'full_context':
          responseData = await this.prepareFullContext(options);
          break;
        case 'screenshots':
          responseData = await this.prepareScreenshotContext(options);
          break;
        case 'elements':
          responseData = await this.prepareElementContext(options);
          break;
        case 'device_state':
          responseData = await this.prepareDeviceContext(options);
          break;
        case 'code_snippets':
          responseData = await this.prepareCodeContext(options);
          break;
        default:
          throw new Error(`Unknown context request type: ${requestType}`);
      }

      // Send context to requesting IDE
      this.sendToBroker({
        type: 'context_share_response',
        ideId,
        requestType,
        contextData: responseData,
        metadata: {
          contextSize: JSON.stringify(responseData).length,
          timestamp: Date.now(),
          agentVersion: '1.0.0'
        }
      });

      // Update metrics
      this.metrics.contextsShared++;
      const ideSession = this.connectedIDEs.get(ideId);
      if (ideSession) {
        ideSession.sharedContexts++;
        ideSession.lastActivity = Date.now();
      }

      console.log(`✅ Context shared with IDE ${ideId}`);
      
    } catch (error) {
      console.error(`❌ Failed to share context with IDE ${ideId}:`, error);
      this.metrics.errors++;
      
      this.sendToBroker({
        type: 'context_share_error',
        ideId,
        requestType,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle code synchronization requests
   */
  async handleCodeSyncRequest(data) {
    const { ideId, syncType, codeData, targetIDE } = data;
    
    console.log(`🔄 Code sync request from IDE ${ideId}: ${syncType}`);

    try {
      // Add to shared context
      if (syncType === 'code_snippet' && codeData) {
        this.sharedContext.codeSnippets.push({
          id: `snippet-${Date.now()}`,
          ideId,
          code: codeData.code,
          language: codeData.language,
          filename: codeData.filename,
          description: codeData.description,
          timestamp: Date.now()
        });

        // Limit context size
        this.limitContextSize();
      }

      // Broadcast to other connected IDEs
      const targetIDEs = targetIDE ? [targetIDE] : 
                        Array.from(this.connectedIDEs.keys()).filter(id => id !== ideId);

      for (const targetId of targetIDEs) {
        this.sendToBroker({
          type: 'code_sync_broadcast',
          targetIdeId: targetId,
          sourceIdeId: ideId,
          syncType,
          codeData,
          timestamp: Date.now()
        });
      }

      this.metrics.syncOperations++;
      console.log(`✅ Code synchronized from IDE ${ideId} to ${targetIDEs.length} IDEs`);
      
    } catch (error) {
      console.error(`❌ Failed to sync code from IDE ${ideId}:`, error);
      this.metrics.errors++;
    }
  }

  /**
   * Discover and connect to other agents
   */
  async discoverAgents() {
    console.log('🔍 Discovering other agents...');

    // Send discovery request
    this.sendToBroker({
      type: 'agent_discovery_request',
      requestedAgents: ['screenshot-capture', 'element-selection', 'device-context'],
      timestamp: Date.now()
    });

    // Try to find agents in global scope
    if (window.screenshotCaptureAgent) {
      this.screenshotAgent = window.screenshotCaptureAgent;
      console.log('✅ Found Screenshot Capture Agent');
    }

    if (window.elementSelectionAgent) {
      this.elementAgent = window.elementSelectionAgent;
      console.log('✅ Found Element Selection Agent');
    }
  }

  /**
   * Handle agent discovery responses
   */
  handleAgentDiscovery(data) {
    const { agentType, agentId, capabilities } = data;
    
    console.log(`🔍 Discovered agent: ${agentType} (${agentId})`);

    // Update agent references
    switch (agentType) {
      case 'screenshot-capture':
        if (window.screenshotCaptureAgent) {
          this.screenshotAgent = window.screenshotCaptureAgent;
        }
        break;
      case 'element-selection':
        if (window.elementSelectionAgent) {
          this.elementAgent = window.elementSelectionAgent;
        }
        break;
    }
  }

  /**
   * Handle screenshot updates from Screenshot Capture Agent
   */
  handleScreenshotUpdate(data) {
    const { screenshot, captureType, metadata } = data;
    
    console.log(`📸 Screenshot update: ${captureType}`);

    // Add to shared context
    this.sharedContext.screenshots.push({
      id: `screenshot-${Date.now()}`,
      data: screenshot,
      type: captureType,
      metadata,
      timestamp: Date.now()
    });

    // Limit context size
    this.limitContextSize();

    // Auto-share with connected IDEs
    if (this.options.enableAutoSync) {
      this.broadcastContextUpdate('screenshot', data);
    }
  }

  /**
   * Handle element updates from Element Selection Agent
   */
  handleElementUpdate(data) {
    const { element, elementData, analysis } = data;
    
    console.log('🎯 Element update received');

    // Add to shared context
    this.sharedContext.elements.push({
      id: `element-${Date.now()}`,
      element,
      data: elementData,
      analysis,
      timestamp: Date.now()
    });

    // Limit context size
    this.limitContextSize();

    // Auto-share with connected IDEs
    if (this.options.enableAutoSync) {
      this.broadcastContextUpdate('element', data);
    }
  }

  /**
   * Handle device state changes
   */
  handleDeviceStateChange(data) {
    console.log('📱 Device state change received');

    this.sharedContext.deviceState = {
      ...data,
      timestamp: Date.now()
    };

    // Auto-share with connected IDEs
    if (this.options.enableAutoSync) {
      this.broadcastContextUpdate('device_state', data);
    }
  }

  /**
   * Handle IDE disconnection
   */
  handleIDEDisconnect(data) {
    const { ideId } = data;
    
    if (this.connectedIDEs.has(ideId)) {
      const ideSession = this.connectedIDEs.get(ideId);
      console.log(`🔌 IDE disconnected: ${ideSession.type} (${ideId})`);
      
      this.connectedIDEs.delete(ideId);
      this.updateUI();
    }
  }

  /**
   * Prepare full context for sharing
   */
  async prepareFullContext(options = {}) {
    const context = {
      ...this.sharedContext,
      metadata: {
        totalSize: JSON.stringify(this.sharedContext).length,
        itemCounts: {
          screenshots: this.sharedContext.screenshots.length,
          elements: this.sharedContext.elements.length,
          codeSnippets: this.sharedContext.codeSnippets.length,
          testResults: this.sharedContext.testResults.length
        },
        timestamp: Date.now()
      }
    };

    // Apply filters if specified
    if (options.maxItems) {
      context.screenshots = context.screenshots.slice(-options.maxItems);
      context.elements = context.elements.slice(-options.maxItems);
      context.codeSnippets = context.codeSnippets.slice(-options.maxItems);
    }

    return context;
  }

  /**
   * Prepare screenshot-specific context
   */
  async prepareScreenshotContext(options = {}) {
    let screenshots = [...this.sharedContext.screenshots];

    if (options.captureType) {
      screenshots = screenshots.filter(s => s.type === options.captureType);
    }

    if (options.maxItems) {
      screenshots = screenshots.slice(-options.maxItems);
    }

    return {
      screenshots,
      metadata: {
        count: screenshots.length,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Prepare element-specific context
   */
  async prepareElementContext(options = {}) {
    let elements = [...this.sharedContext.elements];

    if (options.maxItems) {
      elements = elements.slice(-options.maxItems);
    }

    return {
      elements,
      metadata: {
        count: elements.length,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Prepare device-specific context
   */
  async prepareDeviceContext(options = {}) {
    return {
      deviceState: this.sharedContext.deviceState,
      metadata: {
        timestamp: Date.now()
      }
    };
  }

  /**
   * Prepare code-specific context
   */
  async prepareCodeContext(options = {}) {
    let codeSnippets = [...this.sharedContext.codeSnippets];

    if (options.language) {
      codeSnippets = codeSnippets.filter(c => c.language === options.language);
    }

    if (options.maxItems) {
      codeSnippets = codeSnippets.slice(-options.maxItems);
    }

    return {
      codeSnippets,
      metadata: {
        count: codeSnippets.length,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Share context with specific IDE
   */
  async shareContextWithIDE(ideId, contextType = 'full_context') {
    try {
      const contextData = await this.prepareFullContext();
      
      this.sendToBroker({
        type: 'context_share_push',
        ideId,
        contextType,
        contextData,
        timestamp: Date.now()
      });

      console.log(`✅ Context shared with IDE ${ideId}`);
      
    } catch (error) {
      console.error(`❌ Failed to share context with IDE ${ideId}:`, error);
      this.metrics.errors++;
    }
  }

  /**
   * Broadcast context updates to all connected IDEs
   */
  broadcastContextUpdate(updateType, data) {
    for (const ideId of this.connectedIDEs.keys()) {
      this.sendToBroker({
        type: 'context_update_broadcast',
        ideId,
        updateType,
        data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Start automatic context synchronization
   */
  startAutoSync() {
    console.log('🔄 Starting auto-sync...');
    
    this.autoSyncInterval = setInterval(() => {
      if (this.connectedIDEs.size > 0) {
        this.performAutoSync();
      }
    }, this.options.syncInterval);
  }

  /**
   * Perform automatic synchronization
   */
  async performAutoSync() {
    try {
      // Sync with all connected IDEs
      for (const ideId of this.connectedIDEs.keys()) {
        await this.shareContextWithIDE(ideId);
      }

      this.metrics.syncOperations++;
      console.log(`✅ Auto-sync completed for ${this.connectedIDEs.size} IDEs`);
      
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Limit shared context size to prevent memory issues
   */
  limitContextSize() {
    const maxItems = 50; // Maximum items per category
    const currentSize = JSON.stringify(this.sharedContext).length;

    if (currentSize > this.options.maxContextSize) {
      console.log(`📏 Context size limit reached (${currentSize}), trimming...`);
      
      // Trim oldest items first
      this.sharedContext.screenshots = this.sharedContext.screenshots.slice(-maxItems);
      this.sharedContext.elements = this.sharedContext.elements.slice(-maxItems);
      this.sharedContext.codeSnippets = this.sharedContext.codeSnippets.slice(-maxItems);
      this.sharedContext.testResults = this.sharedContext.testResults.slice(-maxItems);
      this.sharedContext.userNotes = this.sharedContext.userNotes.slice(-maxItems);
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'i':
            if (event.shiftKey) {
              event.preventDefault();
              this.toggleUI();
            }
            break;
          case 's':
            if (event.shiftKey) {
              event.preventDefault();
              this.shareCurrentContext();
            }
            break;
        }
      }
    });

    // Window beforeunload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Share current context manually
   */
  async shareCurrentContext() {
    try {
      if (this.connectedIDEs.size === 0) {
        console.log('⚠️ No IDEs connected for context sharing');
        return;
      }

      for (const ideId of this.connectedIDEs.keys()) {
        await this.shareContextWithIDE(ideId);
      }

      console.log(`✅ Manual context share completed for ${this.connectedIDEs.size} IDEs`);
      
    } catch (error) {
      console.error('❌ Manual context share failed:', error);
      this.metrics.errors++;
    }
  }