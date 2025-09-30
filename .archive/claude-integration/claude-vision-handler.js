/**
 * Claude Vision API Handler
 * Processes computer vision analysis requests using Claude's vision capabilities
 * Integrates with the screenshot capture and AI chat systems
 */

class ClaudeVisionHandler {
    constructor() {
        this.isInitialized = false;
        this.analysisQueue = [];
        this.processingQueue = false;
        this.maxQueueSize = 10;
        this.websocket = null;
        this.apiEndpoint = '/api/claude/vision'; // Would be configured for your backend
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
        this.analysisHistory = [];
        this.initializeHandler();
    }

    initializeHandler() {
        this.setupWebSocket();
        this.bindEventListeners();
        this.setupPerformanceOptimizations();
    }

    setupWebSocket() {
        const wsToken = window.WEBSOCKET_TOKEN || 'secure-token';
        const brokerUrl = `ws://localhost:${window.BROKER_PORT || 7071}?token=${wsToken}`;
        
        try {
            this.websocket = new WebSocket(brokerUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ Claude Vision Handler connected to broker');
                this.isInitialized = true;
                this.sendMessage({
                    type: 'claude_vision_ready',
                    timestamp: Date.now(),
                    capabilities: {
                        visionAnalysis: true,
                        batchProcessing: true,
                        realTimeInsights: true,
                        multiModalAnalysis: true,
                        accessibilityAnalysis: true,
                        performanceAnalysis: true,
                        designPatternRecognition: true
                    }
                });
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.websocket.onclose = () => {
                console.warn('🔄 Claude Vision Handler disconnected, attempting reconnect...');
                this.isInitialized = false;
                setTimeout(() => this.setupWebSocket(), 3000);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ Claude Vision Handler WebSocket error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to setup Claude Vision WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'claude_vision_analysis':
                this.queueAnalysisRequest(data);
                break;
            case 'vision_analysis':
                this.queueAnalysisRequest(data);
                break;
            case 'accessibility_vision_analysis':
                this.queueAnalysisRequest(data);
                break;
            case 'performance_vision_analysis':
                this.queueAnalysisRequest(data);
                break;
            case 'design_pattern_analysis':
                this.queueAnalysisRequest(data);
                break;
            case 'mobile_responsiveness_analysis':
                this.queueAnalysisRequest(data);
                break;
            case 'quick_insight_request':
                this.queueAnalysisRequest(data, true); // Priority for real-time
                break;
        }
    }

    sendMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        }
    }

    async queueAnalysisRequest(request, priority = false) {
        // Add to queue with priority handling
        if (priority) {
            this.analysisQueue.unshift(request);
        } else {
            this.analysisQueue.push(request);
        }

        // Limit queue size
        if (this.analysisQueue.length > this.maxQueueSize) {
            this.analysisQueue.pop();
        }

        // Start processing if not already running
        if (!this.processingQueue) {
            await this.processAnalysisQueue();
        }
    }

    async processAnalysisQueue() {
        if (this.processingQueue || this.analysisQueue.length === 0) return;

        this.processingQueue = true;

        while (this.analysisQueue.length > 0) {
            const request = this.analysisQueue.shift();
            
            try {
                // Respect rate limits
                const timeSinceLastRequest = Date.now() - this.lastRequestTime;
                if (timeSinceLastRequest < this.rateLimitDelay) {
                    await this.sleep(this.rateLimitDelay - timeSinceLastRequest);
                }

                await this.processAnalysisRequest(request);
                this.lastRequestTime = Date.now();

            } catch (error) {
                console.error('Analysis request failed:', error);
                this.sendErrorResponse(request.requestId, error.message);
            }

            // Small delay between requests
            await this.sleep(100);
        }

        this.processingQueue = false;
    }

    async processAnalysisRequest(request) {
        const { image, screenshot, prompt, metadata, type, requestId } = request;
        const imageData = image || screenshot;

        if (!imageData || !prompt) {
            throw new Error('Missing required image data or prompt');
        }

        // Optimize image for API if needed
        const optimizedImage = await this.optimizeImageForAPI(imageData);

        // Prepare the analysis request
        const analysisData = {
            image: optimizedImage,
            prompt: this.enhancePromptWithContext(prompt, metadata, type),
            metadata: metadata,
            type: type,
            requestId: requestId,
            timestamp: Date.now()
        };

        // Send to Claude Vision API (this would be implemented based on your backend setup)
        const response = await this.sendToClaudeVisionAPI(analysisData);
        
        // Process and format the response
        const formattedResponse = this.formatAnalysisResponse(response, type);
        
        // Send response back through WebSocket
        this.sendMessage({
            type: 'vision_analysis_complete',
            requestId: requestId,
            analysis: formattedResponse.analysis,
            insights: formattedResponse.insights,
            suggestions: formattedResponse.suggestions,
            analysisType: type,
            metadata: metadata,
            timestamp: Date.now()
        });

        // Store in history
        this.analysisHistory.push({
            requestId,
            type,
            timestamp: Date.now(),
            response: formattedResponse
        });

        // Generate real-time insights if applicable
        if (type !== 'quick_insight_request') {
            await this.generateRealTimeInsights(formattedResponse, metadata);
        }
    }

