/**
 * FRONTEND INTEGRATION AGENT
 * Coordinates all UI elements, manages state synchronization, and provides seamless frontend experience
 * Integrates with WebSocket broker for real-time collaboration
 */

class FrontendIntegrationAgent {
  constructor(options = {}) {
    this.agentId = 'frontend-integration-agent';
    this.version = '1.0.0';
    this.name = 'Frontend Integration Agent';
    
    // WebSocket broker connection
    this.brokerWs = null;
    this.brokerURL = options.brokerURL || `ws://${window.location.hostname}:${window.location.port.replace('5174', '7071')}`;
    this.brokerToken = options.brokerToken || 'verridian-frontend-integration';
    this.isRegistered = false;
    
    // UI State Management
    this.uiState = {
      activeDevice: null,
      currentSkin: null,
      selectedElements: new Set(),
      screenshots: new Map(),
      collaborationStatus: false,
      ideConnections: new Map(),
      aiRequestsInProgress: new Set()
    };
    
    // Cross-Agent Communication
    this.registeredAgents = new Map();
    this.agentStates = new Map();
    this.eventBus = new EventTarget();
    
    // DOM Observers
    this.domObserver = null;
    this.resizeObserver = null;
    this.intersectionObserver = null;
    
    // Theme Management
    this.themeManager = {
      currentTheme: 'cosmic-dark',
      customProperties: new Map(),
      themeVariables: {
        'cosmic-dark': {
          '--primary-color': 'rgba(107, 70, 193, 1)',
          '--secondary-color': 'rgba(139, 69, 19, 1)',
          '--background-primary': 'rgba(16, 0, 43, 0.95)',
          '--background-secondary': 'rgba(10, 0, 32, 0.9)',
          '--text-primary': 'rgba(255, 255, 255, 0.9)',
          '--text-secondary': 'rgba(255, 255, 255, 0.7)',
          '--accent-glow': 'rgba(107, 70, 193, 0.3)',
          '--glass-bg': 'rgba(255, 255, 255, 0.1)',
          '--glass-border': 'rgba(255, 255, 255, 0.2)'
        },
        'cosmic-light': {
          '--primary-color': 'rgba(107, 70, 193, 1)',
          '--secondary-color': 'rgba(139, 69, 19, 1)',
          '--background-primary': 'rgba(248, 250, 252, 0.95)',
          '--background-secondary': 'rgba(241, 245, 249, 0.9)',
          '--text-primary': 'rgba(15, 23, 42, 0.9)',
          '--text-secondary': 'rgba(51, 65, 85, 0.8)',
          '--accent-glow': 'rgba(107, 70, 193, 0.2)',
          '--glass-bg': 'rgba(255, 255, 255, 0.7)',
          '--glass-border': 'rgba(0, 0, 0, 0.1)'
        }
      }
    };
    
    // Responsive Layout System
    this.layoutSystem = {
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1440
      },
      currentBreakpoint: 'desktop',
      layoutConfigs: new Map()
    };
    
    // Component Registry
    this.componentRegistry = new Map();
    this.componentStates = new Map();
    
    // Performance Monitoring
    this.performanceMetrics = {
      renderTimes: [],
      stateUpdates: 0,
      domMutations: 0,
      memoryUsage: [],
      lastUpdate: Date.now()
    };
    
