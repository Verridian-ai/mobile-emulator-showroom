/**
 * DEVICE SKIN CONTEXT AGENT
 * Manages device types, skins, and visual context for mobile emulation
 * Integrates with WebSocket broker for real-time collaboration
 */

class DeviceSkinContextAgent {
  constructor(options = {}) {
    this.agentId = 'device-skin-context-agent';
    this.version = '1.0.0';
    this.name = 'Device Skin Context Agent';
    
    // WebSocket broker connection
    this.brokerWs = null;
    this.brokerURL = options.brokerURL || `ws://${window.location.hostname}:${window.location.port.replace('5174', '7071')}`;
    this.brokerToken = options.brokerToken || 'verridian-device-context';
    this.isRegistered = false;
    
    // Device and skin management
    this.currentDevice = null;
    this.currentSkin = null;
    this.deviceDefinitions = new Map();
    this.skinTemplates = new Map();
    this.deviceContext = {};
    
    // Visual context management
    this.visualContext = {
      deviceBounds: null,
      screenBounds: null,
      orientation: 'portrait',
      scale: 1,
      theme: 'auto'
    };
    
    // Performance monitoring
    this.performanceMetrics = {
      skinSwitches: 0,
      deviceChanges: 0,
      averageSwitchTime: 0,
      lastSwitchTime: null
    };
    
    // UI controls
    this.controlPanel = null;
    this.deviceSelector = null;
    this.skinSelector = null;
    
    // Agent discovery
    this.discoveredAgents = new Set();
    this.agentCapabilities = new Map();
    
    console.log('🎨 Device Skin Context Agent initialized');
  }
  
  async init() {
    try {
      console.log('🚀 Initializing Device Skin Context Agent...');
      
      // Load device definitions
      this.loadDeviceDefinitions();
      
      // Load skin templates
      this.loadSkinTemplates();
      
      // Connect to broker
      await this.connectToBroker();
      
      // Initialize UI controls
      this.initializeUIControls();
      
      // Start device detection
      this.startDeviceDetection();
      
      // Discover other agents
      await this.discoverAgents();
      
      console.log('✅ Device Skin Context Agent ready');
      return { success: true, agent: this.agentId };
      
    } catch (error) {
      console.error('❌ Failed to initialize Device Skin Context Agent:', error);
      throw error;
    }
  }
  
