/**
 * Element Selection System Agent - Enhanced Version
 * Advanced click-to-capture functionality for device skin elements
 * with visual highlighting, coordinate tracking, multi-IDE integration,
 * cross-origin iframe support, and collaborative features
 */
class ElementSelectionAgent {
  constructor(options = {}) {
    this.options = {
      brokerURL: options.brokerURL || `ws://localhost:${window.BROKER_PORT || 7071}`,
      brokerToken: options.brokerToken || window.WEBSOCKET_TOKEN || 'secure-token',
      overlayZIndex: options.overlayZIndex || 999999,
      highlightColor: options.highlightColor || '#6b46c1',
      selectionMode: false,
      enableKeyboardShortcuts: options.enableKeyboardShortcuts !== false,
      enableScreenshots: options.enableScreenshots !== false,
      maxHistorySize: options.maxHistorySize || 50,
      debugMode: options.debugMode || false,
      enableCrossDomainSelection: options.enableCrossDomainSelection !== false,
      enableCollaborativeMode: options.enableCollaborativeMode !== false,
      enableDeviceFrameDetection: options.enableDeviceFrameDetection !== false,
      selectionPersistence: options.selectionPersistence !== false,
      multiIdeSupport: options.multiIdeSupport !== false
    };
    
    // Core state management
    this.isActive = false;
    this.overlaySystem = null;
    this.currentSelection = null;
    this.selectionHistory = [];
    this.brokerWs = null;
    this.deviceFrame = null;
    this.deviceIframe = null;
    
    // Event handlers storage for cleanup
    this.eventHandlers = new Map();
    this.crossOriginHandlers = new Map();
    
    // Selection tracking
    this.lastClickTime = 0;
    this.clickBuffer = 200; // ms
    
    this.init();
  }
  
  /**
   * Initialize the Element Selection System
   */
  async init() {
    try {
      console.log('🎯 Initializing Element Selection Agent...');
      
      // Find device frame and iframe
      this.deviceFrame = document.getElementById('deviceFrame');
      this.deviceIframe = this.deviceFrame?.querySelector('iframe');
      
      if (!this.deviceFrame) {
        throw new Error('Device frame not found');
      }
      
      console.log('📱 Device frame detected:', this.deviceFrame.className);
      console.log('🖼️ Device iframe:', this.deviceIframe ? 'found' : 'not found');
      
      // Create overlay system
      this.createOverlaySystem();
      
      // Connect to broker
      await this.connectToBroker();
      
      // Setup keyboard shortcuts
      if (this.options.enableKeyboardShortcuts) {
        this.setupKeyboardShortcuts();
      }
      
      // Setup cross-origin iframe communication
      this.setupCrossOriginCommunication();
      
      // Initialize cross-origin iframe detection
      this.initializeCrossOriginSupport();
      
      // Initialize collaborative mode if enabled
      if (this.options.enableCollaborativeMode) {
        this.initializeCollaborativeMode();
      }
      
      // Initialize device frame detection
      if (this.options.enableDeviceFrameDetection) {
        this.initializeDeviceFrameDetection();
      }
      
      // Initialize multi-IDE support
      if (this.options.multiIdeSupport) {
        this.initializeMultiIdeSupport();
      }
      
      // Initialize selection persistence if enabled
      if (this.options.selectionPersistence) {
        this.initializeSelectionPersistence();
      }
      
      console.log('✅ Element Selection Agent initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Element Selection Agent:', error);
      throw error;
    }
  }
  