    console.log('🎨 Frontend Integration Agent initialized');
  }
  
  async init() {
    try {
      console.log('🚀 Initializing Frontend Integration Agent...');
      
      // Connect to broker
      await this.connectToBroker();
      
      // Initialize DOM observers
      this.setupDOMObservers();
      
      // Initialize responsive layout system
      this.initializeLayoutSystem();
      
      // Initialize theme management
      this.initializeThemeManager();
      
      // Setup component registry
      this.initializeComponentRegistry();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Setup global event handlers
      this.setupGlobalEventHandlers();
      
      // Discover and register existing agents
      await this.discoverAgents();
      
      console.log('✅ Frontend Integration Agent ready');
      return { success: true, agent: this.agentId };
      
    } catch (error) {
      console.error('❌ Failed to initialize Frontend Integration Agent:', error);
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
          // Auto-reconnect
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
        'ui-state-management',
        'cross-agent-coordination',
        'theme-management',
        'responsive-layout',
        'dom-observation',
        'performance-monitoring',
        'component-registry',
        'event-bus-management'
      ],
      supportedComponents: Array.from(this.componentRegistry.keys()),
      currentTheme: this.themeManager.currentTheme,
      layoutBreakpoint: this.layoutSystem.currentBreakpoint,
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
        case 'ui_state_update':
          response = await this.handleUIStateUpdate(payload);
          break;
        case 'theme_change_request':
          response = await this.handleThemeChange(payload);
          break;
        case 'layout_update_request':
          response = await this.handleLayoutUpdate(payload);
          break;
        case 'component_register_request':
          response = await this.handleComponentRegistration(payload);
          break;
        case 'performance_report_request':
          response = await this.getPerformanceReport();
          break;
        case 'agent_coordination_request':
          response = await this.handleAgentCoordination(payload);
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
   * Setup DOM observers for real-time monitoring
   */
  setupDOMObservers() {
    // Mutation Observer for DOM changes
    this.domObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        this.handleDOMChange(mutation);
      });
    });
    
    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });
    
    // Resize Observer for responsive updates
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        this.handleElementResize(entry);
      });
    });
    
    // Intersection Observer for visibility tracking
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.handleElementVisibility(entry);
      });
    });
    
    console.log('👁️ DOM observers initialized');
  }
  
  /**
   * Initialize responsive layout system
   */
  initializeLayoutSystem() {
    // Set initial breakpoint
    this.updateBreakpoint();
    
    // Listen for window resize
    window.addEventListener('resize', () => {
      this.updateBreakpoint();
    });
    
    // Listen for orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateBreakpoint();
        this.handleOrientationChange();
      }, 100);
    });
    
    console.log('📱 Responsive layout system initialized');
  }
  
  /**
   * Initialize theme management
   */
  initializeThemeManager() {
    // Apply current theme
    this.applyTheme(this.themeManager.currentTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', (e) => {
        if (this.themeManager.currentTheme === 'auto') {
          this.applyTheme(e.matches ? 'cosmic-dark' : 'cosmic-light');
        }
      });
      
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionQuery.addEventListener('change', (e) => {
        this.handleReducedMotionPreference(e.matches);
      });
    }
    
    console.log('🎨 Theme management initialized');
  }
  
  /**
   * Initialize component registry
   */
  initializeComponentRegistry() {
    // Register core components
    const coreComponents = [
      'device-selector',
      'device-emulator',
      'screenshot-overlay',
      'collaboration-panel',
      'ide-connections',
      'ai-chat-interface'
    ];
    
    coreComponents.forEach(componentId => {
      this.registerComponent(componentId, {
        type: 'core',
        state: 'idle',
        element: document.getElementById(componentId) || null,
        observers: new Set()
      });
    });
    
    console.log('📦 Component registry initialized');
  }
  
  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    // Monitor render performance
    if (window.performance && window.performance.mark) {
      setInterval(() => {
        this.collectPerformanceMetrics();
      }, 5000);
    }
    
    // Monitor memory usage if available
    if (window.performance && window.performance.memory) {
      setInterval(() => {
        this.collectMemoryMetrics();
      }, 10000);
    }
    
    console.log('📊 Performance monitoring started');
  }
  
  /**
   * Setup global event handlers
   */
  setupGlobalEventHandlers() {
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Handle focus changes
    window.addEventListener('focus', () => {
      this.handleWindowFocus(true);
    });
    
    window.addEventListener('blur', () => {
      this.handleWindowFocus(false);
    });
    
    // Handle network status
    if ('onLine' in navigator) {
      window.addEventListener('online', () => {
        this.handleNetworkStatusChange(true);
      });
      
      window.addEventListener('offline', () => {
        this.handleNetworkStatusChange(false);
      });
    }
    
    console.log('🌐 Global event handlers initialized');
  }
  
  /**
   * Handle UI state updates
   */
  async handleUIStateUpdate(payload) {
    const { component, state, data } = payload;
    
    const startTime = performance.now();
    
    try {
      // Update internal state
      if (component && this.componentStates.has(component)) {
        this.componentStates.set(component, { ...this.componentStates.get(component), ...state });
      }
      
      // Apply visual updates
      this.applyStateToDOM(component, state, data);
      
      // Notify other components
      this.eventBus.dispatchEvent(new CustomEvent('ui-state-updated', {
        detail: { component, state, data }
      }));
      
      const endTime = performance.now();
      this.performanceMetrics.renderTimes.push(endTime - startTime);
      this.performanceMetrics.stateUpdates++;
      
      return { success: true, component, updateTime: endTime - startTime };
      
    } catch (error) {
      console.error('❌ Failed to update UI state:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Handle theme changes
   */
  async handleThemeChange(payload) {
    const { theme, customProperties } = payload;
    
    try {
      if (theme && this.themeManager.themeVariables[theme]) {
        this.applyTheme(theme);
        this.themeManager.currentTheme = theme;
      }
      
      if (customProperties) {
        Object.entries(customProperties).forEach(([property, value]) => {
          document.documentElement.style.setProperty(property, value);
          this.themeManager.customProperties.set(property, value);
        });
      }
      
      // Notify components of theme change
      this.eventBus.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme, customProperties }
      }));
      
      return { success: true, theme, customProperties: customProperties || {} };
      
    } catch (error) {
      console.error('❌ Failed to change theme:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Apply theme to DOM
   */
  applyTheme(themeName) {
    const themeVars = this.themeManager.themeVariables[themeName];
    if (!themeVars) return;
    
    Object.entries(themeVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    document.body.setAttribute('data-theme', themeName);
    console.log(`🎨 Applied theme: ${themeName}`);
  }
  
  /**
   * Update responsive breakpoint
   */
  updateBreakpoint() {
    const width = window.innerWidth;
    let newBreakpoint;
    
    if (width < this.layoutSystem.breakpoints.mobile) {
      newBreakpoint = 'mobile';
    } else if (width < this.layoutSystem.breakpoints.tablet) {
      newBreakpoint = 'tablet';
    } else {
      newBreakpoint = 'desktop';
    }
    
    if (newBreakpoint !== this.layoutSystem.currentBreakpoint) {
      const previousBreakpoint = this.layoutSystem.currentBreakpoint;
      this.layoutSystem.currentBreakpoint = newBreakpoint;
      this.handleBreakpointChange(previousBreakpoint, newBreakpoint);
    }
  }
  
  /**
   * Handle breakpoint changes
   */
  handleBreakpointChange(oldBreakpoint, newBreakpoint) {
    console.log(`📱 Breakpoint changed: ${oldBreakpoint} → ${newBreakpoint}`);
    
    // Update body class
    document.body.classList.remove(`breakpoint-${oldBreakpoint}`);
    document.body.classList.add(`breakpoint-${newBreakpoint}`);
    
    // Notify components
    this.eventBus.dispatchEvent(new CustomEvent('breakpoint-changed', {
      detail: { oldBreakpoint, newBreakpoint, width: window.innerWidth }
    }));
    
    // Update layout configurations
    this.applyBreakpointLayout(newBreakpoint);
  }
  
  /**
   * Apply breakpoint-specific layout
   */
  applyBreakpointLayout(breakpoint) {
    const layouts = {
      mobile: {
        'device-selector': { columns: 1, spacing: 'compact' },
        'control-panel': { orientation: 'vertical', collapsed: true },
        'screenshot-overlay': { position: 'bottom', size: 'small' }
      },
      tablet: {
        'device-selector': { columns: 2, spacing: 'normal' },
        'control-panel': { orientation: 'horizontal', collapsed: false },
        'screenshot-overlay': { position: 'right', size: 'medium' }
      },
      desktop: {
        'device-selector': { columns: 3, spacing: 'normal' },
        'control-panel': { orientation: 'horizontal', collapsed: false },
        'screenshot-overlay': { position: 'overlay', size: 'large' }
      }
    };
    
    const layoutConfig = layouts[breakpoint];
    if (layoutConfig) {
      Object.entries(layoutConfig).forEach(([component, config]) => {
        this.applyComponentLayout(component, config);
      });
    }
  }
  
  /**
   * Register a component in the registry
   */
  registerComponent(componentId, config = {}) {
    this.componentRegistry.set(componentId, {
      id: componentId,
      type: config.type || 'custom',
      state: config.state || 'idle',
      element: config.element || document.getElementById(componentId),
      observers: config.observers || new Set(),
      lastUpdate: Date.now(),
      ...config
    });
    
    this.componentStates.set(componentId, config.initialState || {});
    
    console.log(`📦 Registered component: ${componentId}`);
    return true;
  }
  
  /**
   * Handle DOM changes
   */
  handleDOMChange(mutation) {
    this.performanceMetrics.domMutations++;
    
    // Track component-related changes
    if (mutation.target && mutation.target.classList) {
      const componentClasses = Array.from(mutation.target.classList).filter(cls => 
        cls.startsWith('device-') || cls.startsWith('verridian-') || cls.startsWith('cosmic-')
      );
      
      if (componentClasses.length > 0) {
        this.handleComponentMutation(mutation.target, mutation);
      }
    }
  }
  
  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    if (window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0];
      const paint = window.performance.getEntriesByType('paint');
      
      const metrics = {
        timestamp: Date.now(),
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        stateUpdates: this.performanceMetrics.stateUpdates,
        domMutations: this.performanceMetrics.domMutations
      };
      
      this.performanceMetrics.lastUpdate = Date.now();
      console.log('📊 Performance metrics collected:', metrics);
    }
  }
  
  /**
   * Send response to broker
   */
  sendResponseToBroker(requestId, type, data) {
    if (this.brokerWs && this.brokerWs.readyState === WebSocket.OPEN) {
      const message = {
        type: 'agent_response',
        requestId,
        agentId: this.agentId,
        responseType: type,
        data,
        timestamp: Date.now()
      };
      
      this.brokerWs.send(JSON.stringify(message));
    }
  }
  
  /**
   * Send error to broker
   */
  sendErrorToBroker(requestId, type, error) {
    if (this.brokerWs && this.brokerWs.readyState === WebSocket.OPEN) {
      const message = {
        type: 'agent_error',
        requestId,
        agentId: this.agentId,
        errorType: type,
        error,
        timestamp: Date.now()
      };
      
      this.brokerWs.send(JSON.stringify(message));
    }
  }
  
  /**
   * Get current frontend status
   */
  getStatus() {
    return {
      connected: this.brokerWs?.readyState === WebSocket.OPEN,
      registered: this.isRegistered,
      uiState: this.uiState,
      currentTheme: this.themeManager.currentTheme,
      currentBreakpoint: this.layoutSystem.currentBreakpoint,
      registeredComponents: Array.from(this.componentRegistry.keys()),
      performanceMetrics: this.performanceMetrics,
      timestamp: Date.now()
    };
  }
}