  /**
   * Connect to WebSocket broker
   */
  async connectToBroker() {
    try {
      console.log('🔄 Connecting to broker...');
      
      this.brokerWs = new WebSocket(`${this.brokerURL}?token=${this.brokerToken}&agent=${this.agentId}`);
      
      return new Promise((resolve, reject) => {
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
          // Auto-reconnect after delay
          setTimeout(() => {
            if (!this.isRegistered) {
              this.connectToBroker();
            }
          }, 5000);
        };
        
        this.brokerWs.onerror = (error) => {
          console.error('❌ Broker connection error:', error);
          clearTimeout(timeout);
          reject(error);
        };
      });
      
    } catch (error) {
      console.error('❌ Failed to connect to broker:', error);
      throw error;
    }
  }
  
  /**
   * Register agent with broker
   */
  registerAgent() {
    const registrationMessage = {
      role: 'specialized-agent',
      agentId: this.agentId,
      name: this.name,
      version: this.version,
      capabilities: [
        'device-management',
        'skin-customization',
        'context-tracking',
        'visual-context-capture',
        'device-detection',
        'orientation-management',
        'theme-management'
      ],
      supportedDevices: Array.from(this.deviceDefinitions.keys()),
      availableSkins: Array.from(this.skinTemplates.keys()),
      timestamp: Date.now()
    };
    
    console.log('🤖 Registering with broker...');
    this.brokerWs.send(JSON.stringify(registrationMessage));
  }
  
  /**
   * Handle incoming broker messages
   */
  async handleBrokerMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received from broker:', data.type || 'unknown');
      
      // Handle registration confirmation
      if (data.ok && data.registered === 'specialized-agent') {
        this.isRegistered = true;
        console.log('✅ Registered as specialized agent');
        return;
      }
      
      // Handle agent requests
      if (data.type) {
        await this.handleAgentRequest(data);
      }
      
    } catch (error) {
      console.error('❌ Failed to handle broker message:', error);
    }
  }
  
  /**
   * Handle agent-specific requests
   */
  async handleAgentRequest(data) {
    const { type, requestId, ...payload } = data;
    
    try {
      let response;
      
      switch (type) {
        case 'device_change_request':
          response = await this.handleDeviceChangeRequest(payload);
          break;
        case 'skin_change_request':
          response = await this.handleSkinChangeRequest(payload);
          break;
        case 'context_update_request':
          response = await this.handleContextUpdateRequest(payload);
          break;
        case 'get_device_context':
          response = await this.getDeviceContext();
          break;
        case 'get_visual_context':
          response = await this.getVisualContext();
          break;
        case 'orientation_change':
          response = await this.handleOrientationChange(payload);
          break;
        default:
          response = { error: `Unknown request type: ${type}` };
      }
      
      // Send response back to broker
      this.sendResponseToBroker(requestId, type, response);
      
    } catch (error) {
      console.error(`❌ Failed to handle ${type}:`, error);
      this.sendErrorToBroker(requestId, type, error.message);
    }
  }
  
  /**
   * Load device definitions
   */
  loadDeviceDefinitions() {
    const devices = [
      {
        id: 'iphone-15-pro',
        name: 'iPhone 15 Pro',
        category: 'smartphone',
        dimensions: { width: 393, height: 852 },
        pixelRatio: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        skin: 'ios-modern',
        features: ['dynamic-island', 'home-indicator', 'rounded-corners']
      },
      {
        id: 'samsung-galaxy-s24-ultra',
        name: 'Samsung Galaxy S24 Ultra',
        category: 'smartphone',
        dimensions: { width: 412, height: 915 },
        pixelRatio: 3.5,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36',
        skin: 'android-premium',
        features: ['punch-hole-camera', 'rounded-corners', 's-pen']
      },
      {
        id: 'ipad-pro-12-9',
        name: 'iPad Pro 12.9"',
        category: 'tablet',
        dimensions: { width: 1024, height: 1366 },
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        skin: 'ios-tablet',
        features: ['rounded-corners', 'home-indicator', 'camera-notch']
      },
      {
        id: 'pixel-8-pro',
        name: 'Google Pixel 8 Pro',
        category: 'smartphone',
        dimensions: { width: 412, height: 892 },
        pixelRatio: 2.625,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36',
        skin: 'pixel-material',
        features: ['pill-camera', 'rounded-corners', 'gesture-nav']
      }
    ];
    
    devices.forEach(device => {
      this.deviceDefinitions.set(device.id, device);
    });
    
    console.log(`📱 Loaded ${devices.length} device definitions`);
  }
  
  /**
   * Load skin templates
   */
  loadSkinTemplates() {
    const skins = [
      {
        id: 'ios-modern',
        name: 'iOS Modern',
        category: 'ios',
        elements: {
          bezel: { color: '#1a1a1a', width: 8 },
          dynamicIsland: { enabled: true, color: '#000000' },
          homeIndicator: { enabled: true, color: '#ffffff' },
          corners: { radius: 44 }
        },
        customization: {
          colors: ['#1a1a1a', '#2c2c2e', '#48484a', '#636366'],
          bezels: ['thin', 'medium', 'thick'],
          corners: ['sharp', 'rounded', 'extra-rounded']
        }
      },
      {
        id: 'android-premium',
        name: 'Android Premium',
        category: 'android',
        elements: {
          bezel: { color: '#202124', width: 6 },
          camera: { type: 'punch-hole', position: 'top-center' },
          corners: { radius: 28 }
        },
        customization: {
          colors: ['#202124', '#303134', '#5f6368', '#9aa0a6'],
          bezels: ['minimal', 'standard', 'premium'],
          corners: ['minimal', 'standard', 'curved']
        }
      },
      {
        id: 'ios-tablet',
        name: 'iOS Tablet',
        category: 'ios-tablet',
        elements: {
          bezel: { color: '#1a1a1a', width: 12 },
          homeIndicator: { enabled: true, color: '#ffffff' },
          cameraNotch: { enabled: true, position: 'top-center' },
          corners: { radius: 18 }
        },
        customization: {
          colors: ['#1a1a1a', '#2c2c2e', '#48484a'],
          bezels: ['thin', 'standard', 'thick']
        }
      },
      {
        id: 'pixel-material',
        name: 'Pixel Material',
        category: 'pixel',
        elements: {
          bezel: { color: '#1f1f1f', width: 4 },
          camera: { type: 'pill', position: 'top-center' },
          gestureBar: { enabled: true, color: '#ffffff' },
          corners: { radius: 24 }
        },
        customization: {
          colors: ['#1f1f1f', '#292a2d', '#3c4043', '#5f6368'],
          bezels: ['minimal', 'pixel', 'enhanced']
        }
      }
    ];
    
    skins.forEach(skin => {
      this.skinTemplates.set(skin.id, skin);
    });
    
    console.log(`🎨 Loaded ${skins.length} skin templates`);
  }