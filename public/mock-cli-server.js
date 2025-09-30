/**
 * Mock Claude Code CLI Server for Testing
 * This simulates the CLI WebSocket endpoint for development and testing
 */

class MockCLIServer {
    constructor() {
        this.port = 8080;
        this.sessions = new Map();
        this.messageHandlers = new Map();
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        console.log('🧪 Mock CLI Server initializing...');
        
        // Create mock WebSocket server (simplified for browser testing)
        this.setupMockResponses();
        this.startHealthEndpoint();
        
        console.log(`🧪 Mock CLI Server ready on port ${this.port}`);
        this.isRunning = true;
    }
    
    setupMockResponses() {
        // Mock responses for different message types
        this.messageHandlers.set('session_register', this.handleSessionRegister.bind(this));
        this.messageHandlers.set('chat_message', this.handleChatMessage.bind(this));
        this.messageHandlers.set('screenshot_analysis', this.handleScreenshotAnalysis.bind(this));
        this.messageHandlers.set('request_project_context', this.handleProjectContext.bind(this));
        this.messageHandlers.set('file_operation', this.handleFileOperation.bind(this));
        this.messageHandlers.set('execute_command', this.handleExecuteCommand.bind(this));
        this.messageHandlers.set('heartbeat', this.handleHeartbeat.bind(this));
    }
    
    async handleSessionRegister(message) {
        const session = {
            sessionId: message.sessionId,
            registeredAt: Date.now(),
            workingDirectory: 'C:\\Users\\Developer\\Projects\\MyProject',
            projectFiles: [
                'src/index.js',
                'src/components/App.js',
                'src/components/Header.js',
                'src/styles/main.css',
                'package.json',
                'README.md'
            ]
        };
        
        this.sessions.set(message.sessionId, session);
        
        return {
            type: 'session_registered',
            sessionId: message.sessionId,
            workingDirectory: session.workingDirectory,
            projectFiles: session.projectFiles,
            timestamp: Date.now()
        };
    }
    
    async handleChatMessage(message) {
        // Simulate processing time
        await this.delay(800 + Math.random() * 1200);
        
        const responses = [
            "I can help you analyze this web application. I notice the design looks modern with good use of glassmorphism effects. Would you like me to review the accessibility or performance aspects?",
            "Based on your request, I can see the mobile showroom interface. The device emulation looks well-implemented. Are there specific UI improvements you'd like me to suggest?",
            "I'm analyzing the current page structure. I can help with code improvements, accessibility audits, or design recommendations. What would you like to focus on?",
            "The interface shows good responsive design principles. I can provide detailed feedback on UX improvements, performance optimizations, or code quality enhancements.",
            "I can assist with various development tasks including code generation, file operations, testing strategies, and architectural improvements. What specific area interests you?"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            type: 'cli_response',
            content: response,
            metadata: {
                processingTime: Math.round(800 + Math.random() * 1200),
                model: 'claude-3-5-sonnet-20241022',
                tokens: Math.round(response.length / 4)
            },
            conversationId: `conv-${Date.now()}`,
            timestamp: Date.now()
        };
    }
    
    async handleScreenshotAnalysis(message) {
        // Simulate longer processing for image analysis
        await this.delay(2000 + Math.random() * 2000);
        
        const analysisResponse = `📸 **Screenshot Analysis Complete**

**Visual Design Assessment:**
- Clean, modern interface with effective use of glassmorphism
- Good color harmony with the purple/blue gradient theme
- Proper visual hierarchy in the device selector layout

**Accessibility Findings:**
- Button contrast ratios appear adequate
- Consider adding focus indicators for keyboard navigation
- Alt text should be verified for any decorative images

**UX Recommendations:**
- The device emulation frame is well-positioned
- Loading states could be enhanced with progress indicators
- Consider adding tooltips for device-specific features

**Performance Observations:**
- Interface appears lightweight and responsive
- Video background might impact performance on slower devices
- Consider lazy loading for device frame content

**Mobile Responsiveness:**
- Layout adapts well to different screen sizes
- Touch targets appear appropriately sized
- Consider optimizing for very small screens (< 320px)

Overall, this is a well-designed interface with strong foundations. The main opportunities are in accessibility enhancements and performance optimizations.`;
        
        return {
            type: 'cli_response',
            content: analysisResponse,
            metadata: {
                processingTime: Math.round(2000 + Math.random() * 2000),
                analysisType: 'screenshot',
                confidence: 0.85 + Math.random() * 0.1
            },
            timestamp: Date.now()
        };
    }
    
