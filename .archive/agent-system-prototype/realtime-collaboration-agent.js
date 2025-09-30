/**
 * REALTIME COLLABORATION AGENT
 * Enables multi-user collaboration, presence tracking, and real-time synchronization
 * Integrates with WebSocket broker for seamless multi-user experiences
 */

class RealtimeCollaborationAgent {
  constructor(options = {}) {
    this.agentId = 'realtime-collaboration-agent';
    this.version = '1.0.0';
    this.name = 'Real-time Collaboration Agent';
    
    // WebSocket broker connection
    this.brokerWs = null;
    this.brokerURL = options.brokerURL || `ws://${window.location.hostname}:${window.location.port.replace('5174', '7071')}`;
    this.brokerToken = options.brokerToken || 'verridian-collaboration';
    this.isRegistered = false;
    
    // Collaboration session management
    this.currentSession = null;
    this.sessionId = null;
    this.userId = options.userId || `user-${Math.random().toString(36).substr(2, 9)}`;
    this.userName = options.userName || 'Anonymous User';
    this.userRole = options.userRole || 'participant'; // admin, moderator, participant, observer
    
    // User presence tracking
    this.presenceManager = {
      users: new Map(),
      currentStatus: 'active',
      lastActivity: Date.now(),
      presenceTimeout: 30000, // 30 seconds
      activityThreshold: 60000 // 1 minute
    };
    
    // Shared state management
    this.sharedState = {
      data: {},
      version: 0,
      lastModified: Date.now(),
      locks: new Map(),
      subscribers: new Map()
    };
    
    // Conflict resolution
    this.conflictResolver = {
      strategy: 'last-write-wins', // last-write-wins, operational-transform, manual
      pendingConflicts: new Map(),
      resolutionQueue: []
    };
    
    // Collaborative cursors
    this.cursors = {
      local: { x: 0, y: 0, visible: false },
      remote: new Map(),
      elements: new Map(),
      throttleDelay: 50
    };
    
    // Chat system
    this.chat = {
      messages: [],
      unreadCount: 0,
      typingUsers: new Set(),
      maxMessages: 100,
      enabled: true
    };
    
    // Screen sharing
    this.screenShare = {
      active: false,
      presenter: null,
      stream: null,
      viewers: new Set(),
      quality: 'medium'
    };
    
    // Voice/Video collaboration
    this.webrtc = {
      peerConnections: new Map(),
      localStream: null,
      remoteStreams: new Map(),
      audioEnabled: false,
      videoEnabled: false
    };
    
    // Annotation system
    this.annotations = {
      active: [],
      history: [],
      tools: ['pointer', 'highlight', 'comment', 'draw'],
      currentTool: 'pointer',
      canvas: null
    };
    
    // Performance monitoring
    this.performanceMetrics = {
      collaborationEvents: 0,
      syncLatency: [],
      averageLatency: 0,
      lastSyncTime: null,
      messagesSent: 0,
      messagesReceived: 0
    };
    
    console.log('🤝 Real-time Collaboration Agent initialized');
    console.log(`👤 User: ${this.userName} (${this.userId})`);
  }
  
  async init() {
    try {
      console.log('🚀 Initializing Real-time Collaboration Agent...');
      
      // Connect to broker
      await this.connectToBroker();
      
      // Setup presence tracking
      this.setupPresenceTracking();
      
      // Initialize UI components
      this.initializeCollaborationUI();
      
      // Setup cursor tracking
      this.setupCursorTracking();
      
      // Initialize state synchronization
      this.initializeStateSyncing();
      
      // Setup DOM observation
      this.setupDOMObservation();
      
      // Initialize chat system
      this.initializeChatSystem();
      
      // Initialize element selection synchronization
      await this.initializeElementSelectionSync();
      
      // Initialize collaborative annotations
      await this.initializeCollaborativeAnnotations();
      
      // Initialize AI agent integration
      await this.initializeAIAgentIntegration();
      
      console.log('✅ Real-time Collaboration Agent ready');
      return { success: true, agent: this.agentId, userId: this.userId };
      
    } catch (error) {
      console.error('❌ Failed to initialize Real-time Collaboration Agent:', error);
      throw error;
    }
  }
  
  /**
   * Connect to WebSocket broker
   */
  async connectToBroker() {
    try {
      console.log('🔄 Connecting to collaboration broker...');
      
      this.brokerWs = new WebSocket(`${this.brokerURL}?token=${this.brokerToken}&agent=${this.agentId}&userId=${this.userId}`);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Broker connection timeout'));
        }, 10000);
        
        this.brokerWs.onopen = () => {
          console.log('✅ Connected to collaboration broker');
          clearTimeout(timeout);
          this.registerAgent();
          resolve();
        };
        
        this.brokerWs.onmessage = (event) => {
          this.handleBrokerMessage(event);
        };
        