    async optimizeImageForAPI(imageData) {
        return new Promise((resolve) => {
            try {
                // If already optimized or small enough, return as-is
                if (imageData.length < 1024 * 1024) { // 1MB
                    resolve(imageData);
                    return;
                }

                // Create canvas for optimization
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate optimal dimensions (max 1920x1080 for API efficiency)
                    let { width, height } = img;
                    const maxWidth = 1920;
                    const maxHeight = 1080;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to optimized format
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                
                img.src = imageData;
            } catch (error) {
                console.warn('Image optimization failed, using original:', error);
                resolve(imageData);
            }
        });
    }

    enhancePromptWithContext(basePrompt, metadata, type) {
        let enhancedPrompt = basePrompt;

        // Add context information
        if (metadata) {
            enhancedPrompt += '\n\n--- CONTEXT ---\n';
            
            if (metadata.url) {
                enhancedPrompt += `URL: ${metadata.url}\n`;
            }
            
            if (metadata.viewport) {
                enhancedPrompt += `Viewport: ${metadata.viewport.width}x${metadata.viewport.height}\n`;
                enhancedPrompt += `Device Pixel Ratio: ${metadata.viewport.devicePixelRatio || 1}\n`;
            }
            
            if (metadata.device && metadata.device.type) {
                enhancedPrompt += `Device Type: ${metadata.device.type}\n`;
            }
        }

        // Add type-specific instructions
        switch (type) {
            case 'accessibility_vision_analysis':
                enhancedPrompt += '\n\n--- ACCESSIBILITY FOCUS ---\nPay special attention to WCAG 2.1 AA compliance, color contrast, focus indicators, and screen reader compatibility.';
                break;
            case 'performance_vision_analysis':
                enhancedPrompt += '\n\n--- PERFORMANCE FOCUS ---\nAnalyze visual elements that could impact loading performance, rendering efficiency, and user-perceived performance.';
                break;
            case 'design_pattern_analysis':
                enhancedPrompt += '\n\n--- DESIGN PATTERN FOCUS ---\nEvaluate consistency with modern UI patterns, design systems, and user expectations.';
                break;
            case 'mobile_responsiveness_analysis':
                enhancedPrompt += '\n\n--- MOBILE FOCUS ---\nAnalyze for mobile usability, touch targets, responsive layout, and mobile-specific considerations.';
                break;
            case 'quick_insight_request':
                enhancedPrompt += '\n\n--- QUICK INSIGHT ---\nProvide the most important observation or recommendation in 1-2 sentences.';
                break;
        }

        return enhancedPrompt;
    }

