/**
 * Chat Interface Fixes and Enhancements
 * Ensures the Claude chat interface loads properly and functions correctly
 */

// Fix for chat interface positioning and z-index issues
function applyChatInterfaceFixes() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyChatInterfaceFixes);
        return;
    }

    // Add additional CSS fixes
    const fixStyle = document.createElement('style');
    fixStyle.id = 'chat-interface-fixes';
    fixStyle.textContent = `
        /* Ensure chat interface is always on top */
        .claude-chat-container {
            z-index: 10001 !important;
        }
        
        .claude-chat-panel {
            max-width: calc(100vw - 40px) !important;
            max-height: calc(100vh - 120px) !important;
        }
        
        /* Fix for mobile viewport */
        @media (max-width: 768px) {
            .claude-chat-panel {
                width: calc(100vw - 20px) !important;
                right: 10px !important;
                left: 10px !important;
                bottom: 70px !important;
            }
        }
        
        /* Fix for screenshot notifications */
        .screenshot-notification {
            z-index: 10002 !important;
            pointer-events: none;
            user-select: none;
        }
        
        /* Ensure chat messages are scrollable */
        .chat-messages {
            overflow-y: auto !important;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
        }
        
        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }
        
        .chat-messages::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        
        .chat-messages::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }
        
        .chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
        
        /* Fix button states */
        .chat-action-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .chat-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* Fix input focus */
        #chatInput:focus {
            outline: none;
            border-color: #6B46C1 !important;
            box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
        }
    `;
    
    document.head.appendChild(fixStyle);
    console.log('✅ Chat interface fixes applied');
}

// Enhanced initialization function
function ensureChatInterfaceWorks() {
    let attempts = 0;
    const maxAttempts = 5;
    
    function checkAndInitialize() {
        attempts++;
        console.log(`🔄 Checking chat interface (attempt ${attempts}/${maxAttempts})`);
        
        // Check if Claude chat interface exists
        const chatContainer = document.querySelector('.claude-chat-container');
        const chatToggle = document.getElementById('claudeChatToggle');
        
        if (chatContainer && chatToggle) {
            console.log('✅ Chat interface found and functional');
            
            // Add enhanced error handling for screenshot button
            const screenshotBtn = document.getElementById('chatScreenshotBtn');
            if (screenshotBtn) {
                // Remove any existing listeners and add our enhanced one
                screenshotBtn.removeEventListener('click', window.claudeChat?.requestScreenshotAnalysis);
                screenshotBtn.addEventListener('click', async () => {
                    if (window.claudeChat && typeof window.claudeChat.requestScreenshotAnalysis === 'function') {
                        try {
                            await window.claudeChat.requestScreenshotAnalysis();
                        } catch (error) {
                            console.error('Screenshot analysis error:', error);
                            if (window.claudeChat.showCaptureNotification) {
                                window.claudeChat.showCaptureNotification('Screenshot failed. Try again.', 'error');
                            }
                        }
                    } else {
                        console.error('Screenshot function not available');
                    }
                });
                console.log('✅ Screenshot button enhanced');
            }
            
            // Add enhanced error handling for clear button
            const clearBtn = document.getElementById('chatClearBtn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    if (window.claudeChat && typeof window.claudeChat.clearChat === 'function') {
                        window.claudeChat.clearChat();
                        console.log('✅ Chat cleared');
                    }
                });
            }
            
            // Test the chat toggle
            const testToggle = () => {
                try {
                    chatToggle.click();
                    setTimeout(() => chatToggle.click(), 100); // Close it back
                    console.log('✅ Chat toggle test passed');
                } catch (error) {
                    console.error('Chat toggle test failed:', error);
                }
            };
            
            setTimeout(testToggle, 1000);
            
        } else if (attempts < maxAttempts) {
            console.log('⏳ Chat interface not ready, retrying in 1 second...');
            setTimeout(checkAndInitialize, 1000);
        } else {
            console.error('❌ Chat interface failed to initialize after maximum attempts');
            showFallbackMessage();
        }
    }
    
    checkAndInitialize();
}

function showFallbackMessage() {
    // Create a fallback notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10003;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    `;
    notification.textContent = 'Chat interface failed to load. Please refresh the page.';
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applyChatInterfaceFixes();
        setTimeout(ensureChatInterfaceWorks, 2000); // Wait for other scripts
    });
} else {
    applyChatInterfaceFixes();
    setTimeout(ensureChatInterfaceWorks, 1000);
}

// Export for debugging
window.chatInterfaceFixes = {
    applyChatInterfaceFixes,
    ensureChatInterfaceWorks,
    showFallbackMessage
};

console.log('📞 Chat interface fixes loaded');