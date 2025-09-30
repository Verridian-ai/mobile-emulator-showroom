# Enhanced AI Chat Setup Guide

## Quick Win Claude API Integration

This guide explains how to set up and use the enhanced AI Chat system with real Claude API integration.

## Features

✅ **Real Claude API Integration** - Direct connection to Claude 3.5 Sonnet
✅ **Streaming Responses** - Real-time AI responses with typing animation
✅ **Computer Vision** - Screenshot analysis with visual feedback
✅ **Rate Limiting** - Built-in usage monitoring and rate limit protection
✅ **Secure API Key Management** - Local storage with fallback prompts
✅ **Error Handling** - Comprehensive error handling and recovery
✅ **Performance Monitoring** - Request timing and success rate tracking
✅ **Accessibility Analysis** - WCAG compliance checking
✅ **WebSocket Integration** - Compatible with existing broker system

## Setup Instructions

### 1. Get Claude API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key (starts with `sk-ant-`)
5. Copy the key for configuration

### 2. Configure API Key

You have three options to configure your Claude API key:

#### Option A: Environment Variable (Server-side)
```bash
# In your .env file
CLAUDE_API_KEY=sk-ant-your-actual-api-key-here
```

#### Option B: Local Storage (Client-side)
The system will automatically prompt you to enter your API key when you first use the chat.

#### Option C: Manual Configuration
```javascript
// In browser console
window.claudeAPIConfig.setApiKey('sk-ant-your-actual-api-key-here');
```

### 3. Verify Setup

1. Open the application in your browser
2. The AI Chat panel appears in the bottom-right corner
3. Click to expand the chat
4. You should see "✅ Claude API connected and ready!" if configured correctly
5. If not configured, you'll see a setup prompt

## Usage Guide

### Basic Chat

1. **Open Chat**: Click the chat toggle or use `Ctrl+Shift+A`
2. **Send Messages**: Type your question and click Send or press `Ctrl+Enter`
3. **View Responses**: Claude will respond with streaming text (typing animation)

### Screenshot Analysis

1. **Method 1**: Click the camera icon 📸 in the toolbar
2. **Method 2**: Use keyboard shortcut `Ctrl+Shift+Q`
3. **Method 3**: Use the "Take Screenshot" button

**Analysis Process**:
- Screenshot is captured automatically
- Preview appears in the chat
- Click "Send to AI" to analyze
- Claude provides detailed UI/UX feedback

**What Claude Analyzes**:
- UI/UX issues and improvements
- Accessibility concerns  
- Design consistency
- Mobile responsiveness
- Performance indicators
- User experience quality

### Accessibility Check

1. Click the accessibility icon ♿ in the toolbar
2. System automatically gathers page accessibility data
3. Claude provides WCAG 2.1 compliance analysis
4. Specific recommendations for improvements

### Element Inspection

1. Click the magnifying glass icon 🔍
2. Click on any page element
3. Claude analyzes the specific element
4. Provides targeted feedback and suggestions

### Advanced Features

#### Custom Prompts
Add specific questions or context when sending screenshots:
```
"Focus on mobile usability issues"
"Check color contrast ratios"
"Analyze form accessibility"
```

#### Performance Stats
Access usage statistics:
```javascript
window.aiChatIntegration.getPerformanceStats()
```

#### Clear Chat History
```javascript
window.aiChatIntegration.clearChatHistory()
```

## Rate Limits & Usage

### Default Limits
- **Requests per minute**: 30
- **Tokens per minute**: 40,000
- **Daily requests**: 1,000

### Usage Monitoring
- Real-time rate limit tracking
- Daily usage statistics
- Automatic reset at midnight
- Warning messages for limit approaching

### Cost Optimization
- Token estimation for requests
- Conversation context limiting (last 5 messages)
- Efficient screenshot compression
- Smart retry logic with exponential backoff

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` | Toggle AI Chat panel |
| `Ctrl+Shift+Q` | Quick screenshot analysis |
| `Ctrl+Enter` | Send message (while typing) |

## Troubleshooting

### Common Issues

#### "Claude API not configured"
**Solution**: Set up your API key using one of the three methods above.

#### "Rate limit exceeded"
**Solution**: Wait for the cooldown period. Check usage stats for details.

#### "Authentication failed"
**Solution**: Verify your API key is valid and hasn't expired.

#### "Network error"
**Solution**: Check internet connection and Anthropic API status.

### Debug Information

Enable debug logging:
```javascript
localStorage.setItem('claude_debug', 'true');
```

View performance metrics:
```javascript
console.log(window.aiChatIntegration.getPerformanceStats());
```

### Reset Configuration

Clear all stored data:
```javascript
window.claudeAPIConfig.clearConfiguration();
```

## Security Notes

### API Key Security
- Keys are stored in browser localStorage only
- Never transmitted to third parties
- Environment variables preferred for server deployment
- Keys are validated before use

### Data Privacy
- Screenshots processed by Claude API only
- No data stored on external servers
- Chat history kept locally in browser
- Clear history anytime for privacy

## Integration with Existing Systems

### WebSocket Broker Compatibility
The enhanced chat maintains full compatibility with the existing WebSocket broker system:

- Messages forwarded to broker for agent communication
- Screenshot analysis requests sent to both Claude and broker
- Maintains existing MCP protocol support
- No breaking changes to existing functionality

### Performance Impact
- Minimal overhead on page loading
- Lazy loading of API components
- Efficient streaming responses
- Smart caching of configuration

## API Reference

### Global Objects
- `window.claudeAPIConfig` - API configuration manager
- `window.aiChatIntegration` - Main chat integration

### Key Methods

#### ClaudeAPIConfig
```javascript
claudeAPIConfig.setApiKey(key, persist)    // Set API key
claudeAPIConfig.isConfigured()             // Check if configured
claudeAPIConfig.getUsageStats()           // Get usage statistics
claudeAPIConfig.clearConfiguration()       // Reset all data
```

#### AIChatIntegration
```javascript
aiChatIntegration.sendToClaudeAPI(message, context)  // Send direct message
aiChatIntegration.getPerformanceStats()              // Get performance data
aiChatIntegration.clearChatHistory()                 // Clear chat
aiChatIntegration.promptForConfiguration()           // Show API key prompt
```

## Support

For issues with this integration:

1. Check browser console for error messages
2. Verify API key configuration
3. Test with simple text messages first
4. Check Anthropic API status
5. Review rate limit usage

For Claude API issues:
- Visit [Anthropic Support](https://support.anthropic.com)
- Check [API Documentation](https://docs.anthropic.com)

## Future Enhancements

Planned improvements:
- [ ] Multi-model support (Claude 3, 3.5, etc.)
- [ ] Custom system prompts
- [ ] Conversation templates
- [ ] Export/import chat history
- [ ] Advanced screenshot markup
- [ ] Team collaboration features