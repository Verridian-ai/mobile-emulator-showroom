/**
 * VERRIDIAN AI - SCREENSHOT CAPTURE AGENT
 * Advanced screenshot capabilities for device testing platform
 * Integrates with Element Selection Agent and WebSocket Broker
 */

class ScreenshotCaptureAgent {
  constructor(options = {}) {
    this.options = {
      brokerUrl: options.brokerUrl || `ws://localhost:${window.location.port || 7071}`,
      clientId: options.clientId || `screenshot-agent-${Date.now()}`,
      maxRetries: options.maxRetries || 3,
      quality: options.quality || 0.92,
      format: options.format || 'png',
      timeout: options.timeout || 15000,
      enableWebGL: options.enableWebGL !== false,
      enableSVG: options.enableSVG !== false,
      crossOriginProxy: options.crossOriginProxy || null,
      ...options
    };

    // State management
    this.isInitialized = false;
    this.brokerConnection = null;
    this.captureQueue = [];
    this.captureHistory = [];
    this.activeCapture = null;
    this.captureCounter = 0;

    // Screenshot configuration
    this.captureConfig = {
      allowTaint: true,
      useCORS: true,
      scale: window.devicePixelRatio || 1,
      backgroundColor: null,
      removeContainer: true,
      logging: false,
      imageTimeout: 10000,
      onclone: null
    };

    // Capture types
    this.captureTypes = {
      FULL_VIEWPORT: 'full_viewport',
      SELECTED_ELEMENT: 'selected_element',
      DEVICE_FRAME: 'device_frame',
      VISIBLE_AREA: 'visible_area',
      CUSTOM_REGION: 'custom_region',
      IFRAME_CONTENT: 'iframe_content',
      MULTI_ELEMENT: 'multi_element'
    };

    // Performance monitoring
    this.performanceMetrics = {
      captureCount: 0,
      averageCaptureTime: 0,
      successRate: 0,
      errorCount: 0,
      lastCaptureTime: null
    };

    console.log('🖼️ Screenshot Capture Agent initialized');
  }

  /**
   * Initialize the Screenshot Capture Agent
   */
  async init() {
    try {
      console.log('🔄 Initializing Screenshot Capture Agent...');

      // Load html2canvas library if not already loaded
      await this.ensureHtml2CanvasLoaded();

      // Initialize UI controls
      this.createScreenshotControls();

      // Connect to WebSocket broker
      await this.connectToBroker();

      // Set up event listeners
      this.setupEventListeners();

      // Register with element selection agent if available
      this.registerWithElementAgent();

      this.isInitialized = true;
      console.log('✅ Screenshot Capture Agent ready');

      return { success: true, agent: 'screenshot-capture' };
    } catch (error) {
      console.error('❌ Failed to initialize Screenshot Capture Agent:', error);
      throw error;
    }
  }

