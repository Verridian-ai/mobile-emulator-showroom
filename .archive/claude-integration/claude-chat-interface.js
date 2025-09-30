/**
 * Claude Chat Interface for Device Testing Platform
 * Integrates with existing WebSocket broker to provide AI chat capabilities
 */

class ClaudeChatInterface {
  constructor(options = {}) {
    this.brokerUrl = options.brokerUrl || 'ws://localhost:7071';
    // SECURITY: Token must be provided - no hardcoded defaults
    this.brokerToken = options.brokerToken || window.WEBSOCKET_TOKEN || '';
    if (!this.brokerToken) {
      console.error('❌ SECURITY: WebSocket token is required for broker connection');
      console.warn('Please provide a token via options.brokerToken or window.WEBSOCKET_TOKEN');
    }
    this.apiKey = options.apiKey || `claude-web-${Date.now()}`;
    
    // WebSocket connection
    this.ws = null;
    this.isConnected = false;
    this.isRegistered = false;
    
    // UI elements
    this.container = null;
    this.chatWindow = null;
    this.input = null;
    this.sendButton = null;
    this.toggleButton = null;
    this.statusIndicator = null;
    
    // Chat state
    this.messages = [];
    this.isWaitingForResponse = false;
    this.currentContext = {
      currentUrl: null,
      currentDevice: null,
      lastScreenshot: null
    };
    
    // Request tracking
    this.pendingRequests = new Map();
    this.requestCounter = 0;
    
    this.init();
  }
  
  async init() {
    console.log('🤖 Initializing Claude Chat Interface...');
    this.createUI();
    this.connectToBroker();
    this.setupEventListeners();
    console.log('✅ Claude Chat Interface ready');
  }
  
  createUI() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'claude-chat-container';
    this.container.innerHTML = `
      <div class="claude-chat-toggle">
        <button id="claudeChatToggle" class="chat-toggle-btn" title="Toggle Claude AI Chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 9h8M8 13h6"/>
          </svg>
          <span class="chat-status-indicator" id="chatStatusIndicator"></span>
        </button>
      </div>
      
      <div class="claude-chat-panel" id="claudeChatPanel">
        <div class="chat-header">
          <div class="chat-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Claude AI Assistant</span>
          </div>
          <div class="chat-actions">
            <button id="chatScreenshotBtn" class="chat-action-btn" title="Analyze Screenshot">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
            <button id="chatClearBtn" class="chat-action-btn" title="Clear Chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="chat-messages" id="chatMessages">
          <div class="chat-message system">
            <div class="message-content">
              <p>👋 Hello! I'm Claude, your AI assistant for this mobile testing platform.</p>
              <p>I can help you with:</p>
              <ul>
                <li>🔍 Analyzing screenshots and UI elements</li>
                <li>♿ Accessibility audits and recommendations</li>
                <li>⚡ Performance optimization suggestions</li>
                <li>🐛 Debugging website issues</li>
                <li>📱 Mobile responsiveness analysis</li>
                <li>💬 General web development questions</li>
              </ul>
              <p>Try asking me to analyze the current page or take a screenshot!</p>
            </div>
          </div>
        </div>
        
        <div class="chat-input-area">
          <div class="chat-input-container">
            <textarea id="chatInput" placeholder="Ask Claude anything about web development, UI analysis, or testing..." rows="1"></textarea>
            <button id="chatSendBtn" class="chat-send-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
            </button>
          </div>
          <div class="chat-suggestions" id="chatSuggestions">
            <button class="suggestion-btn" data-suggestion="Analyze the current page for accessibility issues">♿ Check accessibility</button>
            <button class="suggestion-btn" data-suggestion="Take a screenshot and analyze the UI design">📸 Analyze UI</button>
            <button class="suggestion-btn" data-suggestion="What are some performance optimization tips for this mobile site?">⚡ Performance tips</button>
          </div>
        </div>
      </div>
    `;
    