    async handleProjectContext(message) {
        const session = this.sessions.get(message.sessionId);
        
        return {
            type: 'project_context_update',
            context: {
                workingDirectory: session?.workingDirectory || 'C:\\Users\\Developer\\Projects\\MyProject',
                projectFiles: session?.projectFiles || [],
                gitBranch: 'main',
                lastCommit: 'feat: Update mobile showroom interface',
                dependencies: ['react', 'express', 'websocket', 'playwright'],
                scripts: ['start', 'build', 'test', 'dev']
            },
            timestamp: Date.now()
        };
    }
    
    async handleFileOperation(message) {
        await this.delay(300 + Math.random() * 700);
        
        const { operation, filepath, content } = message;
        
        switch (operation) {
            case 'list':
                return {
                    type: 'file_operation_result',
                    operation: 'list',
                    success: true,
                    result: [
                        'src/components/App.js',
                        'src/components/Header.js',
                        'src/styles/main.css',
                        'src/utils/helpers.js',
                        'public/index.html',
                        'package.json'
                    ],
                    timestamp: Date.now()
                };
                
            case 'read':
                return {
                    type: 'file_operation_result',
                    operation: 'read',
                    success: true,
                    filepath: filepath,
                    result: `// Mock file content for ${filepath}\n// This would contain the actual file contents\nexport default function MockComponent() {\n  return <div>Mock Content</div>;\n}`,
                    timestamp: Date.now()
                };
                
            case 'search':
                return {
                    type: 'file_operation_result',
                    operation: 'search',
                    success: true,
                    result: [`Found "${content}" in src/components/App.js:15`, `Found "${content}" in src/utils/helpers.js:42`],
                    timestamp: Date.now()
                };
                
            default:
                return {
                    type: 'file_operation_result',
                    operation: operation,
                    success: false,
                    error: `Unsupported operation: ${operation}`,
                    timestamp: Date.now()
                };
        }
    }
    
    async handleExecuteCommand(message) {
        await this.delay(1000 + Math.random() * 2000);
        
        const { command } = message;
        
        // Simulate different command responses
        if (command.toLowerCase().includes('test')) {
            return {
                type: 'cli_response',
                success: true,
                output: `Running tests...\n✓ All tests passed (12 passed, 0 failed)\nTest Suites: 3 passed, 3 total\nTime: 2.34s`,
                metadata: { exitCode: 0 },
                timestamp: Date.now()
            };
        } else if (command.toLowerCase().includes('build')) {
            return {
                type: 'cli_response',
                success: true,
                output: `Building project...\n✓ Build completed successfully\nOutput: dist/\nTime: 8.21s`,
                metadata: { exitCode: 0 },
                timestamp: Date.now()
            };
        } else if (command.toLowerCase().includes('create')) {
            return {
                type: 'cli_response',
                success: true,
                output: `Creating new component...\n✓ Component created: src/components/NewComponent.js\n✓ Test file created: src/components/__tests__/NewComponent.test.js`,
                metadata: { exitCode: 0 },
                timestamp: Date.now()
            };
        } else {
            return {
                type: 'cli_response',
                success: true,
                output: `Executed: ${command}\n✓ Command completed successfully`,
                metadata: { exitCode: 0 },
                timestamp: Date.now()
            };
        }
    }
    
    async handleHeartbeat(message) {
        return {
            type: 'heartbeat_response',
            timestamp: Date.now()
        };
    }
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Mock health endpoint
    startHealthEndpoint() {
        // In a real implementation, this would be an HTTP server
        // For now, we'll just mock the health check response
        window._mockCLIHealth = {
            status: 'ready',
            cli: 'available',
            port: this.port,
            uptime: 0
        };
        
        // Update uptime periodically
        setInterval(() => {
            window._mockCLIHealth.uptime += 1000;
        }, 1000);
    }
    
    // Simulate message processing
    async processMessage(message) {
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            try {
                const response = await handler(message);
                return {
                    ...response,
                    responseToMessage: message.messageId
                };
            } catch (error) {
                return {
                    type: 'cli_error',
                    error: error.message,
                    responseToMessage: message.messageId,
                    timestamp: Date.now()
                };
            }
        } else {
            return {
                type: 'cli_error',
                error: `Unknown message type: ${message.type}`,
                responseToMessage: message.messageId,
                timestamp: Date.now()
            };
        }
    }
    
    getStatus() {
        return {
            running: this.isRunning,
            sessions: this.sessions.size,
            uptime: Date.now() - (this.startTime || Date.now())
        };
    }
}

// Initialize mock CLI server
if (typeof window !== 'undefined') {
    window.mockCLIServer = new MockCLIServer();
    
    // Override fetch for health checks
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.includes(':8080/health')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(window._mockCLIHealth)
            });
        }
        return originalFetch.apply(this, arguments);
    };
}

console.log('🧪 Mock CLI Server initialized for testing');