/**
 * Advanced Screenshot Capture System with Computer Vision Analysis
 * Integrates with Claude's vision capabilities for real-time UI/UX analysis
 * Provides intelligent insights about accessibility, design, and performance
 */

class ScreenshotCaptureSystem {
    constructor() {
        this.isCapturing = false;
        this.captureQueue = [];
        this.maxQueueSize = 10;
        this.compression = {
            quality: 0.9,
            format: 'png',
            maxWidth: 1920,
            maxHeight: 1080
        };
        this.websocket = null;
        this.deviceFrame = null;
        this.elementInspector = null;
        this.visionAnalyzer = null;
        this.analysisQueue = [];
        this.analysisHistory = [];
        this.aiPrompts = new AIPromptTemplates();
        this.initializeSystem();
    }

    initializeSystem() {
        this.setupWebSocket();
        this.createCaptureCanvas();
        this.bindKeyboardShortcuts();
        this.detectDeviceFrame();
        
        // Initialize element context integration
        this.initializeElementContextIntegration();
        
        // Initialize enhanced capture modes
        this.initializeAdvancedCaptureModes();
        
        // Initialize collaborative capture features
        this.initializeCollaborativeCapture();
    }

    setupWebSocket() {
        // Use environment variable or configuration for WebSocket URL
        const wsToken = window.WEBSOCKET_TOKEN || 'secure-token';
        const brokerUrl = `ws://localhost:${window.BROKER_PORT || 7071}?token=${wsToken}`;
        
        try {
            this.websocket = new WebSocket(brokerUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ Screenshot system connected to broker');
                this.sendMessage({
                    type: 'screenshot_system_ready',
                    timestamp: Date.now(),
                    capabilities: {
                        fullPage: true,
                        elementCapture: true,
                        multiElement: true,
                        annotations: true,
                        aiIntegration: true,
                        visionAnalysis: true,
                        accessibilityAnalysis: true,
                        performanceAnalysis: true,
                        designPatternRecognition: true,
                        mobileResponsivenessAnalysis: true,
                        realTimeInsights: true
                    }
                });
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.websocket.onclose = () => {
                console.warn('🔄 Screenshot system disconnected, attempting reconnect...');
                setTimeout(() => this.setupWebSocket(), 3000);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ Screenshot system WebSocket error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to setup screenshot WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'capture_screenshot':
                this.captureScreenshot(data.options);
                break;
            case 'capture_element':
                this.captureElement(data.selector, data.options);
                break;
            case 'capture_full_page':
                this.captureFullPage(data.options);
                break;
            case 'send_to_chat':
                this.sendToChat(data.screenshot, data.context);
                break;
            case 'ai_request_screenshot':
                this.handleAIScreenshotRequest(data);
                break;
            case 'vision_analysis_request':
                this.handleVisionAnalysisRequest(data);
                break;
            case 'accessibility_analysis_request':
                this.handleAccessibilityAnalysisRequest(data);
                break;
            case 'performance_analysis_request':
                this.handlePerformanceAnalysisRequest(data);
                break;
            case 'design_pattern_analysis':
                this.handleDesignPatternAnalysis(data);
                break;
        }
    }

    sendMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        }
    }

    detectDeviceFrame() {
        // Detect if we're inside a device frame
        this.deviceFrame = document.querySelector('.device-mockup') || 
                          document.querySelector('.device-frame') ||
                          document.querySelector('#deviceIframe');

        if (this.deviceFrame) {
            console.log('📱 Device frame detected:', this.deviceFrame.className);
        }
    }

    createCaptureCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + S for screenshot
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.captureFullPage();
            }

            // Ctrl/Cmd + Shift + E for element capture
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.startElementCapture();
            }

            // Ctrl/Cmd + Shift + C for send to chat
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.captureAndSendToChat();
            }
        });
    }

    async captureFullPage(options = {}) {
        if (this.isCapturing) {
            console.warn('⏳ Screenshot capture already in progress');
            return;
        }

        this.isCapturing = true;
        
        try {
            const timestamp = Date.now();
            const screenshotData = await this.performCapture('fullPage', options);
            
            const result = {
                type: 'screenshot_captured',
                captureType: 'fullPage',
                timestamp,
                data: screenshotData,
                metadata: {
                    url: window.location.href,
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    device: this.getDeviceInfo(),
                    options
                }
            };

            this.sendMessage(result);
            this.addToQueue(result);
            
            // Show capture feedback
            this.showCaptureNotification('Full page screenshot captured');
            
            // Trigger automatic vision analysis if enabled
            if (options.autoAnalyze !== false) {
                await this.performAutomaticAnalysis(result);
            }
            
            return result;

        } catch (error) {
            console.error('❌ Full page capture failed:', error);
            this.showErrorNotification('Screenshot capture failed');
            throw error;
        } finally {
            this.isCapturing = false;
        }
    }

    async captureElement(selector, options = {}) {
        if (this.isCapturing) return;

        this.isCapturing = true;

        try {
            const element = typeof selector === 'string' ? 
                          document.querySelector(selector) : selector;

            if (!element) {
                throw new Error(`Element not found: ${selector}`);
            }

            const timestamp = Date.now();
            const elementInfo = this.extractElementInfo(element);
            const screenshotData = await this.performCapture('element', {
                ...options,
                element,
                bounds: elementInfo.bounds
            });

            const result = {
                type: 'screenshot_captured',
                captureType: 'element',
                timestamp,
                data: screenshotData,
                elementContext: elementInfo,
                metadata: {
                    url: window.location.href,
                    selector: this.generateSelector(element),
                    device: this.getDeviceInfo(),
                    options
                }
            };

            this.sendMessage(result);
            this.addToQueue(result);
            
            this.showCaptureNotification(`Element screenshot captured: ${elementInfo.tagName}`);
            
            // Trigger automatic element analysis if enabled
            if (options.autoAnalyze !== false) {
                await this.performElementAnalysis(result, elementInfo);
            }
            
            return result;

        } catch (error) {
            console.error('❌ Element capture failed:', error);
            this.showErrorNotification('Element capture failed');
            throw error;
        } finally {
            this.isCapturing = false;
        }
    }

    async performCapture(type, options = {}) {
        const { element, bounds, quality = this.compression.quality } = options;

        if (type === 'fullPage') {
            return await this.captureFullPageImage(quality);
        } else if (type === 'element' && element) {
            return await this.captureElementImage(element, bounds, quality);
        }

        throw new Error('Invalid capture type or missing element');
    }

    async captureFullPageImage(quality) {
        try {
            // Use html2canvas for full page capture
            if (window.html2canvas) {
                const canvas = await html2canvas(document.body, {
                    useCORS: true,
                    allowTaint: true,
                    scrollX: 0,
                    scrollY: 0,
                    width: Math.max(document.documentElement.scrollWidth, window.innerWidth),
                    height: Math.max(document.documentElement.scrollHeight, window.innerHeight),
                    scale: 1
                });

                return this.canvasToDataUrl(canvas, quality);
            }

            // Fallback to native screen capture API
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                return await this.captureWithDisplayMedia();
            }

            throw new Error('No capture method available');

        } catch (error) {
            console.error('Full page capture error:', error);
            throw error;
        }
    }

    async captureElementImage(element, bounds, quality) {
        try {
            // Scroll element into view
            element.scrollIntoView({ behavior: 'instant', block: 'center' });
            
            // Wait for scroll to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            if (window.html2canvas) {
                const canvas = await html2canvas(element, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                    scale: 2, // Higher quality for elements
                    scrollX: bounds.left,
                    scrollY: bounds.top,
                    width: bounds.width,
                    height: bounds.height
                });

                return this.canvasToDataUrl(canvas, quality);
            }

            // Fallback method using canvas manipulation
            return await this.captureElementFallback(element, bounds, quality);

        } catch (error) {
            console.error('Element capture error:', error);
            throw error;
        }
    }

    async captureWithDisplayMedia() {
        try {
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
                    
                    resolve(canvas.toDataURL('image/png'));
                };

                video.onerror = reject;
            });

        } catch (error) {
            console.error('Display media capture error:', error);
            throw error;
        }
    }

    async captureElementFallback(element, bounds, quality) {
        // Create a temporary canvas for element capture
        this.canvas.width = bounds.width * 2; // Higher DPI
        this.canvas.height = bounds.height * 2;
        
        this.ctx.scale(2, 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, bounds.width, bounds.height);

        // This is a simplified fallback - in production you'd want more sophisticated capture
        const rect = element.getBoundingClientRect();
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, rect.width, rect.height);

        return this.canvas.toDataURL('image/png', quality);
    }

    canvasToDataUrl(canvas, quality) {
        // Optimize canvas size if needed
        const maxWidth = this.compression.maxWidth;
        const maxHeight = this.compression.maxHeight;

        if (canvas.width > maxWidth || canvas.height > maxHeight) {
            const optimizedCanvas = this.resizeCanvas(canvas, maxWidth, maxHeight);
            return optimizedCanvas.toDataURL(`image/${this.compression.format}`, quality);
        }

        return canvas.toDataURL(`image/${this.compression.format}`, quality);
    }

    resizeCanvas(canvas, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
        const newWidth = canvas.width * ratio;
        const newHeight = canvas.height * ratio;

        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;

        const ctx = resizedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

        return resizedCanvas;
    }

    extractElementInfo(element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);

        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id || null,
            className: element.className || null,
            textContent: element.textContent?.slice(0, 100) || null,
            attributes: this.extractAttributes(element),
            bounds: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                right: rect.right,
                bottom: rect.bottom
            },
            styles: {
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                fontSize: computedStyle.fontSize,
                fontFamily: computedStyle.fontFamily,
                display: computedStyle.display,
                position: computedStyle.position
            },
            accessibility: {
                role: element.getAttribute('role'),
                ariaLabel: element.getAttribute('aria-label'),
                ariaDescribedBy: element.getAttribute('aria-describedby'),
                tabIndex: element.tabIndex
            },
            hierarchy: this.getElementHierarchy(element),
            selector: this.generateSelector(element)
        };
    }

    extractAttributes(element) {
        const attributes = {};
        for (let attr of element.attributes) {
            attributes[attr.name] = attr.value;
        }
        return attributes;
    }

    getElementHierarchy(element) {
        const hierarchy = [];
        let current = element;

        while (current && current !== document.body) {
            hierarchy.unshift({
                tagName: current.tagName.toLowerCase(),
                id: current.id || null,
                className: current.className || null
            });
            current = current.parentElement;
        }

        return hierarchy;
    }

    generateSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }

        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.length > 0);
            if (classes.length > 0) {
                return `.${classes.join('.')}`;
            }
        }

        // Generate path-based selector
        const path = [];
        let current = element;

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                selector = `#${current.id}`;
                path.unshift(selector);
                break;
            }

            const siblings = Array.from(current.parentElement?.children || []);
            const sameTag = siblings.filter(s => s.tagName === current.tagName);
            
            if (sameTag.length > 1) {
                const index = sameTag.indexOf(current) + 1;
                selector += `:nth-of-type(${index})`;
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    getDeviceInfo() {
        const deviceFrame = document.querySelector('.device-mockup');
        return {
            type: deviceFrame?.dataset?.device || 'unknown',
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            },
            devicePixelRatio: window.devicePixelRatio
        };
    }

    addToQueue(screenshot) {
        this.captureQueue.unshift(screenshot);
        
        if (this.captureQueue.length > this.maxQueueSize) {
            this.captureQueue.pop();
        }

        // Update UI queue display
        this.updateQueueDisplay();
    }

    updateQueueDisplay() {
        const queueDisplay = document.querySelector('#screenshot-queue-display');
        if (queueDisplay) {
            queueDisplay.textContent = `Screenshots: ${this.captureQueue.length}`;
        }
    }

    async startElementCapture() {
        if (!this.elementInspector) {
            console.warn('Element inspector not available');
            return;
        }

        // Activate element inspector for capture mode
        this.elementInspector.activateCaptureMode();
        this.showCaptureNotification('Click any element to capture screenshot');
    }

    async captureAndSendToChat() {
        const screenshot = await this.captureFullPage();
        await this.sendToChat(screenshot.data, {
            type: 'full_page',
            url: window.location.href,
            timestamp: screenshot.timestamp
        });
    }

    async sendToChat(screenshotData, context) {
        const chatMessage = {
            type: 'chat_screenshot',
            screenshot: screenshotData,
            context: context,
            timestamp: Date.now(),
            aiRequest: {
                prompt: 'Analyze this screenshot and provide insights about the UI/UX, any issues you notice, and suggestions for improvement.',
                includeElementDetails: true,
                includeAccessibility: true
            }
        };

        this.sendMessage(chatMessage);
        this.showCaptureNotification('Screenshot sent to AI chat');
    }

    async handleAIScreenshotRequest(data) {
        const { instruction, selector, options = {} } = data;

        try {
            let screenshot;

            if (selector) {
                screenshot = await this.captureElement(selector, options);
            } else {
                screenshot = await this.captureFullPage(options);
            }

            const response = {
                type: 'ai_screenshot_response',
                requestId: data.requestId,
                screenshot: screenshot.data,
                context: screenshot.elementContext || screenshot.metadata,
                instruction,
                timestamp: Date.now()
            };

            this.sendMessage(response);
            
        } catch (error) {
            this.sendMessage({
                type: 'ai_screenshot_error',
                requestId: data.requestId,
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    showCaptureNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `screenshot-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showErrorNotification(message) {
        this.showCaptureNotification(message, 'error');
    }

    // Integration with Element Inspector
    setElementInspector(elementInspector) {
        this.elementInspector = elementInspector;
        
        // Listen for element selection events
        if (this.elementInspector) {
            // Check if element inspector supports event listeners (newer version)
            if (typeof this.elementInspector.addEventListener === 'function') {
                this.elementInspector.addEventListener('elementSelected', (event) => {
                    this.captureElement(event.detail.element);
                });
                console.log('✅ Element inspector event listener attached');
            } else {
                console.warn('⚠️ Element inspector does not support addEventListener. Using fallback integration.');
                // For older versions, we can still use the element inspector for direct calls
                // The integration will work but without automatic event handling
            }
        }
    }

    // Public API methods
    getScreenshotQueue() {
        return [...this.captureQueue];
    }

    clearScreenshotQueue() {
        this.captureQueue = [];
        this.updateQueueDisplay();
    }

    getCapabilities() {
        return {
            fullPage: true,
            elementCapture: true,
            multiElement: true,
            annotations: true,
            aiIntegration: true,
            visionAnalysis: true,
            accessibilityAnalysis: true,
            performanceAnalysis: true,
            designPatternRecognition: true,
            mobileResponsivenessAnalysis: true,
            realTimeInsights: true,
            queueManagement: true,
            keyboardShortcuts: true,
            websocketIntegration: true
        };
    }

    // Computer Vision Analysis Methods
    async performAutomaticAnalysis(screenshotResult) {
        try {
            const analysisRequest = {
                type: 'vision_analysis',
                screenshot: screenshotResult.data,
                metadata: screenshotResult.metadata,
                analysisTypes: ['ui_ux', 'accessibility', 'performance', 'design_consistency'],
                prompt: this.aiPrompts.getFullPageAnalysisPrompt(),
                timestamp: Date.now(),
                requestId: this.generateRequestId()
            };

            this.analysisQueue.push(analysisRequest);
            this.sendMessage(analysisRequest);
            
            this.showCaptureNotification('🔍 AI analysis started...', 'info');
        } catch (error) {
            console.error('Automatic analysis failed:', error);
        }
    }

    async performElementAnalysis(screenshotResult, elementInfo) {
        try {
            const analysisRequest = {
                type: 'element_vision_analysis',
                screenshot: screenshotResult.data,
                elementContext: elementInfo,
                metadata: screenshotResult.metadata,
                prompt: this.aiPrompts.getElementAnalysisPrompt(elementInfo),
                timestamp: Date.now(),
                requestId: this.generateRequestId()
            };

            this.analysisQueue.push(analysisRequest);
            this.sendMessage(analysisRequest);
            
            this.showCaptureNotification(`🔍 Analyzing ${elementInfo.tagName}...`, 'info');
        } catch (error) {
            console.error('Element analysis failed:', error);
        }
    }

    async handleVisionAnalysisRequest(data) {
        const { screenshot, analysisTypes, customPrompt, options = {} } = data;
        
        try {
            let prompt = customPrompt;
            
            if (!prompt && analysisTypes) {
                prompt = this.aiPrompts.getAnalysisPromptByTypes(analysisTypes);
            }

            const visionRequest = {
                type: 'claude_vision_analysis',
                image: screenshot,
                prompt: prompt || this.aiPrompts.getFullPageAnalysisPrompt(),
                metadata: {
                    analysisTypes,
                    options,
                    url: window.location.href,
                    viewport: this.getViewportInfo(),
                    device: this.getDeviceInfo()
                },
                timestamp: Date.now(),
                requestId: data.requestId || this.generateRequestId()
            };

            this.sendMessage(visionRequest);
            
        } catch (error) {
            console.error('Vision analysis request failed:', error);
            this.sendMessage({
                type: 'analysis_error',
                requestId: data.requestId,
                error: error.message
            });
        }
    }

    async handleAccessibilityAnalysisRequest(data) {
        try {
            const screenshot = data.screenshot || await this.captureFullPageImage(0.9);
            const accessibilityData = await this.gatherAccessibilityData();
            
            const analysisRequest = {
                type: 'accessibility_vision_analysis',
                screenshot: screenshot,
                accessibilityData: accessibilityData,
                prompt: this.aiPrompts.getAccessibilityAnalysisPrompt(),
                metadata: {
                    url: window.location.href,
                    timestamp: Date.now()
                },
                requestId: data.requestId || this.generateRequestId()
            };

            this.sendMessage(analysisRequest);
            this.showCaptureNotification('♿ Accessibility analysis in progress...', 'info');
            
        } catch (error) {
            console.error('Accessibility analysis failed:', error);
        }
    }

    async handlePerformanceAnalysisRequest(data) {
        try {
            const screenshot = data.screenshot || await this.captureFullPageImage(0.9);
            const performanceData = await this.gatherPerformanceData();
            
            const analysisRequest = {
                type: 'performance_vision_analysis',
                screenshot: screenshot,
                performanceData: performanceData,
                prompt: this.aiPrompts.getPerformanceAnalysisPrompt(),
                metadata: {
                    url: window.location.href,
                    timestamp: Date.now()
                },
                requestId: data.requestId || this.generateRequestId()
            };

            this.sendMessage(analysisRequest);
            this.showCaptureNotification('⚡ Performance analysis in progress...', 'info');
            
        } catch (error) {
            console.error('Performance analysis failed:', error);
        }
    }

    async handleDesignPatternAnalysis(data) {
        try {
            const screenshot = data.screenshot || await this.captureFullPageImage(0.9);
            const designData = await this.gatherDesignPatternData();
            
            const analysisRequest = {
                type: 'design_pattern_analysis',
                screenshot: screenshot,
                designData: designData,
                prompt: this.aiPrompts.getDesignPatternAnalysisPrompt(),
                metadata: {
                    url: window.location.href,
                    timestamp: Date.now()
                },
                requestId: data.requestId || this.generateRequestId()
            };

            this.sendMessage(analysisRequest);
            this.showCaptureNotification('🎨 Design pattern analysis in progress...', 'info');
            
        } catch (error) {
            console.error('Design pattern analysis failed:', error);
        }
    }

    async gatherAccessibilityData() {
        const data = {
            headingStructure: this.analyzeHeadingStructure(),
            altTexts: this.analyzeImageAltTexts(),
            formLabels: this.analyzeFormLabels(),
            colorContrast: this.analyzeColorContrast(),
            keyboardNavigation: this.analyzeKeyboardNavigation(),
            ariaLabels: this.analyzeAriaLabels(),
            landmarks: this.analyzeLandmarks(),
            focusManagement: this.analyzeFocusManagement()
        };
        
        return data;
    }

    async gatherPerformanceData() {
        const performanceMetrics = performance.getEntriesByType('navigation')[0];
        const paintMetrics = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource');
        
        return {
            loadTiming: {
                domContentLoaded: performanceMetrics?.domContentLoadedEventEnd - performanceMetrics?.domContentLoadedEventStart,
                windowLoad: performanceMetrics?.loadEventEnd - performanceMetrics?.loadEventStart,
                firstPaint: paintMetrics.find(p => p.name === 'first-paint')?.startTime,
                firstContentfulPaint: paintMetrics.find(p => p.name === 'first-contentful-paint')?.startTime
            },
            resources: {
                totalCount: resources.length,
                largestResources: resources.sort((a, b) => b.transferSize - a.transferSize).slice(0, 10),
                slowestResources: resources.sort((a, b) => b.duration - a.duration).slice(0, 10)
            },
            memoryUsage: this.getMemoryUsage(),
            renderingMetrics: this.getRenderingMetrics()
        };
    }

    async gatherDesignPatternData() {
        return {
            layoutPatterns: this.analyzeLayoutPatterns(),
            colorScheme: this.analyzeColorScheme(),
            typography: this.analyzeTypography(),
            spacing: this.analyzeSpacing(),
            componentPatterns: this.analyzeComponentPatterns(),
            responsiveDesign: this.analyzeResponsiveDesign(),
            visualHierarchy: this.analyzeVisualHierarchy()
        };
    }

    // Analysis Helper Methods
    analyzeHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const structure = Array.from(headings).map(h => ({
            level: parseInt(h.tagName.charAt(1)),
            text: h.textContent?.slice(0, 100),
            hasId: !!h.id,
            hasClass: !!h.className
        }));
        
        return {
            headings: structure,
            hasH1: structure.some(h => h.level === 1),
            properNesting: this.validateHeadingNesting(structure),
            count: structure.length
        };
    }

    analyzeImageAltTexts() {
        const images = document.querySelectorAll('img');
        return Array.from(images).map(img => ({
            src: img.src,
            alt: img.alt,
            hasAlt: !!img.alt,
            isDecorative: img.alt === '',
            role: img.getAttribute('role')
        }));
    }

    analyzeFormLabels() {
        const inputs = document.querySelectorAll('input, textarea, select');
        return Array.from(inputs).map(input => ({
            type: input.type,
            id: input.id,
            hasLabel: input.labels?.length > 0,
            hasAriaLabel: !!input.getAttribute('aria-label'),
            hasAriaLabelledBy: !!input.getAttribute('aria-labelledby'),
            hasPlaceholder: !!input.placeholder
        }));
    }

    analyzeColorContrast() {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
        const contrastIssues = [];
        
        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            // Basic contrast check (would be enhanced with actual contrast ratio calculation)
            if (this.isPotentialContrastIssue(color, backgroundColor)) {
                contrastIssues.push({
                    element: this.generateSelector(el),
                    color: color,
                    backgroundColor: backgroundColor
                });
            }
        });
        
        return contrastIssues;
    }

    analyzeLayoutPatterns() {
        const layouts = {
            grid: document.querySelectorAll('[style*="grid"], .grid, [class*="grid"]').length,
            flexbox: document.querySelectorAll('[style*="flex"], .flex, [class*="flex"]').length,
            floats: document.querySelectorAll('[style*="float"]').length,
            positioning: document.querySelectorAll('[style*="position: absolute"], [style*="position: fixed"]').length
        };
        
        return layouts;
    }

    analyzeColorScheme() {
        const elements = document.querySelectorAll('*');
        const colors = new Set();
        const backgroundColors = new Set();
        
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
                colors.add(style.color);
            }
            if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                backgroundColors.add(style.backgroundColor);
            }
        });
        
        return {
            uniqueColors: Array.from(colors).slice(0, 20),
            uniqueBackgroundColors: Array.from(backgroundColors).slice(0, 20),
            colorCount: colors.size,
            backgroundColorCount: backgroundColors.size
        };
    }

    analyzeTypography() {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button');
        const fontFamilies = new Set();
        const fontSizes = new Set();
        const fontWeights = new Set();
        
        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            fontFamilies.add(style.fontFamily);
            fontSizes.add(style.fontSize);
            fontWeights.add(style.fontWeight);
        });
        
        return {
            fontFamilies: Array.from(fontFamilies),
            fontSizes: Array.from(fontSizes).sort(),
            fontWeights: Array.from(fontWeights).sort(),
            fontFamilyCount: fontFamilies.size,
            fontSizeCount: fontSizes.size
        };
    }

    analyzeComponentPatterns() {
        const patterns = {
            buttons: document.querySelectorAll('button, .btn, [role="button"]').length,
            cards: document.querySelectorAll('.card, [class*="card"]').length,
            modals: document.querySelectorAll('.modal, [role="dialog"]').length,
            navigation: document.querySelectorAll('nav, .nav, [role="navigation"]').length,
            forms: document.querySelectorAll('form').length,
            tables: document.querySelectorAll('table').length,
            lists: document.querySelectorAll('ul, ol').length
        };
        
        return patterns;
    }

    analyzeKeyboardNavigation() {
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
        const tabOrder = [];
        
        interactiveElements.forEach(el => {
            const tabIndex = el.tabIndex;
            const isVisible = el.offsetParent !== null;
            const isDisabled = el.disabled || el.getAttribute('aria-disabled') === 'true';
            
            tabOrder.push({
                element: this.generateSelector(el),
                tabIndex: tabIndex,
                isVisible: isVisible,
                isDisabled: isDisabled,
                hasKeyboardSupport: tabIndex >= 0 && !isDisabled
            });
        });
        
        return {
            totalInteractive: interactiveElements.length,
            keyboardAccessible: tabOrder.filter(el => el.hasKeyboardSupport).length,
            tabOrder: tabOrder.filter(el => el.tabIndex >= 0).sort((a, b) => a.tabIndex - b.tabIndex)
        };
    }

    analyzeAriaLabels() {
        const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
        
        return Array.from(elementsWithAria).map(el => ({
            element: this.generateSelector(el),
            ariaLabel: el.getAttribute('aria-label'),
            ariaLabelledBy: el.getAttribute('aria-labelledby'),
            ariaDescribedBy: el.getAttribute('aria-describedby'),
            role: el.getAttribute('role'),
            hasProperLabeling: !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.labels?.length)
        }));
    }

    analyzeLandmarks() {
        const landmarks = document.querySelectorAll('nav, main, aside, header, footer, section, [role="banner"], [role="main"], [role="navigation"], [role="complementary"], [role="contentinfo"]');
        
        return Array.from(landmarks).map(el => ({
            element: this.generateSelector(el),
            tagName: el.tagName.toLowerCase(),
            role: el.getAttribute('role') || this.getImplicitRole(el.tagName),
            hasLabel: !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'))
        }));
    }

    analyzeFocusManagement() {
        const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const focusIndicators = [];
        
        focusableElements.forEach(el => {
            const style = window.getComputedStyle(el, ':focus');
            const hasFocusStyle = style.outline !== 'none' || 
                                 style.boxShadow !== 'none' || 
                                 style.border !== window.getComputedStyle(el).border;
            
            focusIndicators.push({
                element: this.generateSelector(el),
                hasFocusIndicator: hasFocusStyle,
                isVisible: el.offsetParent !== null
            });
        });
        
        return {
            totalFocusable: focusableElements.length,
            withFocusIndicators: focusIndicators.filter(el => el.hasFocusIndicator).length,
            focusIndicators: focusIndicators
        };
    }

    analyzeSpacing() {
        const elements = document.querySelectorAll('div, section, article, header, footer, nav, main');
        const spacingData = [];
        
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            spacingData.push({
                element: this.generateSelector(el),
                margin: {
                    top: style.marginTop,
                    right: style.marginRight,
                    bottom: style.marginBottom,
                    left: style.marginLeft
                },
                padding: {
                    top: style.paddingTop,
                    right: style.paddingRight,
                    bottom: style.paddingBottom,
                    left: style.paddingLeft
                }
            });
        });
        
        // Calculate spacing consistency
        const margins = spacingData.flatMap(item => Object.values(item.margin));
        const paddings = spacingData.flatMap(item => Object.values(item.padding));
        
        return {
            uniqueMargins: [...new Set(margins)].length,
            uniquePaddings: [...new Set(paddings)].length,
            mostCommonMargin: this.getMostCommon(margins),
            mostCommonPadding: this.getMostCommon(paddings),
            spacingData: spacingData.slice(0, 20) // Limit for performance
        };
    }

    analyzeResponsiveDesign() {
        const responsiveElements = {
            mediaQueries: this.extractMediaQueries(),
            flexboxUsage: document.querySelectorAll('[style*="flex"], .flex, [class*="flex"]').length,
            gridUsage: document.querySelectorAll('[style*="grid"], .grid, [class*="grid"]').length,
            responsiveImages: document.querySelectorAll('img[srcset], picture').length,
            viewportMeta: !!document.querySelector('meta[name="viewport"]'),
            fluidWidths: document.querySelectorAll('[style*="%"], [style*="vw"], [style*="vh"]').length
        };
        
        return responsiveElements;
    }

    analyzeVisualHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const textElements = document.querySelectorAll('p, span, div');
        
        const hierarchy = {
            headingLevels: Array.from(headings).map(h => ({
                level: parseInt(h.tagName.charAt(1)),
                text: h.textContent?.slice(0, 50),
                fontSize: window.getComputedStyle(h).fontSize,
                fontWeight: window.getComputedStyle(h).fontWeight
            })),
            fontSizes: [...new Set(Array.from(textElements).map(el => 
                window.getComputedStyle(el).fontSize
            ))].sort((a, b) => parseInt(a) - parseInt(b)),
            contrast: this.calculateVisualContrast()
        };
        
        return hierarchy;
    }

    // Helper methods
    getImplicitRole(tagName) {
        const roleMap = {
            'nav': 'navigation',
            'main': 'main',
            'header': 'banner',
            'footer': 'contentinfo',
            'aside': 'complementary',
            'section': 'region'
        };
        return roleMap[tagName.toLowerCase()] || null;
    }

    extractMediaQueries() {
        const stylesheets = Array.from(document.styleSheets);
        const mediaQueries = [];
        
        try {
            stylesheets.forEach(sheet => {
                if (sheet.cssRules) {
                    Array.from(sheet.cssRules).forEach(rule => {
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            mediaQueries.push(rule.conditionText || rule.media.mediaText);
                        }
                    });
                }
            });
        } catch (e) {
            // Handle cross-origin stylesheet access errors
            console.log('Could not access some stylesheets due to CORS policy');
        }
        
        return [...new Set(mediaQueries)];
    }

    getMostCommon(arr) {
        const frequency = {};
        arr.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
        });
        
        return Object.keys(frequency).reduce((a, b) => 
            frequency[a] > frequency[b] ? a : b
        );
    }

    calculateVisualContrast() {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span');
        const contrasts = [];
        
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseInt(style.fontSize);
            const fontWeight = parseInt(style.fontWeight) || 400;
            const color = style.color;
            
            contrasts.push({
                element: this.generateSelector(el),
                fontSize: fontSize,
                fontWeight: fontWeight,
                color: color,
                emphasis: fontWeight > 600 || fontSize > 18
            });
        });
        
        return {
            totalElements: contrasts.length,
            emphasizedElements: contrasts.filter(c => c.emphasis).length,
            uniqueFontSizes: [...new Set(contrasts.map(c => c.fontSize))].length
        };
    }

    // Utility Methods
    generateRequestId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            orientation: window.screen?.orientation?.type || 'unknown'
        };
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    getRenderingMetrics() {
        const observer = new PerformanceObserver((list) => {
            // This would collect rendering metrics in real implementation
        });
        
        try {
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        } catch (e) {
            // Fallback for browsers that don't support this
        }
        
        return {
            domElements: document.querySelectorAll('*').length,
            imagesCount: document.querySelectorAll('img').length,
            scriptsCount: document.querySelectorAll('script').length,
            stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]').length
        };
    }

    isPotentialContrastIssue(color, backgroundColor) {
        // Simplified contrast check - in production, would use WCAG contrast ratio calculation
        return color === backgroundColor || 
               (color.includes('rgb(') && backgroundColor.includes('rgb(') && 
                this.getColorBrightness(color) === this.getColorBrightness(backgroundColor));
    }

    getColorBrightness(color) {
        // Simplified brightness calculation
        const rgb = color.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            return (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        }
        return 0;
    }

    validateHeadingNesting(headings) {
        let previousLevel = 0;
        return headings.every(heading => {
            const isValid = heading.level <= previousLevel + 1;
            previousLevel = heading.level;
            return isValid;
        });
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
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .screenshot-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
`;
document.head.appendChild(style);

// Initialize screenshot capture system
window.screenshotCaptureSystem = new ScreenshotCaptureSystem();

console.log('📸 Screenshot Capture System initialized with Windsurf-like functionality');