    // Add CSS styles
    this.addStyles();
    
    // Append to page
    document.body.appendChild(this.container);
    
    // Get references
    this.toggleButton = document.getElementById('claudeChatToggle');
    this.statusIndicator = document.getElementById('chatStatusIndicator');
    this.chatPanel = document.getElementById('claudeChatPanel');
    this.chatMessages = document.getElementById('chatMessages');
    this.input = document.getElementById('chatInput');
    this.sendButton = document.getElementById('chatSendBtn');
  }
  
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .claude-chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      
      .claude-chat-toggle {
        position: relative;
      }
      
      .chat-toggle-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6B46C1 0%, #2563EB 100%);
        border: none;
        color: white;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(107, 70, 193, 0.4);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .chat-toggle-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .chat-toggle-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(107, 70, 193, 0.5);
      }
      
      .chat-toggle-btn:hover::before {
        opacity: 1;
      }
      
      .chat-status-indicator {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #10B981;
        border: 2px solid white;
        transition: all 0.3s ease;
      }
      
      .chat-status-indicator.connecting {
        background: #F59E0B;
        animation: pulse 1.5s infinite;
      }
      
      .chat-status-indicator.disconnected {
        background: #EF4444;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.1); }
      }
      
      .claude-chat-panel {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 400px;
        height: 600px;
        max-height: calc(100vh - 120px);
        background: rgba(10, 0, 32, 0.95);
        backdrop-filter: blur(20px) saturate(180%);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .claude-chat-panel.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }
      
      .chat-header {
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .chat-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
        font-weight: 600;
        font-size: 16px;
      }
      
      .chat-actions {
        display: flex;
        gap: 8px;
      }
      
      .chat-action-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .chat-action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .chat-message {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .chat-message.user .message-content {
        background: linear-gradient(135deg, #6B46C1 0%, #2563EB 100%);
        color: white;
        margin-left: 40px;
        border-radius: 16px 16px 4px 16px;
      }
      
      .chat-message.assistant .message-content {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        margin-right: 40px;
        border-radius: 16px 16px 16px 4px;
      }
      
      .chat-message.system .message-content {
        background: rgba(16, 185, 129, 0.1);
        color: #A7F3D0;
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 12px;
      }
      
      .message-content {
        padding: 12px 16px;
        line-height: 1.5;
        font-size: 14px;
      }
      
      .message-content p {
        margin: 0 0 8px 0;
      }
      
      .message-content p:last-child {
        margin-bottom: 0;
      }
      
      .message-content ul {
        margin: 8px 0;
        padding-left: 16px;
      }
      
      .message-content li {
        margin-bottom: 4px;
      }
      
      .message-timestamp {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        padding: 0 16px;
      }
      
      .chat-input-area {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 16px;
      }
      
      .chat-input-container {
        display: flex;
        gap: 8px;
        align-items: end;
      }
      
      .chat-input-container textarea {
        flex: 1;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 12px 16px;
        color: white;
        font-size: 14px;
        resize: none;
        min-height: 20px;
        max-height: 100px;
        font-family: inherit;
      }
      
      .chat-input-container textarea::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
      
      .chat-input-container textarea:focus {
        outline: none;
        border-color: #6B46C1;
        box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
      }
      
      .chat-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #6B46C1 0%, #2563EB 100%);
        border: none;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .chat-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .chat-send-btn:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(107, 70, 193, 0.4);
      }
      
      .chat-suggestions {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .suggestion-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 6px 12px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .suggestion-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }
      
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        padding: 12px 16px;
        margin-right: 40px;
      }
      
      .typing-dots {
        display: flex;
        gap: 4px;
      }
      
      .typing-dots span {
        width: 6px;
        height: 6px;
        background: currentColor;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }
      
      .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.5;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .claude-chat-container {
          bottom: 10px;
          right: 10px;
          left: 10px;
        }
        
        .claude-chat-panel {
          width: calc(100vw - 20px);
          right: 0;
          left: 0;
          height: 70vh;
          max-height: calc(100vh - 100px);
          bottom: 70px;
        }
        
        .chat-toggle-btn {
          width: 50px;
          height: 50px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  setupEventListeners() {
    // Toggle chat panel
    this.toggleButton.addEventListener('click', () => {
      this.toggleChat();
    });
    
    // Send message
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Input handling
    this.input.addEventListener('input', () => {
      this.autoResize();
      this.sendButton.disabled = !this.input.value.trim();
    });
    
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (this.input.value.trim()) {
          this.sendMessage();
        }
      }
    });
    
    // Suggestion buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggestion-btn')) {
        const suggestion = e.target.dataset.suggestion;
        this.input.value = suggestion;
        this.sendButton.disabled = false;
        this.input.focus();
      }
    });
    
    // Action buttons
    document.getElementById('chatScreenshotBtn').addEventListener('click', () => {
      this.requestScreenshotAnalysis();
    });
    
    document.getElementById('chatClearBtn').addEventListener('click', () => {
      this.clearChat();
    });
    
    // Update context when device changes
    this.watchForContextChanges();
  }
  
  connectToBroker() {
    try {
      console.log('🔄 Connecting to WebSocket broker...');
      this.updateStatus('connecting');
      
      this.ws = new WebSocket(`${this.brokerUrl}?token=${this.brokerToken}&api_key=${this.apiKey}`);
      
      this.ws.onopen = () => {
        console.log('✅ Connected to broker');
        this.isConnected = true;
        this.registerAsAISystem();
      };
      
      this.ws.onmessage = (event) => {
        this.handleBrokerMessage(event);
      };
      
      this.ws.onclose = () => {
        console.log('❌ Disconnected from broker');
        this.isConnected = false;
        this.isRegistered = false;
        this.updateStatus('disconnected');
        
        // Auto-reconnect after delay
        setTimeout(() => {
          if (!this.isConnected) {
            this.connectToBroker();
          }
        }, 5000);
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.updateStatus('disconnected');
      };
      
    } catch (error) {
      console.error('❌ Failed to connect to broker:', error);
      this.updateStatus('disconnected');
    }
  }
  
  registerAsAISystem() {
    const registrationMessage = {
      role: 'ai-system',
      platform: 'claude-web',
      capabilities: ['chat', 'vision', 'analysis'],
      timestamp: Date.now()
    };
    
    this.ws.send(JSON.stringify(registrationMessage));
  }
  
  handleBrokerMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Handle registration confirmation
      if (data.ok && data.registered === 'ai-system') {
        this.isRegistered = true;
        this.updateStatus('connected');
        console.log('✅ Registered as AI system');
        return;
      }
      
      // Handle AI responses
      if (data.type === 'ai_response' && data.requestId) {
        this.handleAIResponse(data);
        return;
      }
      
      // Handle errors
      if (data.type === 'ai_error' && data.requestId) {
        this.handleAIError(data);
        return;
      }
      
    } catch (error) {
      console.error('❌ Failed to handle broker message:', error);
    }
  }
  
  handleAIResponse(data) {
    const request = this.pendingRequests.get(data.requestId);
    if (!request) {
      console.warn('⚠️ Received response for unknown request:', data.requestId);
      return;
    }
    
    this.pendingRequests.delete(data.requestId);
    this.isWaitingForResponse = false;
    
    // Remove typing indicator
    this.removeTypingIndicator();
    
    // Add assistant message
    this.addMessage('assistant', data.data.response || 'I apologize, but I couldn\'t process that request.');
    
    // Re-enable input
    this.setInputEnabled(true);
  }
  
  handleAIError(data) {
    const request = this.pendingRequests.get(data.requestId);
    if (request) {
      this.pendingRequests.delete(data.requestId);
    }
    
    this.isWaitingForResponse = false;
    this.removeTypingIndicator();
    this.setInputEnabled(true);
    
    // Add error message
    this.addMessage('assistant', `I apologize, but I encountered an error: ${data.error}. Please try again.`);
  }
  
  updateStatus(status) {
    this.statusIndicator.className = `chat-status-indicator ${status}`;
  }
  
  toggleChat() {
    this.chatPanel.classList.toggle('visible');
    
    if (this.chatPanel.classList.contains('visible')) {
      this.input.focus();
    }
  }
  
  sendMessage() {
    const message = this.input.value.trim();
    if (!message || this.isWaitingForResponse || !this.isConnected) {
      return;
    }
    
    // Add user message
    this.addMessage('user', message);
    
    // Clear input
    this.input.value = '';
    this.sendButton.disabled = true;
    this.autoResize();
    
    // Send to broker
    this.sendAIRequest('chat_message', {
      message: message,
      context: this.currentContext
    });
  }
  
  sendAIRequest(type, payload) {
    if (!this.isConnected || !this.isRegistered) {
      this.addMessage('assistant', 'I\'m not connected to the AI service. Please wait while I reconnect...');
      return;
    }
    
    const requestId = `claude-web-${Date.now()}-${++this.requestCounter}`;
    
    const request = {
      type: type,
      requestId: requestId,
      timestamp: Date.now(),
      ...payload
    };
    
    this.pendingRequests.set(requestId, request);
    this.ws.send(JSON.stringify(request));
    
    this.isWaitingForResponse = true;
    this.addTypingIndicator();
    this.setInputEnabled(false);
  }
  
  async requestScreenshotAnalysis() {
    try {
      // Show loading message
      this.addMessage('user', '📸 Taking screenshot for analysis...');
      this.showCaptureNotification('Capturing screenshot...', 'info');
      
      // Try to capture screenshot using the screenshot system
      let screenshotData = null;
      
      // Check if screenshot system is available
      if (window.screenshotCaptureSystem) {
        try {
          const result = await window.screenshotCaptureSystem.captureFullPage({
            autoAnalyze: false,
            quality: 0.8
          });
          screenshotData = result.data;
        } catch (error) {
          console.warn('Screenshot system failed, trying browser API:', error);
        }
      }
      
      // Fallback to browser screenshot API
      if (!screenshotData && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        try {
          screenshotData = await this.captureWithDisplayMedia();
        } catch (error) {
          console.warn('Display media capture failed:', error);
        }
      }
      
      // Fallback to HTML2Canvas if available
      if (!screenshotData && window.html2canvas) {
        try {
          const iframe = document.getElementById('deviceIframe');
          const targetElement = iframe ? iframe.parentElement : document.body;
          const canvas = await html2canvas(targetElement, {
            useCORS: true,
            allowTaint: true,
            scale: 0.5,
            backgroundColor: null
          });
          screenshotData = canvas.toDataURL('image/png', 0.8);
        } catch (error) {
          console.warn('HTML2Canvas failed:', error);
        }
      }
      
      // Use a placeholder if all methods fail
      if (!screenshotData) {
        screenshotData = this.createPlaceholderScreenshot();
        this.addMessage('assistant', '⚠️ Screenshot capture not available. Using visual analysis based on current page structure.');
      }
      
      // Send for analysis
      this.sendAIRequest('screenshot_analysis_request', {
        screenshot: screenshotData,
        prompt: 'Analyze this screenshot for UI/UX issues, accessibility problems, mobile responsiveness, and design improvements. Focus on layout, typography, color contrast, button sizes, and overall user experience.',
        metadata: {
          url: this.currentContext.currentUrl,
          device: this.currentContext.currentDevice,
          timestamp: Date.now(),
          captureMethod: screenshotData.includes('placeholder') ? 'placeholder' : 'screenshot'
        }
      });
      
      this.showCaptureNotification('Screenshot captured! Analysis in progress...', 'success');
      
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
      this.addMessage('assistant', 'Sorry, I encountered an error while trying to capture the screenshot. Please try again.');
      this.showCaptureNotification('Screenshot capture failed', 'error');
    }
  }
  
  async captureWithDisplayMedia() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' }
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        
        resolve(canvas.toDataURL('image/png', 0.8));
      };
      video.onerror = reject;
    });
  }
  
  createPlaceholderScreenshot() {
    // Create a simple canvas with page info as placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, 600);
    
    // Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 800, 600);
    
    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Screenshot Preview', 400, 50);
    
    // URL info
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(this.currentContext.currentUrl || 'No URL loaded', 400, 100);
    
    // Device info
    ctx.fillText(`Device: ${this.currentContext.currentDevice || 'Unknown'}`, 400, 130);
    
    // Mock UI elements
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(50, 180, 700, 60);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Header Section', 400, 215);
    
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(50, 260, 700, 200);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Content Area', 400, 370);
    
    // Footer
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(50, 480, 700, 40);
    
    // Timestamp
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 400, 550);
    
    return canvas.toDataURL('image/png', 0.8);
  }
  
  showCaptureNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `screenshot-notification ${type}`;
    notification.textContent = message;
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.success};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10002;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;

    // Add animation styles if not already present
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  clearChat() {
    // Keep only system message
    const systemMessage = this.chatMessages.querySelector('.chat-message.system');
    this.chatMessages.innerHTML = '';
    if (systemMessage) {
      this.chatMessages.appendChild(systemMessage);
    }
    
    this.messages = [];
  }
  
  addMessage(role, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${role}`;
    
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    messageElement.innerHTML = `
      <div class="message-content">
        ${this.formatMessage(content)}
      </div>
      <div class="message-timestamp">${timestamp}</div>
    `;
    
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    
    // Store message
    this.messages.push({ role, content, timestamp: Date.now() });
  }
  
  formatMessage(content) {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  
  addTypingIndicator() {
    this.removeTypingIndicator(); // Remove any existing indicator
    
    const typingElement = document.createElement('div');
    typingElement.className = 'typing-indicator';
    typingElement.innerHTML = `
      Claude is thinking
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    
    this.chatMessages.appendChild(typingElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  removeTypingIndicator() {
    const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  setInputEnabled(enabled) {
    this.input.disabled = !enabled;
    this.sendButton.disabled = !enabled || !this.input.value.trim();
    
    if (enabled) {
      this.input.focus();
    }
  }
  
  autoResize() {
    this.input.style.height = 'auto';
    this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
  }
  
  watchForContextChanges() {
    // Watch for URL changes
    const urlInput = document.getElementById('urlInput');
    if (urlInput) {
      const observer = new MutationObserver(() => {
        this.currentContext.currentUrl = urlInput.value;
      });
      
      observer.observe(urlInput, { attributes: true, attributeFilter: ['value'] });
      
      urlInput.addEventListener('input', () => {
        this.currentContext.currentUrl = urlInput.value;
      });
    }
    
    // Watch for device changes
    const deviceFrame = document.getElementById('deviceFrame');
    if (deviceFrame) {
      const observer = new MutationObserver(() => {
        const classes = deviceFrame.className.split(' ');
        const deviceClass = classes.find(cls => cls.startsWith('device-'));
        this.currentContext.currentDevice = deviceClass ? deviceClass.replace('device-', '') : null;
      });
      
      observer.observe(deviceFrame, { attributes: true, attributeFilter: ['class'] });
    }
    
    // Initial context
    this.currentContext.currentUrl = urlInput?.value || 'https://verridian.ai';
    this.currentContext.currentDevice = 'iphone-14-pro'; // Default
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.claudeChat = new ClaudeChatInterface();
  });
} else {
  window.claudeChat = new ClaudeChatInterface();
}