        this.brokerWs.onclose = () => {
          console.log('❌ Disconnected from collaboration broker');
          this.isRegistered = false;
          this.handleDisconnection();
          
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
      console.error('❌ Failed to connect to collaboration broker:', error);
      throw error;
    }
  }
  
  /**
   * Register agent with broker
   */
  registerAgent() {
    const registrationMessage = {
      role: 'collaboration-agent',
      agentId: this.agentId,
      name: this.name,
      version: this.version,
      userId: this.userId,
      userName: this.userName,
      userRole: this.userRole,
      capabilities: [
        'multi-user-sessions',
        'presence-tracking',
        'state-synchronization',
        'collaborative-cursors',
        'chat-messaging',
        'screen-sharing',
        'voice-video-collaboration',
        'annotations',
        'conflict-resolution',
        'activity-monitoring'
      ],
      presence: {
        status: this.presenceManager.currentStatus,
        lastActivity: this.presenceManager.lastActivity
      },
      timestamp: Date.now()
    };
    
    console.log('🤖 Registering collaboration agent...');
    this.brokerWs.send(JSON.stringify(registrationMessage));
  }
  
  /**
   * Handle incoming broker messages
   */
  async handleBrokerMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.performanceMetrics.messagesReceived++;
      
      // Handle registration confirmation
      if (data.ok && data.registered === 'collaboration-agent') {
        this.isRegistered = true;
        console.log('✅ Registered as collaboration agent');
        return;
      }
      
      // Handle collaboration events
      if (data.type) {
        await this.handleCollaborationEvent(data);
      }
      
    } catch (error) {
      console.error('❌ Failed to handle broker message:', error);
    }
  }
  
  /**
   * Handle collaboration-specific events
   */
  async handleCollaborationEvent(data) {
    const { type, sessionId, userId, ...payload } = data;
    
    try {
      this.performanceMetrics.collaborationEvents++;
      const startTime = Date.now();
      
      switch (type) {
        case 'session_join':
          await this.handleUserJoin(userId, payload);
          break;
        case 'session_leave':
          await this.handleUserLeave(userId, payload);
          break;
        case 'presence_update':
          await this.handlePresenceUpdate(userId, payload);
          break;
        case 'cursor_move':
          await this.handleRemoteCursor(userId, payload);
          break;
        case 'state_sync':
          await this.handleStateSync(payload);
          break;
        case 'chat_message':
          await this.handleChatMessage(userId, payload);
          break;
        case 'typing_indicator':
          await this.handleTypingIndicator(userId, payload);
          break;
        case 'screen_share_start':
          await this.handleScreenShareStart(userId, payload);
          break;
        case 'screen_share_stop':
          await this.handleScreenShareStop(userId, payload);
          break;
        case 'annotation_create':
          await this.handleAnnotationCreate(userId, payload);
          break;
        case 'webrtc_signal':
          await this.handleWebRTCSignal(userId, payload);
          break;
        default:
          console.warn('Unknown collaboration event:', type);
      }
      
      // Track latency
      const latency = Date.now() - startTime;
      this.performanceMetrics.syncLatency.push(latency);
      if (this.performanceMetrics.syncLatency.length > 100) {
        this.performanceMetrics.syncLatency.shift();
      }
      this.performanceMetrics.averageLatency = 
        this.performanceMetrics.syncLatency.reduce((a, b) => a + b, 0) / 
        this.performanceMetrics.syncLatency.length;
      
    } catch (error) {
      console.error(`❌ Failed to handle collaboration event ${type}:`, error);
    }
  }
  
  /**
   * Setup presence tracking
   */
  setupPresenceTracking() {
    // Update presence based on user activity
    this.setupActivityTracking();
    
    // Periodic presence heartbeat
    setInterval(() => {
      this.sendPresenceUpdate();
    }, this.presenceManager.presenceTimeout / 2);
    
    // Monitor inactive users
    setInterval(() => {
      this.checkInactiveUsers();
    }, this.presenceManager.activityThreshold);
  }
  
  setupActivityTracking() {
    let lastActivity = Date.now();
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      lastActivity = Date.now();
      this.presenceManager.lastActivity = lastActivity;
      
      if (this.presenceManager.currentStatus !== 'active') {
        this.updateUserPresence('active');
      }
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Check for inactivity
    setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      
      if (inactiveTime > this.presenceManager.activityThreshold) {
        if (this.presenceManager.currentStatus === 'active') {
          this.updateUserPresence('away');
        }
      }
    }, 10000); // Check every 10 seconds
  }
  
  updateUserPresence(status) {
    if (this.presenceManager.currentStatus !== status) {
      this.presenceManager.currentStatus = status;
      this.sendPresenceUpdate();
    }
  }
  
  sendPresenceUpdate() {
    if (!this.isRegistered) return;
    
    const presenceData = {
      type: 'presence_update',
      userId: this.userId,
      status: this.presenceManager.currentStatus,
      lastActivity: this.presenceManager.lastActivity,
      timestamp: Date.now()
    };
    
    this.brokerWs.send(JSON.stringify(presenceData));
  }
  
  /**
   * Setup cursor tracking
   */
  setupCursorTracking() {
    let lastSent = 0;
    
    document.addEventListener('mousemove', (event) => {
      const now = Date.now();
      if (now - lastSent < this.cursors.throttleDelay) return;
      
      this.cursors.local = {
        x: event.clientX,
        y: event.clientY,
        visible: true,
        timestamp: now
      };
      
      this.sendCursorUpdate();
      lastSent = now;
    });
    
    document.addEventListener('mouseout', () => {
      this.cursors.local.visible = false;
      this.sendCursorUpdate();
    });
    
    // Create cursor elements container
    this.createCursorElements();
  }
  
  sendCursorUpdate() {
    if (!this.isRegistered) return;
    
    const cursorData = {
      type: 'cursor_move',
      userId: this.userId,
      cursor: this.cursors.local,
      timestamp: Date.now()
    };
    
    this.brokerWs.send(JSON.stringify(cursorData));
  }
  
  createCursorElements() {
    const container = document.createElement('div');
    container.id = 'collaboration-cursors';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 10000;
      width: 100vw;
      height: 100vh;
    `;
    document.body.appendChild(container);
  }
  
  /**
   * Initialize state synchronization
   */
  initializeStateSyncing() {
    // Batch state changes for efficiency
    this.stateSyncBatch = [];
    this.stateSyncTimer = null;
    
    // Observe DOM mutations
    this.observeStateChanges();
    
    // Periodic state sync
    setInterval(() => {
      this.flushStateSyncBatch();
    }, 1000);
  }
  
  observeStateChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' || mutation.type === 'childList') {
          this.queueStateChange({
            type: mutation.type,
            target: this.getElementSelector(mutation.target),
            changes: this.serializeMutation(mutation),
            timestamp: Date.now()
          });
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeOldValue: true
    });
  }
  
  queueStateChange(change) {
    this.stateSyncBatch.push(change);
    
    if (this.stateSyncTimer) {
      clearTimeout(this.stateSyncTimer);
    }
    
    this.stateSyncTimer = setTimeout(() => {
      this.flushStateSyncBatch();
    }, 100); // Debounce rapid changes
  }
  
  flushStateSyncBatch() {
    if (this.stateSyncBatch.length === 0) return;
    
    const syncData = {
      type: 'state_sync',
      userId: this.userId,
      changes: this.stateSyncBatch,
      version: ++this.sharedState.version,
      timestamp: Date.now()
    };
    
    if (this.isRegistered) {
      this.brokerWs.send(JSON.stringify(syncData));
    }
    
    this.stateSyncBatch = [];
    this.performanceMetrics.lastSyncTime = Date.now();
  }
  
  /**
   * Initialize collaboration UI
   */
  initializeCollaborationUI() {
    this.createCollaborationPanel();
    this.createChatInterface();
    this.createUserPresenceIndicators();
  }
  
  createCollaborationPanel() {
    const panel = document.createElement('div');
    panel.id = 'collaboration-panel';
    panel.className = 'collaboration-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: rgba(16, 0, 43, 0.95);
      border: 1px solid rgba(107, 70, 193, 0.3);
      border-radius: 12px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 9999;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      max-height: 500px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;
    
    panel.innerHTML = `
      <div class="collaboration-header" style="padding: 16px; border-bottom: 1px solid rgba(107, 70, 193, 0.2); display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">🤝 Collaboration</h3>
        <div class="presence-status" style="display: flex; align-items: center; gap: 8px;">
          <div class="status-indicator" style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%;"></div>
          <span class="status-text">Active</span>
        </div>
      </div>
      <div class="collaboration-content" style="padding: 16px; flex: 1; overflow-y: auto;">
        <div class="users-section">
          <h4 style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.8;">Users Online</h4>
          <div class="users-list" id="collaboration-users-list"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
  }
  
  createChatInterface() {
    if (!this.chat.enabled) return;
    
    const chatContainer = document.createElement('div');
    chatContainer.id = 'collaboration-chat';
    chatContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 400px;
      background: rgba(16, 0, 43, 0.95);
      border: 1px solid rgba(107, 70, 193, 0.3);
      border-radius: 12px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 9998;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.3s ease;
    `;
    
    chatContainer.innerHTML = `
      <div class="chat-header" style="padding: 16px; border-bottom: 1px solid rgba(107, 70, 193, 0.2); display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">💬 Team Chat</h3>
        <button class="chat-toggle" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
      </div>
      <div class="chat-messages" id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; font-size: 13px;"></div>
      <div class="chat-input-area" style="padding: 16px; border-top: 1px solid rgba(107, 70, 193, 0.2);">
        <div class="typing-indicators" id="typing-indicators" style="height: 16px; font-size: 11px; opacity: 0.7; margin-bottom: 8px;"></div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="chat-input" placeholder="Type a message..." style="flex: 1; padding: 8px 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(107, 70, 193, 0.3); border-radius: 6px; color: white; font-size: 13px;">
          <button id="send-chat" style="padding: 8px 16px; background: rgba(107, 70, 193, 0.8); border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 13px;">Send</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatContainer);
    this.setupChatEventListeners();
    
    // Add chat toggle button to collaboration panel
    const collaborationPanel = document.getElementById('collaboration-panel');
    if (collaborationPanel) {
      const chatToggle = document.createElement('button');
      chatToggle.innerHTML = '💬 Chat';
      chatToggle.style.cssText = `
        margin-top: 12px;
        padding: 8px 16px;
        background: rgba(107, 70, 193, 0.8);
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-size: 12px;
        width: 100%;
      `;
      chatToggle.onclick = () => this.toggleChat();
      collaborationPanel.querySelector('.collaboration-content').appendChild(chatToggle);
    }
  }
  
  setupChatEventListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-chat');
    const chatToggle = document.querySelector('.chat-toggle');
    
    if (chatInput && sendButton) {
      const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message) {
          this.sendChatMessage(message);
          chatInput.value = '';
          this.stopTyping();
        }
      };
      
      sendButton.onclick = sendMessage;
      chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        } else {
          this.startTyping();
        }
      };
      
      // Stop typing when user stops
      let typingTimeout;
      chatInput.oninput = () => {
        this.startTyping();
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => this.stopTyping(), 2000);
      };
    }
    
    if (chatToggle) {
      chatToggle.onclick = () => this.toggleChat();
    }
  }
  
  toggleChat() {
    const chatContainer = document.getElementById('collaboration-chat');
    if (chatContainer) {
      const isVisible = chatContainer.style.transform === 'translateY(0%)';
      chatContainer.style.transform = isVisible ? 'translateY(100%)' : 'translateY(0%)';
      
      if (!isVisible) {
        this.chat.unreadCount = 0;
        this.updateChatNotification();
      }
    }
  }
  
  /**
   * Utility methods
   */
  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
  
  serializeMutation(mutation) {
    return {
      type: mutation.type,
      attributeName: mutation.attributeName,
      oldValue: mutation.oldValue,
      addedNodes: mutation.addedNodes.length,
      removedNodes: mutation.removedNodes.length
    };
  }
  
  /**
   * Event handlers
   */
  async handleUserJoin(userId, data) {
    if (userId === this.userId) return;
    
    this.presenceManager.users.set(userId, {
      id: userId,
      name: data.userName || 'Anonymous',
      role: data.userRole || 'participant',
      status: 'active',
      joinedAt: Date.now(),
      cursor: { x: 0, y: 0, visible: false }
    });
    
    this.updateUserPresenceUI();
    this.showNotification(`${data.userName || 'A user'} joined the session`);
    
    console.log(`👤 User joined: ${data.userName} (${userId})`);
  }
  
  async handleUserLeave(userId, data) {
    if (userId === this.userId) return;
    
    const user = this.presenceManager.users.get(userId);
    if (user) {
      this.presenceManager.users.delete(userId);
      this.updateUserPresenceUI();
      this.removeCursor(userId);
      this.showNotification(`${user.name} left the session`);
      
      console.log(`👤 User left: ${user.name} (${userId})`);
    }
  }
  
  async handlePresenceUpdate(userId, data) {
    if (userId === this.userId) return;
    
    const user = this.presenceManager.users.get(userId);
    if (user) {
      user.status = data.status;
      user.lastActivity = data.lastActivity;
      this.updateUserPresenceUI();
    }
  }
  
  async handleRemoteCursor(userId, data) {
    if (userId === this.userId) return;
    
    this.cursors.remote.set(userId, data.cursor);
    this.updateRemoteCursor(userId, data.cursor);
  }
  
  updateRemoteCursor(userId, cursor) {
    const container = document.getElementById('collaboration-cursors');
    if (!container) return;
    
    let cursorElement = document.getElementById(`cursor-${userId}`);
    if (!cursorElement) {
      cursorElement = document.createElement('div');
      cursorElement.id = `cursor-${userId}`;
      cursorElement.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        pointer-events: none;
        transition: transform 0.1s ease;
        z-index: 10001;
      `;
      
      const user = this.presenceManager.users.get(userId);
      const color = this.getUserColor(userId);
      
      cursorElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M0,0 L0,16 L5,11 L9,11 L13,20 L15,19 L11,10 L16,10 Z" fill="${color}" stroke="white" stroke-width="1"/>
        </svg>
        <div style="
          position: absolute;
          top: 20px;
          left: 20px;
          background: ${color};
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          font-weight: 500;
        ">${user?.name || 'Anonymous'}</div>
      `;
      
      container.appendChild(cursorElement);
    }
    
    cursorElement.style.display = cursor.visible ? 'block' : 'none';
    cursorElement.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
  }
  
  getUserColor(userId) {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', 
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }
  
  removeCursor(userId) {
    const cursorElement = document.getElementById(`cursor-${userId}`);
    if (cursorElement) {
      cursorElement.remove();
    }
    this.cursors.remote.delete(userId);
  }
  
  updateUserPresenceUI() {
    const usersList = document.getElementById('collaboration-users-list');
    if (!usersList) return;
    
    usersList.innerHTML = '';
    
    // Add self
    const selfItem = document.createElement('div');
    selfItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: rgba(107, 70, 193, 0.1);
      border-radius: 6px;
      margin-bottom: 8px;
    `;
    
    selfItem.innerHTML = `
      <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%;"></div>
      <span style="flex: 1; font-weight: 500;">${this.userName} (You)</span>
      <span style="font-size: 11px; opacity: 0.7;">${this.userRole}</span>
    `;
    
    usersList.appendChild(selfItem);
    
    // Add other users
    this.presenceManager.users.forEach((user, userId) => {
      const userItem = document.createElement('div');
      userItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        margin-bottom: 4px;
      `;
      
      const statusColor = user.status === 'active' ? '#4ade80' : 
                         user.status === 'away' ? '#fbbf24' : '#6b7280';
      
      userItem.innerHTML = `
        <div style="width: 8px; height: 8px; background: ${statusColor}; border-radius: 50%;"></div>
        <span style="flex: 1;">${user.name}</span>
        <span style="font-size: 11px; opacity: 0.7;">${user.role}</span>
      `;
      
      usersList.appendChild(userItem);
    });
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(16, 0, 43, 0.95);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid rgba(107, 70, 193, 0.3);
      backdrop-filter: blur(10px);
      z-index: 10002;
      font-size: 14px;
      animation: notification-fade-in-out 4s ease forwards;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add CSS animation
    if (!document.getElementById('collaboration-animations')) {
      const style = document.createElement('style');
      style.id = 'collaboration-animations';
      style.textContent = `
        @keyframes notification-fade-in-out {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }
  
  // Chat methods
  sendChatMessage(message) {
    const chatData = {
      type: 'chat_message',
      userId: this.userId,
      userName: this.userName,
      message: message,
      timestamp: Date.now()
    };
    
    if (this.isRegistered) {
      this.brokerWs.send(JSON.stringify(chatData));
    }
    
    this.addChatMessage(chatData);
  }
  
  async handleChatMessage(userId, data) {
    if (userId === this.userId) return;
    this.addChatMessage({ userId, ...data });
    
    // Update unread count if chat is hidden
    const chatContainer = document.getElementById('collaboration-chat');
    if (chatContainer && chatContainer.style.transform !== 'translateY(0%)') {
      this.chat.unreadCount++;
      this.updateChatNotification();
    }
  }
  
  addChatMessage(data) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      margin-bottom: 12px;
      line-height: 1.4;
    `;
    
    const isOwn = data.userId === this.userId;
    const time = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
        <span style="font-weight: 500; font-size: 12px; color: ${isOwn ? '#4ade80' : '#60a5fa'};">
          ${isOwn ? 'You' : data.userName}
        </span>
        <span style="font-size: 10px; opacity: 0.5;">${time}</span>
      </div>
      <div style="opacity: 0.9;">${data.message}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Limit message history
    this.chat.messages.push(data);
    if (this.chat.messages.length > this.chat.maxMessages) {
      this.chat.messages.shift();
      messagesContainer.removeChild(messagesContainer.firstChild);
    }
  }
  
  startTyping() {
    if (this.isRegistered) {
      this.brokerWs.send(JSON.stringify({
        type: 'typing_indicator',
        userId: this.userId,
        userName: this.userName,
        isTyping: true
      }));
    }
  }
  
  stopTyping() {
    if (this.isRegistered) {
      this.brokerWs.send(JSON.stringify({
        type: 'typing_indicator',
        userId: this.userId,
        userName: this.userName,
        isTyping: false
      }));
    }
  }
  
  async handleTypingIndicator(userId, data) {
    if (userId === this.userId) return;
    
    const typingIndicators = document.getElementById('typing-indicators');
    if (!typingIndicators) return;
    
    if (data.isTyping) {
      this.chat.typingUsers.add(userId);
    } else {
      this.chat.typingUsers.delete(userId);
    }
    
    this.updateTypingIndicators();
  }
  
  updateTypingIndicators() {
    const typingIndicators = document.getElementById('typing-indicators');
    if (!typingIndicators) return;
    
    if (this.chat.typingUsers.size === 0) {
      typingIndicators.textContent = '';
      return;
    }
    
    const typingNames = Array.from(this.chat.typingUsers).map(userId => {
      const user = this.presenceManager.users.get(userId);
      return user ? user.name : 'Someone';
    });
    
    if (typingNames.length === 1) {
      typingIndicators.textContent = `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      typingIndicators.textContent = `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      typingIndicators.textContent = `${typingNames.length} people are typing...`;
    }
  }
  
  updateChatNotification() {
    // Update chat button with unread count
    // This would be implemented based on your UI framework
  }
  
  /**
   * Get agent status
   */
  getStatus() {
    return {
      connected: this.brokerWs?.readyState === WebSocket.OPEN,
      registered: this.isRegistered,
      agentId: this.agentId,
      userId: this.userId,
      userName: this.userName,
      sessionId: this.sessionId,
      activeUsers: this.presenceManager.users.size + 1, // +1 for self
      presenceStatus: this.presenceManager.currentStatus,
      performanceMetrics: this.performanceMetrics,
      timestamp: Date.now()
    };
  }
  
  /**
   * Cleanup and disconnect
   */
  disconnect() {
    if (this.brokerWs) {
      console.log('🔄 Disconnecting from collaboration broker...');
      this.isRegistered = false;
      this.brokerWs.close();
      this.brokerWs = null;
      
      // Clean up UI
      const elements = [
        'collaboration-panel',
        'collaboration-chat',
        'collaboration-cursors'
      ];
      
      elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
      });
    }
  }
  
  handleDisconnection() {
    // Handle disconnection gracefully
    this.presenceManager.users.clear();
    this.cursors.remote.clear();
    this.updateUserPresenceUI();
    
    // Show disconnected state
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    if (statusIndicator && statusText) {
      statusIndicator.style.background = '#ef4444';
      statusText.textContent = 'Disconnected';
    }
  }
  
  /**
   * Initialize element selection synchronization
   * Enables real-time synchronization of element selections across users
   */
  async initializeElementSelectionSync() {
    console.log('🔄 Initializing element selection synchronization...');
    
    // Element selection state
    this.elementSelection = {
      currentSelected: null,
      remoteSelections: new Map(),
      selectionOverlays: new Map(),
      syncEnabled: true
    };
    
    // Create selection overlay container
    this.createSelectionOverlayContainer();
    
    // Setup selection event listeners
    this.setupSelectionEventListeners();
    
    // Setup keyboard shortcuts for selection
    this.setupSelectionKeyboardShortcuts();
    
    console.log('✅ Element selection synchronization initialized');
  }
  
  createSelectionOverlayContainer() {
    const container = document.createElement('div');
    container.id = 'collaboration-selection-overlays';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
      width: 100vw;
      height: 100vh;
    `;
    document.body.appendChild(container);
  }
  
  setupSelectionEventListeners() {
    // Listen for element clicks to synchronize selections
    document.addEventListener('click', (event) => {
      if (!this.elementSelection.syncEnabled) return;
      
      const element = event.target;
      if (this.shouldSyncSelection(element)) {
        this.selectElement(element);
      }
    }, true);
    
    // Listen for selection clear events
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.clearElementSelection();
      }
    });
  }
  
  setupSelectionKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            this.toggleSelectionSync();
            break;
          case 'h':
            event.preventDefault();
            this.highlightSelectedElement();
            break;
        }
      }
    });
  }
  
  shouldSyncSelection(element) {
    // Skip collaboration UI elements
    const skipSelectors = [
      '#collaboration-panel',
      '#collaboration-chat',
      '#collaboration-cursors',
      '#collaboration-selection-overlays'
    ];
    
    return !skipSelectors.some(selector => 
      element.closest(selector) || element.matches(selector)
    );
  }
  
  selectElement(element) {
    // Clear previous selection
    this.clearElementSelection();
    
    // Generate CSS selector for the element
    const selector = this.generateCSSSelector(element);
    
    // Store current selection
    this.elementSelection.currentSelected = {
      element,
      selector,
      timestamp: Date.now(),
      userId: this.userId
    };
    
    // Create visual overlay
    this.createSelectionOverlay(element, this.userId);
    
    // Broadcast selection to other users
    this.broadcastElementSelection(selector);
    
    console.log('🎯 Element selected:', selector);
  }
  
  generateCSSSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Build path selector
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      // Add class if available
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/);
        if (classes.length > 0) {
          selector += '.' + classes[0];
        }
      }
      
      // Add nth-child if needed for uniqueness
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        if (siblings.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }
  
  createSelectionOverlay(element, userId) {
    const rect = element.getBoundingClientRect();
    const container = document.getElementById('collaboration-selection-overlays');
    if (!container) return;
    
    const overlay = document.createElement('div');
    overlay.id = `selection-${userId}`;
    overlay.className = 'collaboration-selection-overlay';
    
    const color = this.getUserColor(userId);
    const isOwnSelection = userId === this.userId;
    
    overlay.style.cssText = `
      position: absolute;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid ${color};
      border-radius: 4px;
      background: ${color}15;
      pointer-events: none;
      z-index: 9999;
      animation: selection-pulse 2s ease-in-out;
    `;
    
    // Add user label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: -24px;
      left: 0;
      background: ${color};
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
    `;
    
    const user = this.presenceManager.users.get(userId);
    label.textContent = isOwnSelection ? 'You' : (user?.name || 'Anonymous');
    overlay.appendChild(label);
    
    container.appendChild(overlay);
    this.elementSelection.selectionOverlays.set(userId, overlay);
    
    // Add selection pulse animation if not exists
    this.addSelectionStyles();
  }
  
  addSelectionStyles() {
    if (!document.getElementById('collaboration-selection-styles')) {
      const style = document.createElement('style');
      style.id = 'collaboration-selection-styles';
      style.textContent = `
        @keyframes selection-pulse {
          0% { opacity: 0; transform: scale(1.1); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1); }
        }
        
        .collaboration-selection-overlay:hover {
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  broadcastElementSelection(selector) {
    if (!this.isRegistered) return;
    
    const selectionData = {
      type: 'element_selection',
      userId: this.userId,
      userName: this.userName,
      selector,
      timestamp: Date.now()
    };
    
    this.brokerWs.send(JSON.stringify(selectionData));
  }
  
  clearElementSelection() {
    // Clear local selection
    this.elementSelection.currentSelected = null;
    
    // Remove own overlay
    const ownOverlay = this.elementSelection.selectionOverlays.get(this.userId);
    if (ownOverlay) {
      ownOverlay.remove();
      this.elementSelection.selectionOverlays.delete(this.userId);
    }
    
    // Broadcast clear selection
    if (this.isRegistered) {
      this.brokerWs.send(JSON.stringify({
        type: 'element_selection_clear',
        userId: this.userId,
        timestamp: Date.now()
      }));
    }
  }
  
  /**
   * Initialize collaborative annotations
   * Enables drawing, highlighting, and commenting on the interface
   */
  async initializeCollaborativeAnnotations() {
    console.log('🔄 Initializing collaborative annotations...');
    
    // Annotation state management
    this.annotations = {
      active: [],
      history: [],
      tools: {
        pointer: { name: 'Pointer', icon: '👆', active: false },
        highlight: { name: 'Highlight', icon: '🟡', active: false },
        comment: { name: 'Comment', icon: '💬', active: false },
        draw: { name: 'Draw', icon: '✏️', active: false },
        arrow: { name: 'Arrow', icon: '➡️', active: false }
      },
      currentTool: 'pointer',
      canvas: null,
      context: null,
      isDrawing: false,
      currentPath: [],
      remoteAnnotations: new Map()
    };
    
    // Create annotation canvas
    this.createAnnotationCanvas();
    
    // Setup annotation toolbar
    this.createAnnotationToolbar();
    
    // Setup annotation event listeners
    this.setupAnnotationEventListeners();
    
    console.log('✅ Collaborative annotations initialized');
  }
  
  createAnnotationCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'collaboration-annotation-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9998;
    `;
    
    document.body.appendChild(canvas);
    
    this.annotations.canvas = canvas;
    this.annotations.context = canvas.getContext('2d');
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.redrawAnnotations();
    });
  }
  
  createAnnotationToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'collaboration-annotation-toolbar';
    toolbar.style.cssText = `
      position: fixed;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      background: rgba(16, 0, 43, 0.95);
      border: 1px solid rgba(107, 70, 193, 0.3);
      border-radius: 12px;
      padding: 12px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;
    
    // Create tool buttons
    Object.entries(this.annotations.tools).forEach(([tool, config]) => {
      const button = document.createElement('button');
      button.id = `annotation-tool-${tool}`;
      button.style.cssText = `
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        position: relative;
      `;
      
      button.innerHTML = config.icon;
      button.title = config.name;
      
      button.addEventListener('click', () => this.selectAnnotationTool(tool));
      
      // Hover effect
      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(107, 70, 193, 0.5)';
      });
      
      button.addEventListener('mouseleave', () => {
        if (this.annotations.currentTool !== tool) {
          button.style.background = 'transparent';
        }
      });
      
      toolbar.appendChild(button);
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: white;
      font-size: 20px;
      cursor: pointer;
      margin-top: 12px;
      border-top: 1px solid rgba(107, 70, 193, 0.3);
      padding-top: 12px;
    `;
    closeButton.onclick = () => this.toggleAnnotationMode(false);
    toolbar.appendChild(closeButton);
    
    document.body.appendChild(toolbar);
    
    // Add annotation toggle to collaboration panel
    this.addAnnotationToggleButton();
  }
  
  addAnnotationToggleButton() {
    const collaborationPanel = document.getElementById('collaboration-panel');
    if (collaborationPanel) {
      const annotationToggle = document.createElement('button');
      annotationToggle.innerHTML = '🎨 Annotations';
      annotationToggle.style.cssText = `
        margin-top: 8px;
        padding: 8px 16px;
        background: rgba(107, 70, 193, 0.8);
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-size: 12px;
        width: 100%;
      `;
      annotationToggle.onclick = () => this.toggleAnnotationMode();
      collaborationPanel.querySelector('.collaboration-content').appendChild(annotationToggle);
    }
  }
  
  toggleAnnotationMode(show = null) {
    const toolbar = document.getElementById('collaboration-annotation-toolbar');
    const canvas = this.annotations.canvas;
    
    if (!toolbar || !canvas) return;
    
    const isVisible = toolbar.style.visibility === 'visible';
    const shouldShow = show !== null ? show : !isVisible;
    
    if (shouldShow) {
      toolbar.style.opacity = '1';
      toolbar.style.visibility = 'visible';
      canvas.style.pointerEvents = 'auto';
      this.selectAnnotationTool('pointer');
    } else {
      toolbar.style.opacity = '0';
      toolbar.style.visibility = 'hidden';
      canvas.style.pointerEvents = 'none';
      this.annotations.currentTool = 'pointer';
      this.updateToolSelection();
    }
  }
  
  selectAnnotationTool(tool) {
    this.annotations.currentTool = tool;
    this.updateToolSelection();
    
    // Enable drawing for draw and arrow tools
    const canvas = this.annotations.canvas;
    if (tool === 'draw' || tool === 'arrow') {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'default';
    }
  }
  
  updateToolSelection() {
    Object.keys(this.annotations.tools).forEach(tool => {
      const button = document.getElementById(`annotation-tool-${tool}`);
      if (button) {
        if (tool === this.annotations.currentTool) {
          button.style.background = 'rgba(107, 70, 193, 0.8)';
        } else {
          button.style.background = 'transparent';
        }
      }
    });
  }
  
  setupAnnotationEventListeners() {
    const canvas = this.annotations.canvas;
    
    canvas.addEventListener('mousedown', (e) => this.startAnnotation(e));
    canvas.addEventListener('mousemove', (e) => this.continueAnnotation(e));
    canvas.addEventListener('mouseup', (e) => this.endAnnotation(e));
    
    // Handle touch events for mobile
    canvas.addEventListener('touchstart', (e) => this.startAnnotation(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.continueAnnotation(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.endAnnotation(e));
  }
  
  startAnnotation(event) {
    if (this.annotations.currentTool === 'pointer') return;
    
    event.preventDefault();
    this.annotations.isDrawing = true;
    
    const rect = this.annotations.canvas.getBoundingClientRect();
    const x = (event.clientX || event.touches[0].clientX) - rect.left;
    const y = (event.clientY || event.touches[0].clientY) - rect.top;
    
    this.annotations.currentPath = [{ x, y, timestamp: Date.now() }];
    
    if (this.annotations.currentTool === 'draw') {
      this.annotations.context.beginPath();
      this.annotations.context.moveTo(x, y);
    }
  }
  
  continueAnnotation(event) {
    if (!this.annotations.isDrawing || this.annotations.currentTool === 'pointer') return;
    
    event.preventDefault();
    
    const rect = this.annotations.canvas.getBoundingClientRect();
    const x = (event.clientX || event.touches[0].clientX) - rect.left;
    const y = (event.clientY || event.touches[0].clientY) - rect.top;
    
    this.annotations.currentPath.push({ x, y, timestamp: Date.now() });
    
    if (this.annotations.currentTool === 'draw') {
      this.annotations.context.lineTo(x, y);
      this.annotations.context.strokeStyle = this.getUserColor(this.userId);
      this.annotations.context.lineWidth = 3;
      this.annotations.context.lineCap = 'round';
      this.annotations.context.stroke();
    }
  }
  
  endAnnotation(event) {
    if (!this.annotations.isDrawing) return;
    
    this.annotations.isDrawing = false;
    
    // Create annotation object
    const annotation = {
      id: `annotation-${Date.now()}-${this.userId}`,
      userId: this.userId,
      userName: this.userName,
      tool: this.annotations.currentTool,
      path: this.annotations.currentPath,
      color: this.getUserColor(this.userId),
      timestamp: Date.now()
    };
    
    // Store annotation
    this.annotations.active.push(annotation);
    
    // Broadcast annotation
    this.broadcastAnnotation(annotation);
    
    // Clear current path
    this.annotations.currentPath = [];
  }
  
  broadcastAnnotation(annotation) {
    if (!this.isRegistered) return;
    
    const annotationData = {
      type: 'annotation_create',
      userId: this.userId,
      annotation,
      timestamp: Date.now()
    };
    
    this.brokerWs.send(JSON.stringify(annotationData));
  }
  
  redrawAnnotations() {
    const ctx = this.annotations.context;
    ctx.clearRect(0, 0, this.annotations.canvas.width, this.annotations.canvas.height);
    
    // Redraw all active annotations
    [...this.annotations.active, ...Array.from(this.annotations.remoteAnnotations.values())].forEach(annotation => {
      this.drawAnnotation(annotation);
    });
  }
  
  drawAnnotation(annotation) {
    const ctx = this.annotations.context;
    
    if (annotation.tool === 'draw' && annotation.path.length > 1) {
      ctx.beginPath();
      ctx.moveTo(annotation.path[0].x, annotation.path[0].y);
      
      annotation.path.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      
      ctx.strokeStyle = annotation.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else if (annotation.tool === 'arrow' && annotation.path.length >= 2) {
      const start = annotation.path[0];
      const end = annotation.path[annotation.path.length - 1];
      
      this.drawArrow(ctx, start.x, start.y, end.x, end.y, annotation.color);
    }
  }
  
  drawArrow(ctx, fromX, fromY, toX, toY, color) {
    const headLength = 20;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  
  /**
   * Initialize AI agent integration
   * Enables AI agents to participate in collaboration sessions
   */
  async initializeAIAgentIntegration() {
    console.log('🔄 Initializing AI agent integration...');
    
    // AI agent state management
    this.aiAgents = {
      active: new Map(),
      capabilities: new Set(),
      communicationChannel: null,
      presenceIndicators: new Map(),
      activityTracking: {
        requests: [],
        responses: [],
        metrics: {
          totalRequests: 0,
          avgResponseTime: 0,
          activeAgents: 0
        }
      }
    };
    
    // Setup AI agent communication
    this.setupAIAgentCommunication();
    
    // Create AI presence indicators
    this.createAIPresenceIndicators();
    
    // Setup AI agent event listeners
    this.setupAIAgentEventListeners();
    
    // Initialize collaboration request handling
    this.initializeCollaborationRequestHandling();
    
    console.log('✅ AI agent integration initialized');
  }
  
  setupAIAgentCommunication() {
    // Create broadcast channel for AI agent communication
    this.aiAgents.communicationChannel = new BroadcastChannel('verridian-ai-collaboration');
    
    this.aiAgents.communicationChannel.addEventListener('message', (event) => {
      this.handleAIAgentMessage(event.data);
    });
    
    // Announce collaboration availability to AI agents
    this.announceCollaborationAvailability();
  }
  
  announceCollaborationAvailability() {
    const announcement = {
      type: 'collaboration_available',
      sessionId: this.sessionId,
      userId: this.userId,
      userName: this.userName,
      capabilities: [
        'element-selection-sync',
        'collaborative-annotations',
        'presence-tracking',
        'chat-integration',
        'state-synchronization'
      ],
      timestamp: Date.now()
    };
    
    this.aiAgents.communicationChannel.postMessage(announcement);
  }
  
  createAIPresenceIndicators() {
    const indicatorContainer = document.createElement('div');
    indicatorContainer.id = 'ai-agent-indicators';
    indicatorContainer.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9997;
    `;
    
    document.body.appendChild(indicatorContainer);
  }
  
  setupAIAgentEventListeners() {
    // Listen for AI agent registration
    document.addEventListener('ai-agent-register', (event) => {
      this.registerAIAgent(event.detail);
    });
    
    // Listen for AI agent deregistration
    document.addEventListener('ai-agent-unregister', (event) => {
      this.unregisterAIAgent(event.detail.agentId);
    });
    
    // Listen for AI agent activity
    document.addEventListener('ai-agent-activity', (event) => {
      this.trackAIAgentActivity(event.detail);
    });
  }
  
  initializeCollaborationRequestHandling() {
    // Handle requests from AI agents for collaboration features
    this.collaborationRequestHandlers = {
      'highlight-element': this.handleHighlightElementRequest.bind(this),
      'annotate-element': this.handleAnnotateElementRequest.bind(this),
      'send-chat-message': this.handleChatMessageRequest.bind(this),
      'get-user-presence': this.handlePresenceRequest.bind(this),
      'sync-state-change': this.handleStateSyncRequest.bind(this)
    };
  }
  
  handleAIAgentMessage(data) {
    const { type, agentId, ...payload } = data;
    
    switch (type) {
      case 'agent_join':
        this.handleAIAgentJoin(agentId, payload);
        break;
      case 'agent_leave':
        this.handleAIAgentLeave(agentId, payload);
        break;
      case 'collaboration_request':
        this.handleCollaborationRequest(agentId, payload);
        break;
      case 'activity_update':
        this.handleAIActivityUpdate(agentId, payload);
        break;
      default:
        console.log('Unknown AI agent message type:', type);
    }
  }
  
  handleAIAgentJoin(agentId, data) {
    console.log('🤖 AI Agent joined collaboration:', agentId);
    
    const aiAgent = {
      id: agentId,
      name: data.name || 'AI Agent',
      capabilities: data.capabilities || [],
      status: 'active',
      joinedAt: Date.now(),
      lastActivity: Date.now()
    };
    
    this.aiAgents.active.set(agentId, aiAgent);
    this.createAIPresenceIndicator(aiAgent);
    this.updateAIMetrics();
    
    // Notify human users
    this.showNotification(`🤖 ${aiAgent.name} is now assisting with collaboration`);
  }
  
  handleAIAgentLeave(agentId, data) {
    const aiAgent = this.aiAgents.active.get(agentId);
    if (aiAgent) {
      console.log('🤖 AI Agent left collaboration:', agentId);
      
      this.aiAgents.active.delete(agentId);
      this.removeAIPresenceIndicator(agentId);
      this.updateAIMetrics();
      
      this.showNotification(`🤖 ${aiAgent.name} is no longer assisting`);
    }
  }
  
  createAIPresenceIndicator(aiAgent) {
    const container = document.getElementById('ai-agent-indicators');
    if (!container) return;
    
    const indicator = document.createElement('div');
    indicator.id = `ai-indicator-${aiAgent.id}`;
    indicator.style.cssText = `
      background: rgba(16, 0, 43, 0.95);
      border: 1px solid rgba(107, 70, 193, 0.3);
      border-radius: 8px;
      padding: 8px 12px;
      color: white;
      font-size: 12px;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: ai-indicator-fade-in 0.3s ease;
    `;
    
    indicator.innerHTML = `
      <div style="
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        animation: ai-pulse 2s ease-in-out infinite;
      "></div>
      <span>🤖 ${aiAgent.name}</span>
      <div style="
        font-size: 10px;
        opacity: 0.7;
        margin-left: auto;
      ">Active</div>
    `;
    
    container.appendChild(indicator);
    this.aiAgents.presenceIndicators.set(aiAgent.id, indicator);
    
    // Add AI indicator animations if not exists
    this.addAIIndicatorStyles();
  }
  
  addAIIndicatorStyles() {
    if (!document.getElementById('ai-indicator-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-indicator-styles';
      style.textContent = `
        @keyframes ai-indicator-fade-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes ai-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  removeAIPresenceIndicator(agentId) {
    const indicator = this.aiAgents.presenceIndicators.get(agentId);
    if (indicator) {
      indicator.style.animation = 'ai-indicator-fade-in 0.3s ease reverse';
      setTimeout(() => indicator.remove(), 300);
      this.aiAgents.presenceIndicators.delete(agentId);
    }
  }
  
  handleCollaborationRequest(agentId, data) {
    const { requestType, requestId, ...params } = data;
    const handler = this.collaborationRequestHandlers[requestType];
    
    if (handler) {
      const startTime = Date.now();
      
      try {
        const result = handler(params, agentId);
        const responseTime = Date.now() - startTime;
        
        // Track metrics
        this.aiAgents.activityTracking.requests.push({
          agentId,
          requestType,
          timestamp: startTime,
          responseTime,
          success: true
        });
        
        // Send response back to AI agent
        this.sendCollaborationResponse(agentId, requestId, { success: true, result });
        
      } catch (error) {
        console.error('Failed to handle collaboration request:', error);
        
        this.aiAgents.activityTracking.requests.push({
          agentId,
          requestType,
          timestamp: startTime,
          responseTime: Date.now() - startTime,
          success: false,
          error: error.message
        });
        
        this.sendCollaborationResponse(agentId, requestId, { success: false, error: error.message });
      }
      
      this.updateAIMetrics();
    } else {
      console.warn('Unknown collaboration request type:', requestType);
      this.sendCollaborationResponse(agentId, requestId, { success: false, error: 'Unknown request type' });
    }
  }
  
  sendCollaborationResponse(agentId, requestId, response) {
    this.aiAgents.communicationChannel.postMessage({
      type: 'collaboration_response',
      targetAgent: agentId,
      requestId,
      response,
      timestamp: Date.now()
    });
  }
  
  // Collaboration request handlers
  handleHighlightElementRequest(params, agentId) {
    const { selector, duration = 3000 } = params;
    const element = document.querySelector(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    // Create temporary highlight
    const highlight = document.createElement('div');
    const rect = element.getBoundingClientRect();
    
    highlight.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 3px solid #10b981;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.1);
      pointer-events: none;
      z-index: 10000;
      animation: ai-highlight-pulse 1s ease-in-out infinite;
    `;
    
    document.body.appendChild(highlight);
    
    setTimeout(() => {
      highlight.remove();
    }, duration);
    
    return { highlighted: selector, duration };
  }
  
  handleAnnotateElementRequest(params, agentId) {
    const { selector, annotation, type = 'comment' } = params;
    const element = document.querySelector(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    // Create annotation from AI agent
    const aiAnnotation = {
      id: `ai-annotation-${Date.now()}-${agentId}`,
      userId: agentId,
      userName: `AI: ${this.aiAgents.active.get(agentId)?.name || 'AI Agent'}`,
      tool: type,
      selector,
      annotation,
      timestamp: Date.now(),
      isAIGenerated: true
    };
    
    this.annotations.active.push(aiAnnotation);
    this.broadcastAnnotation(aiAnnotation);
    
    return { created: aiAnnotation.id };
  }
  
  handleChatMessageRequest(params, agentId) {
    const { message } = params;
    const aiAgent = this.aiAgents.active.get(agentId);
    
    if (!aiAgent) {
      throw new Error('AI agent not registered');
    }
    
    const chatData = {
      type: 'chat_message',
      userId: agentId,
      userName: `🤖 ${aiAgent.name}`,
      message,
      timestamp: Date.now(),
      isAIGenerated: true
    };
    
    // Add to local chat
    this.addChatMessage(chatData);
    
    // Broadcast to other users
    if (this.isRegistered) {
      this.brokerWs.send(JSON.stringify(chatData));
    }
    
    return { sent: true };
  }
  
  handlePresenceRequest(params, agentId) {
    const users = Array.from(this.presenceManager.users.values()).map(user => ({
      id: user.id,
      name: user.name,
      status: user.status,
      role: user.role
    }));
    
    // Add self
    users.push({
      id: this.userId,
      name: this.userName,
      status: this.presenceManager.currentStatus,
      role: this.userRole
    });
    
    return { users, total: users.length };
  }
  
  handleStateSyncRequest(params, agentId) {
    const { changes } = params;
    
    // Process state changes from AI agent
    changes.forEach(change => {
      this.queueStateChange({
        ...change,
        userId: agentId,
        source: 'ai-agent'
      });
    });
    
    return { synced: changes.length };
  }
  
  updateAIMetrics() {
    const metrics = this.aiAgents.activityTracking.metrics;
    metrics.activeAgents = this.aiAgents.active.size;
    metrics.totalRequests = this.aiAgents.activityTracking.requests.length;
    
    if (this.aiAgents.activityTracking.requests.length > 0) {
      const totalResponseTime = this.aiAgents.activityTracking.requests
        .reduce((sum, req) => sum + req.responseTime, 0);
      metrics.avgResponseTime = totalResponseTime / this.aiAgents.activityTracking.requests.length;
    }
  }

  // Additional methods would include:
  // - handleStateSync()
  // - handleScreenShareStart()
  // - handleScreenShareStop()
  // - handleAnnotationCreate()
  // - handleWebRTCSignal()
  // - setupDOMObservation()
  // - initializeChatSystem()
  // - checkInactiveUsers()
  // And more specialized collaboration features
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.RealtimeCollaborationAgent = RealtimeCollaborationAgent;
  
  // Auto-start if enabled
  if (window.VERRIDIAN_AUTO_START_AGENTS !== false) {
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        const agent = new RealtimeCollaborationAgent({
          userName: 'Test User',
          userRole: 'participant'
        });
        
        window.realtimeCollaborationAgent = agent;
        await agent.init();
        
        console.log('🤝 Real-time Collaboration Agent ready for multi-user collaboration');
        
      } catch (error) {
        console.error('❌ Failed to auto-start Real-time Collaboration Agent:', error);
      }
    });
  }
}