    async sendToClaudeVisionAPI(analysisData) {
        // This is a mock implementation - in production, this would make an actual API call
        // to Claude's vision API through your backend
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock response based on analysis type
                const mockResponse = this.generateMockAnalysisResponse(analysisData);
                resolve(mockResponse);
            }, 1500 + Math.random() * 1000); // Simulate API delay
        });
    }

    generateMockAnalysisResponse(analysisData) {
        const { type, metadata } = analysisData;
        
        // Generate contextual mock responses based on type
        const responses = {
            'accessibility_vision_analysis': {
                analysis: 'The interface shows good color contrast in most areas, but some interactive elements lack sufficient visual focus indicators. The layout appears to follow a logical reading order.',
                insights: ['Good color contrast', 'Focus indicators need improvement', 'Logical layout structure'],
                suggestions: ['Add visible focus outlines to all interactive elements', 'Ensure minimum 3:1 contrast ratio for UI elements', 'Consider adding skip navigation links']
            },
            'performance_vision_analysis': {
                analysis: 'The page contains several large images that could be optimized. The layout appears efficient with good use of CSS Grid. Loading states are not immediately visible.',
                insights: ['Image optimization opportunities', 'Efficient layout structure', 'Missing loading indicators'],
                suggestions: ['Implement lazy loading for images', 'Add loading skeletons for better perceived performance', 'Optimize image formats (WebP/AVIF)']
            },
            'design_pattern_analysis': {
                analysis: 'The design follows modern UI patterns with good use of cards and consistent spacing. Typography hierarchy is clear, though some interactive elements could be more prominent.',
                insights: ['Modern UI patterns used', 'Good typography hierarchy', 'Interactive elements could be clearer'],
                suggestions: ['Increase button prominence with better contrast', 'Consider using more consistent border radius', 'Add hover states for better interactivity']
            },
            'mobile_responsiveness_analysis': {
                analysis: 'The layout adapts well to mobile screens with appropriate text sizes. Touch targets appear adequately sized, though navigation could be more thumb-friendly.',
                insights: ['Good mobile adaptation', 'Appropriate text sizes', 'Navigation needs improvement'],
                suggestions: ['Move primary navigation to bottom for thumb accessibility', 'Increase touch target sizes to minimum 44px', 'Consider collapsing secondary content on mobile']
            },
            'quick_insight_request': {
                analysis: 'The most notable improvement opportunity is enhancing visual hierarchy - consider increasing contrast between primary and secondary content.',
                insights: ['Visual hierarchy needs enhancement'],
                suggestions: ['Increase contrast between content levels']
            }
        };

        return responses[type] || {
            analysis: 'The interface shows good overall design with opportunities for improvement in user experience and accessibility.',
            insights: ['Good overall design', 'UX improvement opportunities'],
            suggestions: ['Focus on user feedback and accessibility enhancements']
        };
    }

    formatAnalysisResponse(response, type) {
        // Format the response for consistent structure
        return {
            analysis: response.analysis || 'Analysis completed successfully.',
            insights: Array.isArray(response.insights) ? response.insights : [response.insights].filter(Boolean),
            suggestions: Array.isArray(response.suggestions) ? response.suggestions : [response.suggestions].filter(Boolean),
            priority: this.determinePriority(response, type),
            implementationComplexity: this.assessImplementationComplexity(response.suggestions)
        };
    }

    determinePriority(response, type) {
        // Determine priority based on analysis type and content
        const highPriorityKeywords = ['accessibility', 'contrast', 'security', 'error', 'broken'];
        const mediumPriorityKeywords = ['performance', 'optimization', 'mobile', 'usability'];
        
        const content = (response.analysis + ' ' + response.suggestions.join(' ')).toLowerCase();
        
        if (highPriorityKeywords.some(keyword => content.includes(keyword))) {
            return 'high';
        } else if (mediumPriorityKeywords.some(keyword => content.includes(keyword))) {
            return 'medium';
        }
        
        return 'low';
    }

    assessImplementationComplexity(suggestions) {
        if (!Array.isArray(suggestions)) return 'medium';
        
        const lowComplexityKeywords = ['color', 'font', 'padding', 'margin', 'text'];
        const highComplexityKeywords = ['restructure', 'rebuild', 'architecture', 'framework'];
        
        const content = suggestions.join(' ').toLowerCase();
        
        if (highComplexityKeywords.some(keyword => content.includes(keyword))) {
            return 'high';
        } else if (lowComplexityKeywords.some(keyword => content.includes(keyword))) {
            return 'low';
        }
        
        return 'medium';
    }

    async generateRealTimeInsights(analysisResponse, metadata) {
        // Generate additional real-time insights based on analysis
        const insights = [];
        
        // Context-based insights
        if (metadata && metadata.viewport) {
            const { width } = metadata.viewport;
            if (width < 768) {
                insights.push({
                    insight: 'Mobile viewport detected - prioritize touch-friendly interactions',
                    priority: 'medium',
                    category: 'mobile'
                });
            }
        }
        
        // Analysis-based insights
        if (analysisResponse.suggestions.some(s => s.toLowerCase().includes('contrast'))) {
            insights.push({
                insight: 'Color contrast issues detected - this affects accessibility compliance',
                priority: 'high',
                category: 'accessibility'
            });
        }

        // Send insights
        for (const insight of insights) {
            this.sendMessage({
                type: 'real_time_insight',
                ...insight,
                timestamp: Date.now()
            });
            
            await this.sleep(500); // Stagger insights
        }
    }

    sendErrorResponse(requestId, errorMessage) {
        this.sendMessage({
            type: 'vision_analysis_error',
            requestId: requestId,
            error: errorMessage,
            timestamp: Date.now()
        });
    }

    bindEventListeners() {
        // Listen for page changes to provide contextual insights
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                this.onPageChange();
            }
        }).observe(document, { subtree: true, childList: true });
    }

    setupPerformanceOptimizations() {
        // Implement request deduplication
        this.requestCache = new Map();
        
        // Clean up old cache entries periodically
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.requestCache.entries()) {
                if (now - entry.timestamp > 300000) { // 5 minutes
                    this.requestCache.delete(key);
                }
            }
        }, 60000); // Clean every minute
    }

    onPageChange() {
        // Generate automated insights when page changes
        setTimeout(() => {
            this.sendMessage({
                type: 'automated_suggestion',
                suggestion: 'New page loaded - consider running accessibility and performance analysis',
                implementation: 'Use the analysis tools in the AI chat panel',
                effort: 'low',
                timestamp: Date.now()
            });
        }, 2000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    getAnalysisHistory() {
        return [...this.analysisHistory];
    }

    getQueueStatus() {
        return {
            queueLength: this.analysisQueue.length,
            processing: this.processingQueue,
            isInitialized: this.isInitialized
        };
    }

    clearAnalysisHistory() {
        this.analysisHistory = [];
    }
}

// Initialize Claude Vision Handler
window.claudeVisionHandler = new ClaudeVisionHandler();

console.log('👁️ Claude Vision Handler initialized for computer vision analysis');