  /**
   * Ensure html2canvas library is loaded
   */
  async ensureHtml2CanvasLoaded() {
    if (typeof html2canvas !== 'undefined') {
      console.log('✅ html2canvas already loaded');
      return;
    }

    return new Promise((resolve, reject) => {
      console.log('📦 Loading html2canvas library...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        console.log('✅ html2canvas loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load html2canvas');
        reject(new Error('Failed to load html2canvas library'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Create screenshot control UI
   */
  createScreenshotControls() {
    if (document.getElementById('screenshot-controls')) return;

    const controls = document.createElement('div');
    controls.id = 'screenshot-controls';
    controls.innerHTML = `
      <div class="screenshot-panel">
        <div class="screenshot-header">
          <span class="screenshot-title">📸 Screenshot Capture</span>
          <button id="screenshot-toggle" class="screenshot-btn">
            <span class="icon">📷</span>
            <span class="text">Capture</span>
          </button>
        </div>
        <div class="screenshot-options" id="screenshot-options" style="display: none;">
          <div class="capture-types">
            <button class="capture-btn" data-type="full_viewport">Full Page</button>
            <button class="capture-btn" data-type="device_frame">Device Frame</button>
            <button class="capture-btn" data-type="visible_area">Visible Area</button>
            <button class="capture-btn" data-type="selected_element">Selected Element</button>
          </div>
          <div class="capture-settings">
            <label>Quality: <input type="range" id="quality-slider" min="0.1" max="1" step="0.1" value="0.92"></label>
            <label>Format: 
              <select id="format-select">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </label>
          </div>
          <div class="capture-status" id="capture-status"></div>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .screenshot-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(16, 0, 43, 0.95);
        border: 1px solid rgba(107, 70, 193, 0.3);
        border-radius: 12px;
        padding: 15px;
        color: white;
        font-family: 'Inter', sans-serif;
        z-index: 10000;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(107, 70, 193, 0.3);
        min-width: 250px;
      }

      .screenshot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .screenshot-title {
        font-weight: 600;
        color: #6B46C1;
      }

      .screenshot-btn, .capture-btn {
        background: linear-gradient(135deg, #6B46C1, #8B4513);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .screenshot-btn:hover, .capture-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(107, 70, 193, 0.4);
      }

      .capture-types {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 15px;
      }

      .capture-btn {
        padding: 10px;
        font-size: 11px;
      }

      .capture-settings {
        margin-bottom: 10px;
      }

      .capture-settings label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .capture-settings input, .capture-settings select {
        width: 100%;
        padding: 4px;
        border-radius: 4px;
        border: 1px solid rgba(107, 70, 193, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .capture-status {
        font-size: 11px;
        color: #10B981;
        text-align: center;
      }

      .capture-status.error {
        color: #EF4444;
      }

      @media (max-width: 768px) {
        .screenshot-panel {
          right: 10px;
          top: 10px;
          min-width: 200px;
        }
      }
    `;
    document.head.appendChild(styles);
    document.body.appendChild(controls);

    console.log('✅ Screenshot controls created');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle screenshot panel
    const toggleBtn = document.getElementById('screenshot-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const options = document.getElementById('screenshot-options');
        const isVisible = options.style.display !== 'none';
        options.style.display = isVisible ? 'none' : 'block';
      });
    }

    // Capture type buttons
    document.querySelectorAll('.capture-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const captureType = e.target.dataset.type;
        this.captureScreenshot(captureType);
      });
    });

    // Quality slider
    const qualitySlider = document.getElementById('quality-slider');
    if (qualitySlider) {
      qualitySlider.addEventListener('change', (e) => {
        this.options.quality = parseFloat(e.target.value);
      });
    }

    // Format selector
    const formatSelect = document.getElementById('format-select');
    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        this.options.format = e.target.value;
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.captureScreenshot('full_viewport');
      } else if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.captureScreenshot('device_frame');
      }
    });

    console.log('✅ Event listeners configured');
  }

  /**
   * Connect to WebSocket broker
   */
  async connectToBroker() {
    try {
      console.log('🔄 Connecting to WebSocket broker...');
      
      this.brokerConnection = new WebSocket(`${this.options.brokerUrl}?token=screenshot-agent&api_key=${this.options.clientId}`);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Broker connection timeout'));
        }, this.options.timeout);
        
        this.brokerConnection.onopen = () => {
          console.log('✅ Connected to broker');
          clearTimeout(timeout);
          this.registerWithBroker();
          resolve();
        };
        
        this.brokerConnection.onmessage = (event) => {
          this.handleBrokerMessage(event);
        };
        
        this.brokerConnection.onclose = () => {
          console.log('❌ Disconnected from broker');
          // Auto-reconnect after delay
          setTimeout(() => this.connectToBroker(), 5000);
        };
        
        this.brokerConnection.onerror = (error) => {
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
   * Register with WebSocket broker
   */
  registerWithBroker() {
    const registration = {
      role: 'screenshot-agent',
      capabilities: [
        'full-viewport-capture',
        'element-capture',
        'device-frame-capture',
        'custom-region-capture',
        'iframe-capture',
        'multi-element-capture'
      ],
      formats: ['png', 'jpeg', 'webp'],
      maxQuality: 1.0,
      timestamp: Date.now()
    };
    
    console.log('📝 Registering with broker as screenshot agent');
    this.brokerConnection.send(JSON.stringify(registration));
  }

  /**
   * Handle messages from broker
   */
  async handleBrokerMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'screenshot_request') {
        await this.handleScreenshotRequest(data);
      } else if (data.type === 'element_selected' && data.source === 'element-selection-agent') {
        // Auto-capture when element is selected
        await this.captureSelectedElement(data.element);
      }
    } catch (error) {
      console.error('❌ Failed to handle broker message:', error);
    }
  }

  /**
   * Handle screenshot request from broker
   */
  async handleScreenshotRequest(request) {
    const { requestId, captureType, options = {}, element } = request;
    
    try {
      console.log(`📸 Processing screenshot request: ${captureType} (${requestId})`);
      
      const screenshot = await this.captureScreenshot(captureType, {
        ...options,
        element,
        requestId
      });
      
      // Send response back to broker
      this.brokerConnection.send(JSON.stringify({
        type: 'screenshot_response',
        requestId,
        status: 'success',
        data: screenshot,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error(`❌ Screenshot request failed (${requestId}):`, error);
      
      this.brokerConnection.send(JSON.stringify({
        type: 'screenshot_error',
        requestId,
        error: error.message,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Register with Element Selection Agent
   */
  registerWithElementAgent() {
    if (window.elementSelectionAgent) {
      console.log('🔗 Registering with Element Selection Agent');
      window.elementSelectionAgent.onElementSelect = (elementData) => {
        this.captureSelectedElement(elementData);
      };
    }
  }

  /**
   * Main screenshot capture method
   */
  async captureScreenshot(captureType = 'full_viewport', options = {}) {
    const startTime = performance.now();
    const captureId = `capture-${++this.captureCounter}`;
    
    try {
      this.updateStatus('📸 Capturing screenshot...', false);
      this.activeCapture = { id: captureId, type: captureType, startTime };
      
      let screenshot;
      
      switch (captureType) {
        case this.captureTypes.FULL_VIEWPORT:
          screenshot = await this.captureFullViewport(options);
          break;
        case this.captureTypes.SELECTED_ELEMENT:
          screenshot = await this.captureSelectedElement(options.element);
          break;
        case this.captureTypes.DEVICE_FRAME:
          screenshot = await this.captureDeviceFrame(options);
          break;
        case this.captureTypes.VISIBLE_AREA:
          screenshot = await this.captureVisibleArea(options);
          break;
        case this.captureTypes.CUSTOM_REGION:
          screenshot = await this.captureCustomRegion(options);
          break;
        case this.captureTypes.IFRAME_CONTENT:
          screenshot = await this.captureIframeContent(options);
          break;
        default:
          throw new Error(`Unsupported capture type: ${captureType}`);
      }
      
      const captureTime = performance.now() - startTime;
      
      // Update performance metrics
      this.updatePerformanceMetrics(captureTime, true);
      
      // Store in history
      const captureData = {
        id: captureId,
        type: captureType,
        screenshot: screenshot,
        timestamp: Date.now(),
        captureTime: captureTime,
        options: options
      };
      
      this.captureHistory.unshift(captureData);
      if (this.captureHistory.length > 50) {
        this.captureHistory = this.captureHistory.slice(0, 50);
      }
      
      this.updateStatus(`✅ Screenshot captured (${captureTime.toFixed(0)}ms)`, false);
      
      // Broadcast to broker and other systems
      this.broadcastScreenshot(captureData);
      
      return captureData;
      
    } catch (error) {
      this.updatePerformanceMetrics(performance.now() - startTime, false);
      this.updateStatus(`❌ Capture failed: ${error.message}`, true);
      console.error('❌ Screenshot capture failed:', error);
      throw error;
    } finally {
      this.activeCapture = null;
    }
  }

  /**
   * Capture full viewport
   */
  async captureFullViewport(options = {}) {
    const targetElement = options.element || document.body;
    
    const config = {
      ...this.captureConfig,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0,
      scrollY: 0,
      ...options
    };
    
    const canvas = await html2canvas(targetElement, config);
    return this.processCanvas(canvas, 'full_viewport');
  }

  /**
   * Capture selected element
   */
  async captureSelectedElement(elementData) {
    if (!elementData || !elementData.element) {
      throw new Error('No element provided for capture');
    }
    
    const element = elementData.element || elementData;
    const rect = element.getBoundingClientRect();
    
    // Scroll element into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const config = {
      ...this.captureConfig,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    };
    
    const canvas = await html2canvas(element, config);
    
    return {
      ...this.processCanvas(canvas, 'selected_element'),
      elementData: {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      }
    };
  }

  /**
   * Capture device frame
   */
  async captureDeviceFrame(options = {}) {
    const deviceFrame = document.getElementById('deviceFrame') || 
                       document.querySelector('.device-mockup') ||
                       document.querySelector('[class*="device"]');
    
    if (!deviceFrame) {
      throw new Error('Device frame not found');
    }
    
    const config = {
      ...this.captureConfig,
      ...options
    };
    
    const canvas = await html2canvas(deviceFrame, config);
    return this.processCanvas(canvas, 'device_frame');
  }

  /**
   * Capture visible area
   */
  async captureVisibleArea(options = {}) {
    const config = {
      ...this.captureConfig,
      width: window.innerWidth,
      height: window.innerHeight,
      x: window.scrollX,
      y: window.scrollY,
      ...options
    };
    
    const canvas = await html2canvas(document.body, config);
    return this.processCanvas(canvas, 'visible_area');
  }

  /**
   * Capture custom region
   */
  async captureCustomRegion(options = {}) {
    const { x, y, width, height } = options;
    
    if (!x || !y || !width || !height) {
      throw new Error('Custom region coordinates required (x, y, width, height)');
    }
    
    const config = {
      ...this.captureConfig,
      x: x,
      y: y,
      width: width,
      height: height,
      ...options
    };
    
    const canvas = await html2canvas(document.body, config);
    return this.processCanvas(canvas, 'custom_region');
  }

  /**
   * Capture iframe content
   */
  async captureIframeContent(options = {}) {
    const iframe = options.iframe || document.querySelector('iframe');
    
    if (!iframe) {
      throw new Error('No iframe found to capture');
    }
    
    try {
      // Try to access iframe content directly
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const config = {
        ...this.captureConfig,
        ...options
      };
      
      const canvas = await html2canvas(iframeDocument.body, config);
      return this.processCanvas(canvas, 'iframe_content');
      
    } catch (error) {
      // Fallback to capturing iframe element itself
      console.warn('Cannot access iframe content, capturing iframe element:', error);
      const canvas = await html2canvas(iframe, this.captureConfig);
      return this.processCanvas(canvas, 'iframe_element');
    }
  }

  /**
   * Process canvas to create screenshot data
   */
  processCanvas(canvas, captureType) {
    const quality = this.options.quality;
    const format = this.options.format;
    
    const dataUrl = canvas.toDataURL(`image/${format}`, quality);
    const blob = this.dataURLtoBlob(dataUrl);
    
    return {
      dataUrl: dataUrl,
      blob: blob,
      width: canvas.width,
      height: canvas.height,
      format: format,
      quality: quality,
      captureType: captureType,
      size: blob.size
    };
  }

  /**
   * Convert dataURL to Blob
   */
  dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Broadcast screenshot to broker and connected systems
   */
  broadcastScreenshot(captureData) {
    if (this.brokerConnection && this.brokerConnection.readyState === WebSocket.OPEN) {
      const message = {
        type: 'screenshot_captured',
        source: 'screenshot-agent',
        data: {
          id: captureData.id,
          captureType: captureData.type,
          screenshot: captureData.screenshot.dataUrl,
          metadata: {
            width: captureData.screenshot.width,
            height: captureData.screenshot.height,
            format: captureData.screenshot.format,
            quality: captureData.screenshot.quality,
            size: captureData.screenshot.size,
            captureTime: captureData.captureTime
          },
          timestamp: captureData.timestamp
        }
      };
      
      this.brokerConnection.send(JSON.stringify(message));
      console.log(`📡 Screenshot broadcasted: ${captureData.id}`);
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(captureTime, success) {
    this.performanceMetrics.captureCount++;
    
    if (success) {
      const totalTime = (this.performanceMetrics.averageCaptureTime * (this.performanceMetrics.captureCount - 1)) + captureTime;
      this.performanceMetrics.averageCaptureTime = totalTime / this.performanceMetrics.captureCount;
      this.performanceMetrics.lastCaptureTime = captureTime;
    } else {
      this.performanceMetrics.errorCount++;
    }
    
    const successCount = this.performanceMetrics.captureCount - this.performanceMetrics.errorCount;
    this.performanceMetrics.successRate = (successCount / this.performanceMetrics.captureCount) * 100;
  }

  /**
   * Update status display
   */
  updateStatus(message, isError = false) {
    const statusEl = document.getElementById('capture-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `capture-status ${isError ? 'error' : ''}`;
    }
    
    console.log(isError ? `❌ ${message}` : `✅ ${message}`);
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      connected: this.brokerConnection?.readyState === WebSocket.OPEN,
      activeCapture: this.activeCapture,
      captureHistory: this.captureHistory.length,
      performance: this.performanceMetrics,
      timestamp: Date.now()
    };
  }

  /**
   * Get capture history
   */
  getCaptureHistory(limit = 10) {
    return this.captureHistory.slice(0, limit);
  }

  /**
   * Clear capture history
   */
  clearHistory() {
    this.captureHistory = [];
    console.log('🗑️ Capture history cleared');
  }

  /**
   * Cleanup and disconnect
   */
  destroy() {
    if (this.brokerConnection) {
      this.brokerConnection.close();
      this.brokerConnection = null;
    }
    
    const controls = document.getElementById('screenshot-controls');
    if (controls) {
      controls.remove();
    }
    
    this.isInitialized = false;
    console.log('🔄 Screenshot Capture Agent destroyed');
  }
}

// Global initialization
window.screenshotCaptureAgent = null;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      window.screenshotCaptureAgent = new ScreenshotCaptureAgent();
      await window.screenshotCaptureAgent.init();
    } catch (error) {
      console.error('❌ Failed to auto-initialize Screenshot Capture Agent:', error);
    }
  });
} else {
  // DOM already loaded
  setTimeout(async () => {
    try {
      window.screenshotCaptureAgent = new ScreenshotCaptureAgent();
      await window.screenshotCaptureAgent.init();
    } catch (error) {
      console.error('❌ Failed to auto-initialize Screenshot Capture Agent:', error);
    }
  }, 100);
}

console.log('📸 Screenshot Capture Agent module loaded');