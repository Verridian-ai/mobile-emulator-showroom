/**
 * AI Chat Integration Test Functions
 * Article III: Code Quality - External, testable JavaScript
 * Article V: Security - CSP compliant
 */

/**
 * Logs status message to test results display
 * @param {string} message - Message to log
 * @param {string} type - Status type (info, success, error, warning)
 */
function logStatus(message, type = 'info') {
    const results = document.getElementById('test-results');
    const div = document.createElement('div');
    div.className = `status ${type}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    results.appendChild(div);
    results.scrollTop = results.scrollHeight;
}

/**
 * Prompts user to configure API key
 */
function configureAPI() {
    if (window.claudeAPIConfig) {
        window.claudeAPIConfig.promptForApiKey().then(success => {
            if (success) {
                logStatus('API key configured successfully!', 'success');
                refreshStats();
            } else {
                logStatus('API key configuration cancelled', 'warning');
            }
        });
    } else {
        logStatus('Claude API config not loaded', 'error');
    }
}

/**
 * Checks if API is properly configured
 */
function checkConfiguration() {
    if (window.claudeAPIConfig && window.claudeAPIConfig.isConfigured()) {
        logStatus('✅ Claude API is properly configured', 'success');
    } else {
        logStatus('❌ Claude API is not configured', 'error');
    }
}

/**
 * Tests Claude API configuration
 */
function testClaudeConfig() {
    if (!window.claudeAPIConfig) {
        logStatus('❌ Claude API config not loaded', 'error');
        return;
    }

    logStatus('✅ Claude API config loaded', 'success');
    logStatus(`Model: ${window.claudeAPIConfig.modelName}`, 'info');
    logStatus(`Max tokens: ${window.claudeAPIConfig.maxTokens}`, 'info');
    logStatus(`Configured: ${window.claudeAPIConfig.isConfigured()}`, 'info');
}

/**
 * Tests chat integration
 */
function testChatIntegration() {
    if (!window.aiChatIntegration) {
        logStatus('❌ AI Chat integration not loaded', 'error');
        return;
    }

    logStatus('✅ AI Chat integration loaded', 'success');
    logStatus(`Initialized: ${window.aiChatIntegration.isInitialized}`, 'info');
    logStatus(`Chat history: ${window.aiChatIntegration.getChatHistory().length} messages`, 'info');
}

/**
 * Tests rate limiting functionality
 */
function testRateLimiting() {
    if (!window.claudeAPIConfig) {
        logStatus('❌ Cannot test rate limiting - config not loaded', 'error');
        return;
    }

    const stats = window.claudeAPIConfig.getUsageStats();
    logStatus('Rate limiting test:', 'info');
    logStatus(`Requests remaining: ${stats.rateLimitRemaining.requests}/30 per minute`, 'info');
    logStatus(`Tokens remaining: ${stats.rateLimitRemaining.tokens}/40000 per minute`, 'info');
    logStatus(`Daily remaining: ${stats.rateLimitRemaining.daily}/1000`, 'info');
}

/**
 * Shows usage statistics
 */
function testUsageStats() {
    if (!window.claudeAPIConfig) {
        logStatus('❌ Cannot show usage stats - config not loaded', 'error');
        return;
    }

    const stats = window.claudeAPIConfig.getUsageStats();
    logStatus('📊 Usage Statistics:', 'info');
    logStatus(`Total requests: ${stats.totalRequests}`, 'info');
    logStatus(`Total tokens: ${stats.totalTokens}`, 'info');
    logStatus(`Daily requests: ${stats.dailyRequests}`, 'info');
    logStatus(`Daily tokens: ${stats.dailyTokens}`, 'info');
}

/**
 * Shows performance statistics
 */
function testPerformance() {
    if (!window.aiChatIntegration) {
        logStatus('❌ Cannot show performance stats - integration not loaded', 'error');
        return;
    }

    const stats = window.aiChatIntegration.getPerformanceStats();
    logStatus('⚡ Performance Statistics:', 'info');
    logStatus(`Total requests: ${stats.totalRequests}`, 'info');
    logStatus(`Success rate: ${stats.successRate?.toFixed(1) || 0}%`, 'info');
    logStatus(`Avg response time: ${stats.averageResponseTime}ms`, 'info');
}

/**
 * Opens AI chat panel
 */
function openAIChat() {
    if (window.aiChatIntegration) {
        const chatPanel = document.getElementById('ai-chat-panel');
        if (chatPanel) {
            chatPanel.classList.remove('collapsed');
            logStatus('AI Chat panel opened', 'success');
        } else {
            logStatus('AI Chat panel not found', 'warning');
        }
    } else {
        logStatus('AI Chat integration not available', 'error');
    }
}

/**
 * Sends a test message to Claude API
 */
async function sendTestMessage() {
    if (!window.aiChatIntegration) {
        logStatus('AI Chat not available', 'error');
        return;
    }

    if (!window.claudeAPIConfig || !window.claudeAPIConfig.isConfigured()) {
        logStatus('Please configure Claude API key first', 'warning');
        return;
    }

    try {
        logStatus('Sending test message to Claude...', 'info');
        // This would normally be done through the UI
        await window.aiChatIntegration.sendToClaudeAPI('Hello! This is a test message. Please respond briefly.');
        logStatus('Test message sent successfully', 'success');
    } catch (error) {
        logStatus(`Test message failed: ${error.message}`, 'error');
    }
}

/**
 * Triggers screenshot capture
 */
function triggerScreenshot() {
    if (window.aiChatIntegration && window.aiChatIntegration.captureScreenshotForChat) {
        window.aiChatIntegration.captureScreenshotForChat();
        logStatus('Screenshot capture triggered', 'success');
    } else {
        logStatus('Screenshot system not available', 'error');
    }
}

/**
 * Runs accessibility check
 */
function runAccessibilityCheck() {
    if (window.aiChatIntegration && window.aiChatIntegration.checkAccessibility) {
        window.aiChatIntegration.checkAccessibility();
        logStatus('Accessibility check initiated', 'success');
    } else {
        logStatus('Accessibility check not available', 'error');
    }
}

/**
 * Shows keyboard shortcuts
 */
function showKeyboardShortcuts() {
    logStatus('Keyboard Shortcuts:', 'info');
    logStatus('Ctrl+Shift+A - Toggle AI Chat', 'info');
    logStatus('Ctrl+Shift+Q - Quick Screenshot', 'info');
    logStatus('Ctrl+Enter - Send Message', 'info');
}

/**
 * Refreshes statistics display
 */
function refreshStats() {
    const statsDiv = document.getElementById('stats-display');
    let statsText = 'AI Chat Integration Statistics\n\n';

    if (window.claudeAPIConfig) {
        const usage = window.claudeAPIConfig.getUsageStats();
        statsText += `API Configuration:\n`;
        statsText += `- Model: ${window.claudeAPIConfig.modelName}\n`;
        statsText += `- Configured: ${window.claudeAPIConfig.isConfigured()}\n`;
        statsText += `- Total Requests: ${usage.totalRequests}\n`;
        statsText += `- Total Tokens: ${usage.totalTokens}\n`;
        statsText += `- Daily Requests: ${usage.dailyRequests}\n`;
        statsText += `- Daily Tokens: ${usage.dailyTokens}\n\n`;
    }

    if (window.aiChatIntegration) {
        const perf = window.aiChatIntegration.getPerformanceStats();
        statsText += `Performance Metrics:\n`;
        statsText += `- Total Requests: ${perf.totalRequests}\n`;
        statsText += `- Success Rate: ${perf.successRate?.toFixed(1) || 0}%\n`;
        statsText += `- Avg Response: ${perf.averageResponseTime}ms\n`;
        statsText += `- Chat History: ${window.aiChatIntegration.getChatHistory().length} messages\n`;
    }

    statsDiv.textContent = statsText;
}

/**
 * Clears all data (chat history and configuration)
 */
function clearAllData() {
    if (confirm('Clear all chat history and configuration data?')) {
        if (window.claudeAPIConfig) {
            window.claudeAPIConfig.clearConfiguration();
        }
        if (window.aiChatIntegration) {
            window.aiChatIntegration.clearChatHistory();
        }
        logStatus('All data cleared', 'success');
        refreshStats();
    }
}

/**
 * Initialize test page on load
 */
function initTestPage() {
    logStatus('Test page loaded', 'success');

    // Attach event listeners to all test buttons (CSP compliant)
    const buttons = document.querySelectorAll('button[data-action]');
    buttons.forEach(button => {
        const action = button.getAttribute('data-action');
        if (typeof window[action] === 'function') {
            button.addEventListener('click', window[action]);
        } else {
            console.warn(`Action function '${action}' not found`);
        }
    });

    // Wait for scripts to load
    setTimeout(() => {
        testClaudeConfig();
        testChatIntegration();
        refreshStats();
    }, 1000);

    // Auto-refresh stats every 30 seconds
    setInterval(refreshStats, 30000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestPage);
} else {
    initTestPage();
}