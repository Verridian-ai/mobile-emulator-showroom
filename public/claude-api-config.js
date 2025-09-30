/**
 * Claude API Configuration
 * Handles secure API key management and configuration for Claude Code integration
 */

class ClaudeAPIConfig {
  constructor() {
    this.apiVersion = 'v1';
    this.baseUrl = 'https://api.anthropic.com';
    this.maxTokens = 4096;
    this.temperature = 0.7;
    this.modelName = 'claude-3-5-sonnet-20241022';
    this.maxRetries = 3;
    this.timeoutMs = 30000;

    // Rate limiting configuration
    this.rateLimits = {
      requestsPerMinute: 30,
      tokensPerMinute: 40000,
      dailyRequestLimit: 1000,
    };

    // Usage tracking
    this.usageTracker = {
      requestCount: 0,
      tokenCount: 0,
      dailyUsage: this.loadDailyUsage(),
      lastReset: this.getToday(),
    };

    // Initialize API key from environment or localStorage
    this.apiKey = this.getApiKey();

    // Setup rate limiting
    this.requestQueue = [];
    this.rateLimitWindow = [];
    this.tokenWindow = [];
  }

  /**
   * Get API key from secure storage
   * Priority: Environment variable > Local storage > User prompt
   */
  getApiKey() {
    // Check for environment variable first (server-side)
    if (typeof process !== 'undefined' && process.env && process.env.CLAUDE_API_KEY) {
      return process.env.CLAUDE_API_KEY;
    }

    // Check localStorage (client-side)
    try {
      const storedKey = localStorage.getItem('claude_api_key');
      if (storedKey) {
        return storedKey;
      }
    } catch (e) {
      console.warn('localStorage not available for API key storage');
    }

    return null;
  }

  /**
   * Set API key securely
   * @param {string} apiKey - The Claude API key
   * @param {boolean} persist - Whether to persist in localStorage
   */
  setApiKey(apiKey, persist = true) {
    if (!this.validateApiKey(apiKey)) {
      throw new Error('Invalid Claude API key format');
    }

    this.apiKey = apiKey;

    if (persist) {
      try {
        localStorage.setItem('claude_api_key', apiKey);
      } catch (e) {
        console.warn('Could not persist API key to localStorage');
      }
    }
  }