  /**
   * Create comprehensive overlay system for element selection
   */
  createOverlaySystem() {
    // Create main overlay container
    this.overlaySystem = document.createElement('div');
    this.overlaySystem.id = 'element-selection-overlay';
    this.overlaySystem.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: ${this.options.overlayZIndex};
      user-select: none;
    `;
    
    // Create selection highlight
    this.selectionHighlight = document.createElement('div');
    this.selectionHighlight.id = 'selection-highlight';
    this.selectionHighlight.style.cssText = `
      position: absolute;
      border: 2px solid ${this.options.highlightColor};
      background: ${this.options.highlightColor}20;
      box-shadow: 0 0 20px ${this.options.highlightColor}80;
      pointer-events: none;
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
      border-radius: 4px;
      backdrop-filter: blur(1px);
    `;
    
    // Create coordinates display
    this.coordinatesDisplay = document.createElement('div');
    this.coordinatesDisplay.id = 'coordinates-display';
    this.coordinatesDisplay.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
      font-size: 12px;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.2s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1001;
    `;
    
    // Create selection mode indicator
    this.modeIndicator = document.createElement('div');
    this.modeIndicator.id = 'selection-mode-indicator';
    this.modeIndicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 8px; height: 8px; background: ${this.options.highlightColor}; border-radius: 50%; animation: pulse 2s infinite;"></div>
        <span>Element Selection Mode</span>
        <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 10px;">ESC to exit</kbd>
      </div>
    `;
    this.modeIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1002;
    `;
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.9); }
      }
    `;
    document.head.appendChild(style);
    
    // Assemble overlay system
    this.overlaySystem.appendChild(this.selectionHighlight);
    this.overlaySystem.appendChild(this.coordinatesDisplay);
    this.overlaySystem.appendChild(this.modeIndicator);
    
    document.body.appendChild(this.overlaySystem);
    
    console.log('🎨 Overlay system created successfully');
  }
  
  /**
   * Toggle selection mode
   */
  toggleSelectionMode(enable = null) {
    const wasActive = this.options.selectionMode;
    this.options.selectionMode = enable !== null ? enable : !this.options.selectionMode;
    
    if (this.options.selectionMode) {
      this.activateSelectionMode();
    } else {
      this.deactivateSelectionMode();
    }
    
    // Notify broker of mode change
    this.broadcastModeChange(this.options.selectionMode, wasActive);
    
    return this.options.selectionMode;
  }
  
  /**
   * Activate selection mode
   */
  activateSelectionMode() {
    console.log('🎯 Activating element selection mode');
    
    // Enable pointer events on overlay
    this.overlaySystem.style.pointerEvents = 'all';
    
    // Show mode indicator
    this.modeIndicator.style.opacity = '1';
    this.modeIndicator.style.transform = 'translateY(0)';
    
    // Setup mouse event handlers
    this.setupMouseEventHandlers();
    
    // Change cursor style
    document.body.style.cursor = 'crosshair';
    
    // Add selection class to body
    document.body.classList.add('element-selection-active');
    
    console.log('✅ Selection mode activated');
  }
  
  /**
   * Deactivate selection mode
   */
  deactivateSelectionMode() {
    console.log('🚫 Deactivating element selection mode');
    
    // Disable pointer events on overlay
    this.overlaySystem.style.pointerEvents = 'none';
    
    // Hide mode indicator
    this.modeIndicator.style.opacity = '0';
    this.modeIndicator.style.transform = 'translateY(-10px)';
    
    // Hide selection highlight
    this.selectionHighlight.style.opacity = '0';
    this.coordinatesDisplay.style.opacity = '0';
    
    // Cleanup event handlers
    this.cleanupMouseEventHandlers();
    
    // Reset cursor style
    document.body.style.cursor = '';
    
    // Remove selection class from body
    document.body.classList.remove('element-selection-active');
    
    console.log('✅ Selection mode deactivated');
  }
  
  /**
   * Setup mouse event handlers for element selection
   */
  setupMouseEventHandlers() {
    const mouseMoveHandler = (e) => this.handleMouseMove(e);
    const clickHandler = (e) => this.handleElementClick(e);
    const keyHandler = (e) => this.handleKeyPress(e);
    
    // Store handlers for cleanup
    this.eventHandlers.set('mousemove', mouseMoveHandler);
    this.eventHandlers.set('click', clickHandler);
    this.eventHandlers.set('keydown', keyHandler);
    
    // Add event listeners
    document.addEventListener('mousemove', mouseMoveHandler, { passive: true });
    document.addEventListener('click', clickHandler, { capture: true });
    document.addEventListener('keydown', keyHandler);
    
    console.log('🖱️ Mouse event handlers setup complete');
  }
  
  /**
   * Cleanup mouse event handlers
   */
  cleanupMouseEventHandlers() {
    this.eventHandlers.forEach((handler, eventType) => {
      document.removeEventListener(eventType, handler, eventType === 'click' ? { capture: true } : undefined);
    });
    this.eventHandlers.clear();
    
    console.log('🧹 Mouse event handlers cleaned up');
  }
  
  /**
   * Handle mouse movement for element highlighting
   */
  handleMouseMove(e) {
    if (!this.options.selectionMode) return;
    
    const target = this.getElementUnderCursor(e);
    if (!target) return;
    
    // Skip if target is part of overlay system
    if (this.overlaySystem.contains(target)) return;
    
    this.highlightElement(target, e.clientX, e.clientY);
  }
  
  /**
   * Handle element click for selection
   */
  handleElementClick(e) {
    if (!this.options.selectionMode) return;
    
    // Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Debounce rapid clicks
    const now = Date.now();
    if (now - this.lastClickTime < this.clickBuffer) return;
    this.lastClickTime = now;
    
    const target = this.getElementUnderCursor(e);
    if (!target || this.overlaySystem.contains(target)) return;
    
    this.captureElement(target, e);
  }
  
  /**
   * Get element under cursor, handling iframe scenarios
   */
  getElementUnderCursor(e) {
    // Hide overlay temporarily to get real element
    const originalPointerEvents = this.overlaySystem.style.pointerEvents;
    this.overlaySystem.style.pointerEvents = 'none';
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // Restore overlay pointer events
    this.overlaySystem.style.pointerEvents = originalPointerEvents;
    
    return element;
  }
  
  /**
   * Highlight element with visual feedback
   */
  highlightElement(element, mouseX, mouseY) {
    const rect = element.getBoundingClientRect();
    
    // Update highlight position and size
    this.selectionHighlight.style.left = `${rect.left - 2}px`;
    this.selectionHighlight.style.top = `${rect.top - 2}px`;
    this.selectionHighlight.style.width = `${rect.width + 4}px`;
    this.selectionHighlight.style.height = `${rect.height + 4}px`;
    this.selectionHighlight.style.opacity = '1';
    
    // Update coordinates display
    const tagName = element.tagName.toLowerCase();
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const id = element.id ? `#${element.id}` : '';
    
    this.coordinatesDisplay.innerHTML = `
      <div style="margin-bottom: 4px; color: ${this.options.highlightColor}; font-weight: 600;">
        ${tagName}${id}${className}
      </div>
      <div style="font-size: 11px; color: rgba(255, 255, 255, 0.8);">
        Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}<br>
        Size: ${Math.round(rect.width)} × ${Math.round(rect.height)}px
      </div>
    `;
    
    // Position coordinates display near cursor
    const displayX = Math.min(mouseX + 15, window.innerWidth - 200);
    const displayY = Math.max(mouseY - 60, 10);
    
    this.coordinatesDisplay.style.left = `${displayX}px`;
    this.coordinatesDisplay.style.top = `${displayY}px`;
    this.coordinatesDisplay.style.opacity = '1';
  }
  
  /**
   * Capture element and broadcast to broker
   */
  async captureElement(element, event) {
    try {
      console.log('📸 Capturing element:', element.tagName);
      
      // Gather comprehensive element data
      const elementData = this.gatherElementData(element, event);
      
      // Take screenshot if enabled
      let screenshot = null;
      if (this.options.enableScreenshots) {
        screenshot = await this.captureScreenshot(element);
      }
      
      // Create selection record
      const selection = {
        id: `selection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        element: elementData,
        screenshot,
        coordinates: {
          click: { x: event.clientX, y: event.clientY },
          element: elementData.boundingRect
        },
        context: this.gatherContextData(),
        source: 'element-selection-agent'
      };
      
      // Update current selection
      this.currentSelection = selection;
      
      // Add to history
      this.addToHistory(selection);
      
      // Broadcast to broker and connected IDEs
      await this.broadcastElementSelection(selection);
      
      // Visual feedback
      this.showSelectionConfirmation(element);
      
      console.log('✅ Element captured successfully:', selection.id);
      
    } catch (error) {
      console.error('❌ Failed to capture element:', error);
      this.showErrorFeedback('Failed to capture element');
    }
  }
  
  /**
   * Gather comprehensive element data
   */
  gatherElementData(element, event) {
    const rect = element.getBoundingClientRect();
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      className: element.className || null,
      classList: Array.from(element.classList),
      attributes: this.getElementAttributes(element),
      textContent: element.textContent?.trim() || null,
      innerHTML: element.innerHTML?.length > 1000 ? element.innerHTML.substring(0, 1000) + '...' : element.innerHTML,
      outerHTML: element.outerHTML?.length > 2000 ? element.outerHTML.substring(0, 2000) + '...' : element.outerHTML,
      boundingRect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left
      },
      computedStyle: this.getRelevantComputedStyles(element),
      xpath: this.getElementXPath(element),
      cssSelector: this.generateCSSSelector(element),
      parentInfo: this.getParentInfo(element),
      childCount: element.children.length,
      isVisible: this.isElementVisible(element),
      clickCoordinates: {
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY
      }
    };
  }
  
  /**
   * Get element attributes as object
   */
  getElementAttributes(element) {
    const attributes = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }
  
  /**
   * Get relevant computed styles
   */
  getRelevantComputedStyles(element) {
    const computedStyle = window.getComputedStyle(element);
    const relevantProps = [
      'display', 'position', 'visibility', 'opacity', 'z-index',
      'width', 'height', 'margin', 'padding', 'border',
      'background-color', 'color', 'font-size', 'font-family'
    ];
    
    const styles = {};
    relevantProps.forEach(prop => {
      styles[prop] = computedStyle.getPropertyValue(prop);
    });
    
    return styles;
  }
  
  /**
   * Generate XPath for element
   */
  getElementXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    const parts = [];
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let index = 0;
      let sibling = current.previousElementSibling;
      
      while (sibling) {
        if (sibling.tagName === current.tagName) index++;
        sibling = sibling.previousElementSibling;
      }
      
      const tagName = current.tagName.toLowerCase();
      const part = index > 0 ? `${tagName}[${index + 1}]` : tagName;
      parts.unshift(part);
      current = current.parentElement;
    }
    
    return `/${parts.join('/')}`;
  }
  
  /**
   * Generate CSS selector for element
   */
  generateCSSSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    const parts = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.className) {
        const classes = Array.from(current.classList).join('.');
        if (classes) {
          selector += `.${classes}`;
        }
      }
      
      parts.unshift(selector);
      current = current.parentElement;
    }
    
    return parts.join(' > ');
  }
  
  /**
   * Get parent element information
   */
  getParentInfo(element) {
    const parent = element.parentElement;
    if (!parent) return null;
    
    return {
      tagName: parent.tagName.toLowerCase(),
      id: parent.id || null,
      className: parent.className || null
    };
  }
  
  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }
  
  /**
   * Capture screenshot of current viewport
   */
  async captureScreenshot(element) {
    try {
      if (typeof html2canvas !== 'undefined') {
        // Use html2canvas if available
        const canvas = await html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          scale: 0.5 // Reduce quality for performance
        });
        return canvas.toDataURL('image/png');
      } else {
        // Fallback: return null and log warning
        console.warn('⚠️ html2canvas not available, screenshot disabled');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to capture screenshot:', error);
      return null;
    }
  }
  
  /**
   * Gather context data about current state
   */
  gatherContextData() {
    return {
      url: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      deviceFrame: {
        present: !!this.deviceFrame,
        className: this.deviceFrame?.className
      },
      iframe: {
        present: !!this.deviceIframe,
        src: this.deviceIframe?.src
      },
      timestamp: Date.now(),
      selectionMode: this.options.selectionMode
    };
  }
  
  /**
   * Add selection to history
   */
  addToHistory(selection) {
    this.selectionHistory.unshift(selection);
    
    // Maintain history size limit
    if (this.selectionHistory.length > this.options.maxHistorySize) {
      this.selectionHistory = this.selectionHistory.slice(0, this.options.maxHistorySize);
    }
    
    if (this.options.debugMode) {
      console.log(`📚 Added to history. Total: ${this.selectionHistory.length}`);
    }
  }
  
  /**
   * Show selection confirmation feedback
   */
  showSelectionConfirmation(element) {
    // Create temporary confirmation indicator
    const confirmation = document.createElement('div');
    confirmation.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${this.options.highlightColor};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: ${this.options.overlayZIndex + 10};
      opacity: 0;
      animation: confirmationFade 2s ease-out forwards;
    `;
    confirmation.textContent = `✓ Element captured: ${element.tagName.toLowerCase()}`;
    
    // Add animation
    const confirmationStyle = document.createElement('style');
    confirmationStyle.textContent = `
      @keyframes confirmationFade {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    document.head.appendChild(confirmationStyle);
    
    document.body.appendChild(confirmation);
    
    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(confirmation);
      document.head.removeChild(confirmationStyle);
    }, 2000);
  }
  
  /**
   * Show error feedback
   */
  showErrorFeedback(message) {
    console.error('🚨 Element Selection Error:', message);
    
    // Could show toast notification here
    const error = document.createElement('div');
    error.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: ${this.options.overlayZIndex + 10};
    `;
    error.textContent = `❌ ${message}`;
    
    document.body.appendChild(error);
    
    setTimeout(() => {
      if (document.body.contains(error)) {
        document.body.removeChild(error);
      }
    }, 3000);
  }
  
  /**
   * Connect to WebSocket broker
   */
  async connectToBroker() {
    try {
      console.log('🔗 Connecting to WebSocket broker...');
      
      this.brokerWs = new WebSocket(`${this.options.brokerURL}?token=${this.options.brokerToken}&client_type=element-selection-agent`);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Broker connection timeout'));
        }, 10000);
        
        this.brokerWs.onopen = () => {
          console.log('✅ Connected to broker');
          clearTimeout(timeout);
          this.registerWithBroker();
          resolve();
        };
        
        this.brokerWs.onmessage = (event) => {
          this.handleBrokerMessage(event);
        };
        
        this.brokerWs.onclose = () => {
          console.log('❌ Broker connection closed');
          // Auto-reconnect logic could be added here
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
  registerWithBroker() {
    const registration = {
      type: 'agent_registration',
      agentType: 'element-selection',
      capabilities: [
        'element-capture',
        'visual-highlighting',
        'coordinate-tracking',
        'screenshot-capture',
        'selection-history'
      ],
      timestamp: Date.now()
    };
    
    if (this.brokerWs.readyState === WebSocket.OPEN) {
      this.brokerWs.send(JSON.stringify(registration));
      console.log('🤖 Registered with broker as element-selection agent');
    }
  }
  
  /**
   * Handle messages from broker
   */
  handleBrokerMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'toggle_selection_mode':
          this.toggleSelectionMode(message.enabled);
          break;
        case 'get_selection_history':
          this.sendSelectionHistory(message.requestId);
          break;
        case 'clear_selection_history':
          this.clearSelectionHistory();
          break;
        default:
          if (this.options.debugMode) {
            console.log('📨 Unhandled broker message:', message);
          }
      }
    } catch (error) {
      console.error('❌ Failed to handle broker message:', error);
    }
  }
  
  /**
   * Broadcast element selection to broker and IDEs
   */
  async broadcastElementSelection(selection) {
    if (!this.brokerWs || this.brokerWs.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ Cannot broadcast: broker not connected');
      return;
    }
    
    const message = {
      type: 'element_selected',
      data: selection,
      metadata: {
        agent: 'element-selection',
        version: '1.0.0',
        timestamp: Date.now()
      }
    };
    
    try {
      this.brokerWs.send(JSON.stringify(message));
      console.log('📡 Element selection broadcasted to broker');
    } catch (error) {
      console.error('❌ Failed to broadcast selection:', error);
    }
  }
  
  /**
   * Broadcast mode change to broker
   */
  broadcastModeChange(newMode, oldMode) {
    if (!this.brokerWs || this.brokerWs.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const message = {
      type: 'selection_mode_changed',
      data: {
        enabled: newMode,
        previous: oldMode,
        timestamp: Date.now()
      },
      metadata: {
        agent: 'element-selection',
        version: '1.0.0'
      }
    };
    
    try {
      this.brokerWs.send(JSON.stringify(message));
      console.log(`📡 Mode change broadcasted: ${newMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Failed to broadcast mode change:', error);
    }
  }
  
  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    const keyHandler = (e) => {
      // ESC to exit selection mode
      if (e.key === 'Escape' && this.options.selectionMode) {
        this.toggleSelectionMode(false);
        return;
      }
      
      // Ctrl/Cmd + E to toggle selection mode
      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.toggleSelectionMode();
        return;
      }
    };
    
    document.addEventListener('keydown', keyHandler);
    this.eventHandlers.set('global-keydown', keyHandler);
    
    console.log('⌨️ Keyboard shortcuts setup: Ctrl+E (toggle), ESC (exit)');
  }
  
  /**
   * Setup cross-origin iframe communication
   */
  setupCrossOriginCommunication() {
    const messageHandler = (event) => {
      if (event.data && event.data.type === 'element-selection-iframe') {
        // Handle messages from iframe content
        console.log('📨 Received iframe message:', event.data);
      }
    };
    
    window.addEventListener('message', messageHandler);
    this.crossOriginHandlers.set('message', messageHandler);
    
    console.log('🌐 Cross-origin communication setup complete');
  }
  
  /**
   * Handle key press events
   */
  handleKeyPress(e) {
    // ESC to exit selection mode
    if (e.key === 'Escape' && this.options.selectionMode) {
      this.toggleSelectionMode(false);
    }
  }

  /**
   * Initialize cross-origin iframe support for element detection
   */
  initializeCrossOriginSupport() {
    console.log('🌐 Initializing cross-origin iframe support...');
    
    // Enhanced iframe detection with postMessage communication
    this.crossOriginState = {
      iframes: new Map(),
      overlayInstances: new Map(),
      communicationChannels: new Map()
    };
    
    // Scan for existing iframes
    this.scanForIframes();
    
    // Setup MutationObserver for dynamic iframe detection
    this.iframeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'IFRAME') {
                this.registerIframe(node);
              } else {
                const iframes = node.querySelectorAll('iframe');
                iframes.forEach(iframe => this.registerIframe(iframe));
              }
            }
          });
        }
      });
    });
    
    this.iframeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ Cross-origin iframe support initialized');
  }

  /**
   * Scan for existing iframes and register them
   */
  scanForIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => this.registerIframe(iframe));
    console.log(`🔍 Found and registered ${iframes.length} existing iframes`);
  }

  /**
   * Register an iframe for cross-origin element selection
   */
  registerIframe(iframe) {
    const iframeId = `iframe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create overlay for this iframe
    const iframeOverlay = this.createIframeOverlay(iframe);
    
    // Store iframe data
    this.crossOriginState.iframes.set(iframeId, {
      element: iframe,
      overlay: iframeOverlay,
      bounds: iframe.getBoundingClientRect(),
      src: iframe.src,
      origin: this.extractOriginFromUrl(iframe.src),
      registered: Date.now()
    });
    
    // Setup communication channel
    this.setupIframeCommunication(iframe, iframeId);
    
    console.log(`📋 Registered iframe: ${iframeId} (${iframe.src})`);
  }

  /**
   * Create overlay for iframe element selection
   */
  createIframeOverlay(iframe) {
    const overlay = document.createElement('div');
    overlay.className = 'iframe-selection-overlay';
    overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: ${this.options.overlayZIndex - 1};
      border: 2px dashed ${this.options.highlightColor}50;
      background: ${this.options.highlightColor}10;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    // Position overlay over iframe
    this.updateIframeOverlayPosition(overlay, iframe);
    
    // Add to overlay system
    this.overlaySystem.appendChild(overlay);
    
    return overlay;
  }

  /**
   * Update iframe overlay position
   */
  updateIframeOverlayPosition(overlay, iframe) {
    const rect = iframe.getBoundingClientRect();
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
  }

  /**
   * Setup communication channel with iframe
   */
  setupIframeCommunication(iframe, iframeId) {
    const messageHandler = (event) => {
      if (event.source === iframe.contentWindow) {
        this.handleIframeMessage(event, iframeId);
      }
    };
    
    window.addEventListener('message', messageHandler);
    this.crossOriginState.communicationChannels.set(iframeId, messageHandler);
    
    // Send initialization message to iframe
    try {
      iframe.contentWindow.postMessage({
        type: 'element-selection-init',
        iframeId: iframeId,
        options: {
          highlightColor: this.options.highlightColor,
          overlayZIndex: this.options.overlayZIndex
        }
      }, '*');
    } catch (error) {
      console.warn('⚠️ Could not initialize iframe communication:', error);
    }
  }

  /**
   * Handle messages from iframe content
   */
  handleIframeMessage(event, iframeId) {
    if (!event.data || !event.data.type) return;
    
    switch (event.data.type) {
      case 'element-selection-ready':
        console.log(`✅ Iframe ${iframeId} ready for element selection`);
        break;
      case 'element-selected-in-iframe':
        this.handleIframeElementSelection(event.data, iframeId);
        break;
    }
  }

  /**
   * Handle element selection from iframe
   */
  handleIframeElementSelection(data, iframeId) {
    console.log(`📋 Element selected in iframe ${iframeId}:`, data.element);
    
    // Create selection record for iframe element
    const selection = {
      id: `iframe_selection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      element: data.element,
      iframe: {
        id: iframeId,
        src: data.iframe?.src,
        origin: data.iframe?.origin
      },
      coordinates: data.coordinates,
      context: this.gatherContextData(),
      source: 'element-selection-agent-iframe'
    };
    
    this.currentSelection = selection;
    this.addToHistory(selection);
    this.broadcastElementSelection(selection);
  }

  /**
   * Extract origin from URL
   */
  extractOriginFromUrl(url) {
    try {
      return new URL(url).origin;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Initialize collaborative mode for multi-user element selection
   */
  initializeCollaborativeMode() {
    console.log('👥 Initializing collaborative mode...');
    
    this.collaborativeState = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: new Map(),
      cursors: new Map(),
      selections: new Map()
    };
    
    // Create collaborative cursors container
    this.createCollaborativeCursors();
    
    // Setup collaborative message handlers
    this.setupCollaborativeHandlers();
    
    // Register this user as participant
    this.registerParticipant();
    
    console.log('✅ Collaborative mode initialized');
  }

  /**
   * Create collaborative cursors system
   */
  createCollaborativeCursors() {
    this.collaborativeCursors = document.createElement('div');
    this.collaborativeCursors.id = 'collaborative-cursors';
    this.collaborativeCursors.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: ${this.options.overlayZIndex + 5};
    `;
    
    document.body.appendChild(this.collaborativeCursors);
  }

  /**
   * Setup collaborative message handlers
   */
  setupCollaborativeHandlers() {
    // Handle collaborative messages from broker
    const originalHandleBrokerMessage = this.handleBrokerMessage.bind(this);
    this.handleBrokerMessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'collaborative_cursor_update':
          this.updateCollaborativeCursor(message.data);
          break;
        case 'collaborative_selection':
          this.showCollaborativeSelection(message.data);
          break;
        case 'participant_joined':
          this.addParticipant(message.data);
          break;
        case 'participant_left':
          this.removeParticipant(message.data);
          break;
        default:
          originalHandleBrokerMessage(event);
      }
    };
    
    // Track own cursor for broadcasting
    if (this.options.selectionMode) {
      document.addEventListener('mousemove', (e) => {
        this.broadcastCursorPosition(e.clientX, e.clientY);
      });
    }
  }

  /**
   * Register this user as a participant
   */
  registerParticipant() {
    const participant = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.collaborativeState.sessionId,
      color: this.generateUserColor(),
      timestamp: Date.now()
    };
    
    this.collaborativeState.currentUser = participant;
    
    if (this.brokerWs?.readyState === WebSocket.OPEN) {
      this.brokerWs.send(JSON.stringify({
        type: 'participant_join',
        data: participant
      }));
    }
  }

  /**
   * Generate unique color for user
   */
  generateUserColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Update collaborative cursor position
   */
  updateCollaborativeCursor(data) {
    const { userId, x, y, color } = data;
    
    let cursor = this.collaborativeState.cursors.get(userId);
    if (!cursor) {
      cursor = this.createCollaborativeCursor(userId, color);
      this.collaborativeState.cursors.set(userId, cursor);
    }
    
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    cursor.style.opacity = '1';
    
    // Auto-hide cursor after inactivity
    clearTimeout(cursor.hideTimeout);
    cursor.hideTimeout = setTimeout(() => {
      cursor.style.opacity = '0.3';
    }, 2000);
  }

  /**
   * Create collaborative cursor element
   */
  createCollaborativeCursor(userId, color) {
    const cursor = document.createElement('div');
    cursor.className = 'collaborative-cursor';
    cursor.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50% 0 50% 50%;
      pointer-events: none;
      transform: translate(-2px, -2px);
      transition: all 0.1s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 1000;
    `;
    
    // Add user label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: 25px;
      left: 0;
      background: ${color};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    label.textContent = `User ${userId.substr(-4)}`;
    
    cursor.appendChild(label);
    this.collaborativeCursors.appendChild(cursor);
    
    return cursor;
  }

  /**
   * Broadcast cursor position to other participants
   */
  broadcastCursorPosition(x, y) {
    if (!this.collaborativeState.currentUser || !this.brokerWs?.readyState === WebSocket.OPEN) {
      return;
    }
    
    const message = {
      type: 'collaborative_cursor_update',
      data: {
        userId: this.collaborativeState.currentUser.id,
        x, y,
        color: this.collaborativeState.currentUser.color,
        timestamp: Date.now()
      }
    };
    
    this.brokerWs.send(JSON.stringify(message));
  }

  /**
   * Initialize device frame detection for enhanced element targeting
   */
  initializeDeviceFrameDetection() {
    console.log('📱 Initializing device frame detection...');
    
    this.deviceFrameState = {
      frames: new Map(),
      activeFrame: null,
      frameTypes: ['iphone', 'ipad', 'android', 'pixel', 'galaxy', 'desktop']
    };
    
    // Scan for device frames
    this.scanDeviceFrames();
    
    // Setup frame change detection
    this.setupFrameChangeDetection();
    
    console.log('✅ Device frame detection initialized');
  }

  /**
   * Scan for device frame elements
   */
  scanDeviceFrames() {
    const potentialFrames = document.querySelectorAll('[class*="device"], [id*="device"], .frame, [class*="skin"]');
    
    potentialFrames.forEach(frame => {
      const frameInfo = this.analyzeDeviceFrame(frame);
      if (frameInfo) {
        this.deviceFrameState.frames.set(frame, frameInfo);
        console.log(`📱 Detected device frame: ${frameInfo.type} (${frameInfo.width}x${frameInfo.height})`);
      }
    });
    
    // Set active frame (prioritize current deviceFrame)
    if (this.deviceFrame) {
      const activeFrameInfo = this.analyzeDeviceFrame(this.deviceFrame);
      if (activeFrameInfo) {
        this.deviceFrameState.activeFrame = { element: this.deviceFrame, info: activeFrameInfo };
      }
    }
  }

  /**
   * Analyze device frame element
   */
  analyzeDeviceFrame(element) {
    const rect = element.getBoundingClientRect();
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    // Detect frame type from class or id
    const frameType = this.deviceFrameState.frameTypes.find(type => 
      className.includes(type) || id.includes(type)
    ) || 'unknown';
    
    // Check if it's a reasonable device frame size
    if (rect.width < 200 || rect.height < 300) {
      return null;
    }
    
    return {
      type: frameType,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
      hasIframe: !!element.querySelector('iframe'),
      interactionArea: this.calculateInteractionArea(element)
    };
  }

  /**
   * Calculate interaction area within device frame
   */
  calculateInteractionArea(frameElement) {
    const iframe = frameElement.querySelector('iframe');
    if (iframe) {
      const iframeRect = iframe.getBoundingClientRect();
      const frameRect = frameElement.getBoundingClientRect();
      
      return {
        x: iframeRect.x - frameRect.x,
        y: iframeRect.y - frameRect.y,
        width: iframeRect.width,
        height: iframeRect.height,
        hasContent: true
      };
    }
    
    // Fallback to frame dimensions
    return {
      x: 0,
      y: 0,
      width: frameElement.offsetWidth,
      height: frameElement.offsetHeight,
      hasContent: false
    };
  }

  /**
   * Setup frame change detection
   */
  setupFrameChangeDetection() {
    // Listen for window resize to update frame positions
    const resizeHandler = () => {
      this.updateFramePositions();
    };
    
    window.addEventListener('resize', resizeHandler);
    this.eventHandlers.set('frame-resize', resizeHandler);
    
    // Setup mutation observer for frame changes
    this.frameObserver = new MutationObserver(() => {
      this.scanDeviceFrames();
    });
    
    this.frameObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  /**
   * Update frame positions after resize
   */
  updateFramePositions() {
    this.deviceFrameState.frames.forEach((info, element) => {
      const updatedInfo = this.analyzeDeviceFrame(element);
      if (updatedInfo) {
        this.deviceFrameState.frames.set(element, updatedInfo);
      }
    });
  }

  /**
   * Initialize multi-IDE support for enhanced communication
   */
  initializeMultiIdeSupport() {
    console.log('💻 Initializing multi-IDE support...');
    
    this.ideState = {
      supportedIdes: ['claude-code', 'cursor', 'windsurf', 'vscode'],
      activeIdes: new Map(),
      protocols: new Map(),
      messageQueue: []
    };
    
    // Setup IDE-specific protocols
    this.setupIdeProtocols();
    
    // Register IDE message handlers
    this.setupIdeMessageHandlers();
    
    // Detect active IDEs
    this.detectActiveIdes();
    
    console.log('✅ Multi-IDE support initialized');
  }

  /**
   * Setup IDE-specific communication protocols
   */
  setupIdeProtocols() {
    // Claude Code CLI protocol
    this.ideState.protocols.set('claude-code', {
      messageFormat: 'claude-mcp',
      capabilities: ['element-selection', 'screenshot-capture', 'code-generation'],
      connectionType: 'websocket',
      authentication: 'token-based'
    });
    
    // Cursor protocol
    this.ideState.protocols.set('cursor', {
      messageFormat: 'cursor-extension',
      capabilities: ['element-selection', 'ai-integration'],
      connectionType: 'extension-api',
      authentication: 'api-key'
    });
    
    // Windsurf protocol
    this.ideState.protocols.set('windsurf', {
      messageFormat: 'windsurf-agent',
      capabilities: ['element-selection', 'context-sharing'],
      connectionType: 'websocket',
      authentication: 'session-based'
    });
  }

  /**
   * Setup IDE-specific message handlers
   */
  setupIdeMessageHandlers() {
    // Extend broker message handling for IDE-specific messages
    const originalBroadcastElementSelection = this.broadcastElementSelection.bind(this);
    this.broadcastElementSelection = async (selection) => {
      // Standard broker broadcast
      await originalBroadcastElementSelection(selection);
      
      // IDE-specific broadcasts
      this.ideState.activeIdes.forEach((ideInfo, ideType) => {
        this.sendToIde(ideType, 'element-selected', selection);
      });
    };
  }

  /**
   * Detect active IDEs through various methods
   */
  detectActiveIdes() {
    // Check for Claude Code CLI indicators
    if (window.claudeCode || document.querySelector('[data-claude-code]')) {
      this.registerIde('claude-code', { version: '1.0', detected: 'dom-indicator' });
    }
    
    // Check for Cursor extension
    if (window.cursor || document.querySelector('[data-cursor]')) {
      this.registerIde('cursor', { version: 'unknown', detected: 'extension-api' });
    }
    
    // Check for Windsurf agent
    if (window.windsurf || window.location.search.includes('windsurf=1')) {
      this.registerIde('windsurf', { version: 'unknown', detected: 'url-parameter' });
    }
    
    console.log(`🔍 Detected ${this.ideState.activeIdes.size} active IDEs`);
  }

  /**
   * Register an IDE as active
   */
  registerIde(ideType, metadata) {
    this.ideState.activeIdes.set(ideType, {
      ...metadata,
      protocol: this.ideState.protocols.get(ideType),
      registeredAt: Date.now(),
      lastActivity: Date.now()
    });
    
    console.log(`💻 Registered IDE: ${ideType}`);
    
    // Send registration notification to broker
    if (this.brokerWs?.readyState === WebSocket.OPEN) {
      this.brokerWs.send(JSON.stringify({
        type: 'ide_registered',
        data: {
          ideType,
          metadata,
          timestamp: Date.now()
        }
      }));
    }
  }

  /**
   * Send message to specific IDE
   */
  sendToIde(ideType, messageType, data) {
    const ideInfo = this.ideState.activeIdes.get(ideType);
    if (!ideInfo) {
      console.warn(`⚠️ IDE ${ideType} not registered`);
      return;
    }
    
    const protocol = ideInfo.protocol;
    const message = {
      type: messageType,
      data: data,
      protocol: protocol.messageFormat,
      timestamp: Date.now(),
      source: 'element-selection-agent'
    };
    
    // Queue message if not ready
    if (!this.brokerWs || this.brokerWs.readyState !== WebSocket.OPEN) {
      this.ideState.messageQueue.push({ ideType, message });
      return;
    }
    
    // Send through broker with IDE routing
    this.brokerWs.send(JSON.stringify({
      type: 'ide_message',
      targetIde: ideType,
      message: message
    }));
    
    console.log(`📤 Sent ${messageType} to ${ideType}`);
  }

  /**
   * Initialize selection persistence using localStorage
   */
  initializeSelectionPersistence() {
    console.log('💾 Initializing selection persistence...');
    
    this.persistenceState = {
      storageKey: 'element-selection-history',
      maxStorageSize: 1000, // Maximum number of selections to store
      autoSave: true,
      syncInterval: 5000 // Sync every 5 seconds
    };
    
    // Load existing selections from storage
    this.loadSelectionHistory();
    
    // Setup auto-save
    if (this.persistenceState.autoSave) {
      this.setupAutoSave();
    }
    
    // Setup cross-tab synchronization
    this.setupCrossTabSync();
    
    console.log('✅ Selection persistence initialized');
  }

  /**
   * Load selection history from localStorage
   */
  loadSelectionHistory() {
    try {
      const stored = localStorage.getItem(this.persistenceState.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.selectionHistory = data.selections || [];
        this.currentSelection = data.current || null;
        
        console.log(`📚 Loaded ${this.selectionHistory.length} selections from storage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load selection history from storage:', error);
    }
  }

  /**
   * Save selection history to localStorage
   */
  saveSelectionHistory() {
    try {
      const data = {
        selections: this.selectionHistory.slice(0, this.persistenceState.maxStorageSize),
        current: this.currentSelection,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.persistenceState.storageKey, JSON.stringify(data));
      console.log(`💾 Saved ${data.selections.length} selections to storage`);
      
    } catch (error) {
      console.warn('⚠️ Failed to save selection history to storage:', error);
    }
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    const autoSaveInterval = setInterval(() => {
      if (this.selectionHistory.length > 0) {
        this.saveSelectionHistory();
      }
    }, this.persistenceState.syncInterval);
    
    // Store interval for cleanup
    this.eventHandlers.set('auto-save-interval', autoSaveInterval);
    
    // Also save on selection
    const originalAddToHistory = this.addToHistory.bind(this);
    this.addToHistory = (selection) => {
      originalAddToHistory(selection);
      this.saveSelectionHistory();
    };
  }

  /**
   * Setup cross-tab synchronization
   */
  setupCrossTabSync() {
    const storageHandler = (event) => {
      if (event.key === this.persistenceState.storageKey) {
        // Another tab updated the selection history
        this.loadSelectionHistory();
        console.log('🔄 Selection history synchronized from another tab');
      }
    };
    
    window.addEventListener('storage', storageHandler);
    this.eventHandlers.set('storage-sync', storageHandler);
  }
  
  /**
   * Send selection history to broker
   */
  sendSelectionHistory(requestId) {
    if (!this.brokerWs || this.brokerWs.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const message = {
      type: 'selection_history_response',
      requestId,
      data: {
        history: this.selectionHistory,
        count: this.selectionHistory.length,
        current: this.currentSelection
      },
      timestamp: Date.now()
    };
    
    this.brokerWs.send(JSON.stringify(message));
  }
  
  /**
   * Clear selection history
   */
  clearSelectionHistory() {
    this.selectionHistory = [];
    this.currentSelection = null;
    console.log('🗑️ Selection history cleared');
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      active: this.isActive,
      selectionMode: this.options.selectionMode,
      brokerConnected: this.brokerWs?.readyState === WebSocket.OPEN,
      historyCount: this.selectionHistory.length,
      currentSelection: this.currentSelection?.id || null,
      overlayCreated: !!this.overlaySystem,
      deviceFrameFound: !!this.deviceFrame,
      deviceIframeFound: !!this.deviceIframe
    };
  }
  
  /**
   * Cleanup and destroy agent
   */
  destroy() {
    console.log('🗑️ Destroying Element Selection Agent...');
    
    // Deactivate selection mode
    this.deactivateSelectionMode();
    
    // Cleanup event handlers
    this.cleanupMouseEventHandlers();
    this.eventHandlers.forEach((handler, eventType) => {
      document.removeEventListener(eventType, handler);
    });
    this.eventHandlers.clear();
    
    // Cleanup cross-origin handlers
    this.crossOriginHandlers.forEach((handler, eventType) => {
      window.removeEventListener(eventType, handler);
    });
    this.crossOriginHandlers.clear();
    
    // Remove overlay system
    if (this.overlaySystem && this.overlaySystem.parentNode) {
      this.overlaySystem.parentNode.removeChild(this.overlaySystem);
    }
    
    // Close broker connection
    if (this.brokerWs) {
      this.brokerWs.close();
      this.brokerWs = null;
    }
    
    // Reset body styles
    document.body.style.cursor = '';
    document.body.classList.remove('element-selection-active');
    
    console.log('✅ Element Selection Agent destroyed');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ElementSelectionAgent };
} else {
  // Browser global
  window.ElementSelectionAgent = ElementSelectionAgent;
}