  /**
   * Validate API key format
   * @param {string} apiKey
   */
  validateApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.length > 20 && apiKey.startsWith('sk-ant-');
  }

  /**
   * Check if API is configured
   */
  isConfigured() {
    return this.apiKey && this.validateApiKey(this.apiKey);
  }

  /**
   * Get headers for Claude API requests
   */
  getHeaders() {
    if (!this.isConfigured()) {
      throw new Error('Claude API key not configured');
    }

    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  /**
   * Build request URL
   * @param {string} endpoint
   */
  buildUrl(endpoint) {
    return `${this.baseUrl}/${this.apiVersion}/${endpoint}`;
  }

  /**
   * Check rate limits before making request
   */
  async checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old entries
    this.rateLimitWindow = this.rateLimitWindow.filter(time => time > oneMinuteAgo);
    this.tokenWindow = this.tokenWindow.filter(entry => entry.time > oneMinuteAgo);

    // Check request rate limit
    if (this.rateLimitWindow.length >= this.rateLimits.requestsPerMinute) {
      const waitTime = this.rateLimitWindow[0] + 60000 - now;
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Check token rate limit
    const tokensThisMinute = this.tokenWindow.reduce((sum, entry) => sum + entry.tokens, 0);
    if (tokensThisMinute >= this.rateLimits.tokensPerMinute) {
      const waitTime = this.tokenWindow[0].time + 60000 - now;
      throw new Error(`Token rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Check daily limit
    this.checkDailyLimit();
  }

  /**
   * Check daily usage limits
   */
  checkDailyLimit() {
    const today = this.getToday();

    // Reset daily usage if new day
    if (this.usageTracker.lastReset !== today) {
      this.usageTracker.dailyUsage = { requests: 0, tokens: 0 };
      this.usageTracker.lastReset = today;
      this.saveDailyUsage();
    }

    // Check daily request limit
    if (this.usageTracker.dailyUsage.requests >= this.rateLimits.dailyRequestLimit) {
      throw new Error('Daily request limit exceeded. Try again tomorrow.');
    }
  }

  /**
   * Track API usage
   * @param {number} tokens - Number of tokens used
   */
  trackUsage(tokens = 0) {
    const now = Date.now();

    // Track for rate limiting
    this.rateLimitWindow.push(now);
    if (tokens > 0) {
      this.tokenWindow.push({ time: now, tokens });
    }

    // Track overall usage
    this.usageTracker.requestCount++;
    this.usageTracker.tokenCount += tokens;
    this.usageTracker.dailyUsage.requests++;
    this.usageTracker.dailyUsage.tokens += tokens;

    this.saveDailyUsage();
  }

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    return {
      totalRequests: this.usageTracker.requestCount,
      totalTokens: this.usageTracker.tokenCount,
      dailyRequests: this.usageTracker.dailyUsage.requests,
      dailyTokens: this.usageTracker.dailyUsage.tokens,
      rateLimitRemaining: {
        requests: this.rateLimits.requestsPerMinute - this.rateLimitWindow.length,
        tokens:
          this.rateLimits.tokensPerMinute -
          this.tokenWindow.reduce((sum, entry) => sum + entry.tokens, 0),
        daily: this.rateLimits.dailyRequestLimit - this.usageTracker.dailyUsage.requests,
      },
    };
  }

  /**
   * Get today's date string for daily usage tracking
   */
  getToday() {
    return new Date().toDateString();
  }

  /**
   * Load daily usage from localStorage
   */
  loadDailyUsage() {
    try {
      const stored = localStorage.getItem('claude_daily_usage');
      return stored ? JSON.parse(stored) : { requests: 0, tokens: 0 };
    } catch (e) {
      return { requests: 0, tokens: 0 };
    }
  }

  /**
   * Save daily usage to localStorage
   */
  saveDailyUsage() {
    try {
      localStorage.setItem('claude_daily_usage', JSON.stringify(this.usageTracker.dailyUsage));
    } catch (e) {
      console.warn('Could not save daily usage stats');
    }
  }

  /**
   * Clear API key and usage data
   */
  clearConfiguration() {
    this.apiKey = null;
    try {
      localStorage.removeItem('claude_api_key');
      localStorage.removeItem('claude_daily_usage');
    } catch (e) {
      console.warn('Could not clear stored configuration');
    }
  }

  /**
   * Get model configuration for API requests
   */
  getModelConfig(overrides = {}) {
    return {
      model: overrides.model || this.modelName,
      max_tokens: overrides.maxTokens || this.maxTokens,
      temperature: overrides.temperature || this.temperature,
      stream: overrides.stream || false,
      ...overrides,
    };
  }

  /**
   * Estimate token count for a message (rough approximation)
   * @param {string} text
   */
  estimateTokens(text) {
    // Rough approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Prompt user for API key if not configured
   */
  async promptForApiKey() {
    if (this.isConfigured()) {
      return true;
    }

    return new Promise(resolve => {
      const modal = this.createApiKeyModal(resolve);
      document.body.appendChild(modal);
    });
  }

  /**
   * Create API key input modal
   */
  createApiKeyModal(onComplete) {
    const modal = document.createElement('div');
    modal.className = 'api-key-modal';
    modal.innerHTML = `
            <div class="api-key-modal-content">
                <h3>Configure Claude API</h3>
                <p>Enter your Claude API key to enable AI chat functionality:</p>
                <input type="password" id="api-key-input" placeholder="sk-ant-..." />
                <div class="api-key-actions">
                    <button id="api-key-save">Save</button>
                    <button id="api-key-cancel">Cancel</button>
                </div>
                <p class="api-key-note">
                    Your API key will be stored locally and never sent to third parties.
                    Get your key at: <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a>
                </p>
            </div>
        `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
            .api-key-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            .api-key-modal-content {
                background: white;
                padding: 24px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            .api-key-modal h3 {
                margin: 0 0 16px 0;
                color: #1e40af;
            }
            .api-key-modal input {
                width: 100%;
                padding: 8px;
                margin: 8px 0;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-family: monospace;
            }
            .api-key-actions {
                display: flex;
                gap: 8px;
                margin: 16px 0;
            }
            .api-key-actions button {
                flex: 1;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }
            #api-key-save {
                background: #3b82f6;
                color: white;
            }
            #api-key-cancel {
                background: #e5e7eb;
                color: #374151;
            }
            .api-key-note {
                font-size: 12px;
                color: #6b7280;
                margin: 8px 0 0 0;
            }
        `;
    document.head.appendChild(style);

    // Bind events
    const input = modal.querySelector('#api-key-input');
    const saveBtn = modal.querySelector('#api-key-save');
    const cancelBtn = modal.querySelector('#api-key-cancel');

    saveBtn.addEventListener('click', () => {
      const key = input.value.trim();
      if (this.validateApiKey(key)) {
        this.setApiKey(key);
        document.body.removeChild(modal);
        onComplete(true);
      } else {
        alert('Please enter a valid Claude API key (starts with sk-ant-)');
      }
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      onComplete(false);
    });

    // Focus input
    setTimeout(() => input.focus(), 100);

    return modal;
  }
}

// Create global instance
window.claudeAPIConfig = new ClaudeAPIConfig();

console.log('🔧 Claude API Configuration initialized');
