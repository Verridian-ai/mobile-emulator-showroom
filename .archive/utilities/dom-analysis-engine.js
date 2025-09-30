/**
 * DOM Analysis Engine - Comprehensive Element Analysis and Information Extraction System
 * 
 * This module provides:
 * - Deep DOM traversal and analysis
 * - Element relationship mapping (parent/child/sibling)
 * - CSS style analysis and inheritance
 * - Accessibility audit for individual elements
 * - Performance impact analysis
 * - SEO element analysis
 * - Cross-browser compatibility checks
 * - Element usage patterns and recommendations
 * 
 * Integrates with WebSocket system for real-time analysis and AI chat system
 */

class DOMAnalysisEngine {
    constructor() {
        this.isInitialized = false;
        this.analysisCache = new Map();
        this.performanceCache = new Map();
        this.websocket = null;
        this.analysisHistory = [];
        this.observers = new Map();
        this.analysisModules = new Map();
        
        // Configuration
        this.config = {
            CACHE_TTL: 30000, // 30 seconds
            MAX_CACHE_SIZE: 100,
            MAX_DEPTH: 10,
            PERFORMANCE_SAMPLE_SIZE: 5,
            ANALYSIS_DEBOUNCE: 300,
            WS_RECONNECT_DELAY: 3000
        };

        // Analysis capabilities
        this.capabilities = {
            domTraversal: true,
            relationshipMapping: true,
            styleAnalysis: true,
            accessibilityAudit: true,
            performanceAnalysis: true,
            seoAnalysis: true,
            compatibilityCheck: true,
            patternRecognition: true
        };

        this.init();
    }

    /**
     * Initialize the DOM analysis engine
     */
    init() {
        console.log('🔬 Initializing DOM Analysis Engine...');
        
        this.setupAnalysisModules();
        this.setupWebSocket();
        this.setupCacheManagement();
        this.setupPerformanceMonitoring();
        this.setupMutationObservers();
        this.bindEventListeners();
        
        this.isInitialized = true;
        console.log('✅ DOM Analysis Engine initialized with capabilities:', Object.keys(this.capabilities));
    }

    /**
     * Setup analysis modules
     */
    setupAnalysisModules() {
        // Register analysis modules
        this.analysisModules.set('dom', new DOMTraversalModule());
        this.analysisModules.set('css', new CSSAnalysisModule());
        this.analysisModules.set('accessibility', new AccessibilityModule());
        this.analysisModules.set('performance', new PerformanceModule());
        this.analysisModules.set('seo', new SEOModule());
        this.analysisModules.set('compatibility', new CompatibilityModule());
        this.analysisModules.set('patterns', new PatternModule());
    }

    /**
     * Setup WebSocket connection for real-time communication
     */
    setupWebSocket() {
        const brokerUrl = `ws://localhost:${window.BROKER_PORT || 7071}?token=devtoken123`;
        
        try {
            this.websocket = new WebSocket(brokerUrl);
            
            this.websocket.onopen = () => {
                console.log('🔗 DOM Analysis Engine connected to WebSocket');
                this.websocket.send(JSON.stringify({
                    role: 'dom-analyzer',
                    action: 'register',
                    capabilities: this.capabilities,
                    timestamp: Date.now()
                }));
            };

            this.websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.websocket.onclose = () => {
                console.log('🔄 DOM Analysis WebSocket disconnected, reconnecting...');
                setTimeout(() => this.setupWebSocket(), this.config.WS_RECONNECT_DELAY);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ DOM Analysis WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to setup DOM Analysis WebSocket:', error);
        }
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'analyze_element_request':
                this.handleElementAnalysisRequest(message);
                break;
            case 'analyze_page_request':
                this.handlePageAnalysisRequest(message);
                break;
            case 'performance_analysis_request':
                this.handlePerformanceAnalysisRequest(message);
                break;
            case 'accessibility_audit_request':
                this.handleAccessibilityAuditRequest(message);
                break;
            case 'seo_analysis_request':
                this.handleSEOAnalysisRequest(message);
                break;
            case 'cache_clear_request':
                this.clearAnalysisCache();
                break;
        }
    }

    /**
     * Setup cache management with TTL and size limits
     */
    setupCacheManagement() {
        // Clear expired cache entries periodically
        setInterval(() => {
            this.cleanExpiredCache();
        }, this.config.CACHE_TTL);

        // Monitor cache size
        setInterval(() => {
            if (this.analysisCache.size > this.config.MAX_CACHE_SIZE) {
                this.pruneCache();
            }
        }, 10000);
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        this.performanceMetrics = {
            analysisCount: 0,
            averageAnalysisTime: 0,
            cacheHitRate: 0,
            memoryUsage: 0,
            lastAnalysis: null
        };

        // Update performance metrics periodically
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000);
    }

    /**
     * Setup mutation observers for DOM changes
     */
    setupMutationObservers() {
        const observerConfig = {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true
        };

        const observer = new MutationObserver((mutations) => {
            this.handleDOMChanges(mutations);
        });

        observer.observe(document.body, observerConfig);
        this.observers.set('dom', observer);
    }

    /**
     * Handle DOM changes and invalidate relevant cache
     */
    handleDOMChanges(mutations) {
        const affectedElements = new Set();
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        affectedElements.add(node);
                    }
                });
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.invalidateElementCache(node);
                    }
                });
            } else if (mutation.type === 'attributes') {
                affectedElements.add(mutation.target);
            }
        });

        // Debounce cache invalidation
        clearTimeout(this.invalidationTimeout);
        this.invalidationTimeout = setTimeout(() => {
            affectedElements.forEach(element => {
                this.invalidateElementCache(element);
            });
        }, this.config.ANALYSIS_DEBOUNCE);
    }

    /**
     * Bind event listeners
     */
    bindEventListeners() {
        // Listen for custom events from other modules
        document.addEventListener('elementSelected', (event) => {
            this.analyzeElement(event.detail.element, event.detail.options);
        });

        document.addEventListener('pageAnalysisRequested', (event) => {
            this.analyzeFullPage(event.detail.options);
        });

        // Performance monitoring
        window.addEventListener('beforeunload', () => {
            this.saveAnalysisHistory();
        });
    }

    /**
     * Comprehensive element analysis
     */
    async analyzeElement(element, options = {}) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            throw new Error('Invalid element provided for analysis');
        }

        const startTime = performance.now();
        const elementKey = this.generateElementKey(element);
        
        // Check cache first
        if (!options.bypassCache && this.analysisCache.has(elementKey)) {
            const cached = this.analysisCache.get(elementKey);
            if (Date.now() - cached.timestamp < this.config.CACHE_TTL) {
                this.updateCacheStats(true);
                return cached.data;
            }
        }

        try {
            const analysis = await this.performElementAnalysis(element, options);
            
            // Cache the results
            this.analysisCache.set(elementKey, {
                data: analysis,
                timestamp: Date.now()
            });

            // Update performance metrics
            const analysisTime = performance.now() - startTime;
            this.updateAnalysisMetrics(analysisTime);
            this.updateCacheStats(false);

            // Send results via WebSocket if connected
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'element_analysis_complete',
                    elementKey,
                    analysis,
                    analysisTime,
                    timestamp: Date.now()
                }));
            }

            return analysis;

        } catch (error) {
            console.error('Element analysis failed:', error);
            throw error;
        }
    }

    /**
     * Perform comprehensive element analysis using all modules
     */
    async performElementAnalysis(element, options) {
        const analysis = {
            element: {
                tagName: element.tagName.toLowerCase(),
                id: element.id || null,
                className: element.className || null,
                selector: this.generateUniqueSelector(element),
                text: element.textContent?.substring(0, 500) || null
            },
            timestamp: Date.now(),
            analysisVersion: '1.0.0'
        };

        // Run all analysis modules
        const modulePromises = Array.from(this.analysisModules.entries()).map(async ([name, module]) => {
            if (options.modules && !options.modules.includes(name)) {
                return [name, null]; // Skip if not requested
            }
            
            try {
                const result = await module.analyze(element, options);
                return [name, result];
            } catch (error) {
                console.warn(`${name} module analysis failed:`, error);
                return [name, { error: error.message }];
            }
        });

        const moduleResults = await Promise.all(modulePromises);
        
        // Combine results
        moduleResults.forEach(([name, result]) => {
            if (result !== null) {
                analysis[name] = result;
            }
        });

        // Add summary and recommendations
        analysis.summary = this.generateAnalysisSummary(analysis);
        analysis.recommendations = this.generateRecommendations(analysis);
        analysis.score = this.calculateOverallScore(analysis);

        return analysis;
    }

    /**
     * Analyze entire page
     */
    async analyzeFullPage(options = {}) {
        const startTime = performance.now();
        
        const pageAnalysis = {
            url: window.location.href,
            title: document.title,
            timestamp: Date.now(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        try {
            // Analyze key elements
            const importantSelectors = [
                'html', 'head', 'body', 'main',
                'h1, h2, h3, h4, h5, h6',
                'nav, header, footer, aside',
                'form, input, button, select, textarea',
                'img, video, audio, canvas, svg',
                'a[href], [role="button"]',
                '[aria-label], [aria-describedby], [aria-hidden]',
                '.btn, .button, .link, .card, .modal'
            ];

            const elementAnalyses = [];
            const elementCounts = {};

            for (const selector of importantSelectors) {
                const elements = document.querySelectorAll(selector);
                elementCounts[selector] = elements.length;

                // Analyze up to 5 elements per selector to avoid overwhelming
                const elementsToAnalyze = Array.from(elements).slice(0, 5);
                
                for (const element of elementsToAnalyze) {
                    try {
                        const analysis = await this.analyzeElement(element, { 
                            ...options, 
                            quickMode: true 
                        });
                        elementAnalyses.push({
                            selector,
                            analysis
                        });
                    } catch (error) {
                        console.warn(`Failed to analyze element ${selector}:`, error);
                    }
                }
            }

            pageAnalysis.elements = elementAnalyses;
            pageAnalysis.elementCounts = elementCounts;
            
            // Global page analysis
            pageAnalysis.seo = await this.analysisModules.get('seo').analyzePage();
            pageAnalysis.accessibility = await this.analysisModules.get('accessibility').analyzePageAccessibility();
            pageAnalysis.performance = await this.analysisModules.get('performance').analyzePagePerformance();
            pageAnalysis.structure = this.analyzePageStructure();
            
            // Generate page-level recommendations
            pageAnalysis.recommendations = this.generatePageRecommendations(pageAnalysis);
            pageAnalysis.overallScore = this.calculatePageScore(pageAnalysis);
            
            const analysisTime = performance.now() - startTime;
            pageAnalysis.analysisTime = analysisTime;

            // Send results via WebSocket
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'page_analysis_complete',
                    analysis: pageAnalysis,
                    timestamp: Date.now()
                }));
            }

            return pageAnalysis;

        } catch (error) {
            console.error('Page analysis failed:', error);
            throw error;
        }
    }

    /**
     * Generate unique CSS selector for element
     */
    generateUniqueSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }

        const path = [];
        let current = element;

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.className) {
                selector += '.' + current.className.split(' ').filter(c => c).join('.');
            }

            // Add nth-child if needed for uniqueness
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(
                    child => child.tagName === current.tagName
                );
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    selector += `:nth-child(${index})`;
                }
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    /**
     * Generate element cache key
     */
    generateElementKey(element) {
        const selector = this.generateUniqueSelector(element);
        const attributes = Array.from(element.attributes)
            .map(attr => `${attr.name}="${attr.value}"`)
            .sort()
            .join('|');
        
        return `${selector}::${attributes}`;
    }

    /**
     * Analyze page structure
     */
    analyzePageStructure() {
        const structure = {
            headingHierarchy: this.analyzeHeadingHierarchy(),
            landmarkStructure: this.analyzeLandmarkStructure(),
            formStructure: this.analyzeFormStructure(),
            linkStructure: this.analyzeLinkStructure(),
            imageStructure: this.analyzeImageStructure()
        };

        return structure;
    }

    /**
     * Analyze heading hierarchy
     */
    analyzeHeadingHierarchy() {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const hierarchy = [];
        const issues = [];

        let lastLevel = 0;

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();

            hierarchy.push({
                level,
                text: text.substring(0, 100),
                id: heading.id,
                selector: this.generateUniqueSelector(heading)
            });

            // Check for heading hierarchy issues
            if (index === 0 && level !== 1) {
                issues.push('First heading should be h1');
            }
            
            if (level > lastLevel + 1) {
                issues.push(`Heading level skipped: h${lastLevel} to h${level}`);
            }

            if (!text) {
                issues.push(`Empty heading: ${heading.tagName}`);
            }

            lastLevel = level;
        });

        return { hierarchy, issues };
    }

    /**
     * Analyze landmark structure
     */
    analyzeLandmarkStructure() {
        const landmarks = [
            { role: 'main', selector: 'main, [role="main"]' },
            { role: 'navigation', selector: 'nav, [role="navigation"]' },
            { role: 'banner', selector: 'header, [role="banner"]' },
            { role: 'contentinfo', selector: 'footer, [role="contentinfo"]' },
            { role: 'complementary', selector: 'aside, [role="complementary"]' },
            { role: 'search', selector: '[role="search"]' },
            { role: 'form', selector: '[role="form"]' }
        ];

        const structure = {};
        const issues = [];

        landmarks.forEach(({ role, selector }) => {
            const elements = Array.from(document.querySelectorAll(selector));
            structure[role] = elements.map(el => ({
                tagName: el.tagName.toLowerCase(),
                id: el.id,
                ariaLabel: el.getAttribute('aria-label'),
                selector: this.generateUniqueSelector(el)
            }));

            // Check for issues
            if (role === 'main' && elements.length === 0) {
                issues.push('Missing main landmark');
            }
            if (role === 'main' && elements.length > 1) {
                issues.push('Multiple main landmarks found');
            }
        });

        return { structure, issues };
    }

    /**
     * Analyze form structure
     */
    analyzeFormStructure() {
        const forms = Array.from(document.querySelectorAll('form'));
        const formAnalysis = [];

        forms.forEach(form => {
            const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
            const labels = Array.from(form.querySelectorAll('label'));
            const buttons = Array.from(form.querySelectorAll('button, input[type="submit"]'));

            const analysis = {
                id: form.id,
                action: form.action,
                method: form.method,
                inputs: inputs.length,
                labels: labels.length,
                buttons: buttons.length,
                issues: []
            };

            // Check for accessibility issues
            inputs.forEach(input => {
                const hasLabel = input.labels && input.labels.length > 0;
                const hasAriaLabel = input.getAttribute('aria-label');
                const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

                if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
                    analysis.issues.push(`Input without label: ${input.type || input.tagName}`);
                }

                if (input.required && !input.getAttribute('aria-required')) {
                    analysis.issues.push(`Required input without aria-required: ${input.type || input.tagName}`);
                }
            });

            formAnalysis.push(analysis);
        });

        return formAnalysis;
    }

    /**
     * Analyze link structure
     */
    analyzeLinkStructure() {
        const links = Array.from(document.querySelectorAll('a[href]'));
        const analysis = {
            total: links.length,
            external: 0,
            internal: 0,
            fragments: 0,
            issues: []
        };

        const currentDomain = window.location.hostname;

        links.forEach(link => {
            const href = link.href;
            const text = link.textContent.trim();

            if (href.startsWith('#')) {
                analysis.fragments++;
            } else if (href.includes(currentDomain) || href.startsWith('/')) {
                analysis.internal++;
            } else {
                analysis.external++;
            }

            // Check for issues
            if (!text && !link.getAttribute('aria-label') && !link.querySelector('img[alt]')) {
                analysis.issues.push('Link without accessible text');
            }

            if (text.toLowerCase().includes('click here') || text.toLowerCase().includes('read more')) {
                analysis.issues.push(`Generic link text: "${text}"`);
            }
        });

        return analysis;
    }

    /**
     * Analyze image structure
     */
    analyzeImageStructure() {
        const images = Array.from(document.querySelectorAll('img'));
        const analysis = {
            total: images.length,
            withAlt: 0,
            withoutAlt: 0,
            decorative: 0,
            issues: []
        };

        images.forEach(img => {
            const alt = img.getAttribute('alt');
            const isDecorative = alt === '';

            if (isDecorative) {
                analysis.decorative++;
            } else if (alt) {
                analysis.withAlt++;
            } else {
                analysis.withoutAlt++;
                analysis.issues.push(`Image without alt text: ${img.src}`);
            }

            // Check for other issues
            if (alt && alt.length > 125) {
                analysis.issues.push(`Alt text too long (${alt.length} chars): ${img.src}`);
            }

            if (!img.width || !img.height) {
                analysis.issues.push(`Image without dimensions: ${img.src}`);
            }
        });

        return analysis;
    }

    /**
     * Generate analysis summary
     */
    generateAnalysisSummary(analysis) {
        const issues = [];
        const strengths = [];

        // Check each analysis module for issues and strengths
        Object.entries(analysis).forEach(([module, data]) => {
            if (typeof data === 'object' && data.issues) {
                issues.push(...data.issues.map(issue => `${module}: ${issue}`));
            }
            if (typeof data === 'object' && data.strengths) {
                strengths.push(...data.strengths.map(strength => `${module}: ${strength}`));
            }
        });

        return {
            totalIssues: issues.length,
            totalStrengths: strengths.length,
            criticalIssues: issues.filter(issue => issue.includes('critical') || issue.includes('error')),
            topIssues: issues.slice(0, 5),
            topStrengths: strengths.slice(0, 3)
        };
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // Accessibility recommendations
        if (analysis.accessibility?.issues?.length > 0) {
            recommendations.push({
                category: 'Accessibility',
                priority: 'high',
                recommendations: analysis.accessibility.issues.map(issue => ({
                    issue,
                    solution: this.getAccessibilitySolution(issue)
                }))
            });
        }

        // Performance recommendations
        if (analysis.performance?.issues?.length > 0) {
            recommendations.push({
                category: 'Performance',
                priority: 'medium',
                recommendations: analysis.performance.issues.map(issue => ({
                    issue,
                    solution: this.getPerformanceSolution(issue)
                }))
            });
        }

        // SEO recommendations
        if (analysis.seo?.issues?.length > 0) {
            recommendations.push({
                category: 'SEO',
                priority: 'medium',
                recommendations: analysis.seo.issues.map(issue => ({
                    issue,
                    solution: this.getSEOSolution(issue)
                }))
            });
        }

        return recommendations;
    }

    /**
     * Calculate overall score
     */
    calculateOverallScore(analysis) {
        let score = 100;
        let factors = {
            accessibility: 0,
            performance: 0,
            seo: 0,
            compatibility: 0
        };

        // Deduct points for issues in each category
        Object.entries(analysis).forEach(([category, data]) => {
            if (typeof data === 'object' && data.issues) {
                const issueCount = data.issues.length;
                const deduction = Math.min(issueCount * 5, 30); // Max 30 points per category
                factors[category] = deduction;
                score -= deduction;
            }
        });

        return {
            overall: Math.max(score, 0),
            breakdown: factors
        };
    }

    /**
     * Generate page recommendations
     */
    generatePageRecommendations(pageAnalysis) {
        const recommendations = [];

        // Structure recommendations
        if (pageAnalysis.structure.headingHierarchy.issues.length > 0) {
            recommendations.push({
                category: 'Structure',
                priority: 'high',
                title: 'Fix heading hierarchy issues',
                issues: pageAnalysis.structure.headingHierarchy.issues
            });
        }

        if (pageAnalysis.structure.landmarkStructure.issues.length > 0) {
            recommendations.push({
                category: 'Structure',
                priority: 'high',
                title: 'Improve landmark structure',
                issues: pageAnalysis.structure.landmarkStructure.issues
            });
        }

        return recommendations;
    }

    /**
     * Calculate page score
     */
    calculatePageScore(pageAnalysis) {
        const scores = {
            structure: 100,
            accessibility: 100,
            performance: 100,
            seo: 100
        };

        // Deduct points for structural issues
        const structureIssues = Object.values(pageAnalysis.structure).reduce((total, section) => {
            return total + (section.issues ? section.issues.length : 0);
        }, 0);
        scores.structure = Math.max(100 - (structureIssues * 5), 0);

        // Calculate other scores from analysis modules
        if (pageAnalysis.accessibility?.score) {
            scores.accessibility = pageAnalysis.accessibility.score;
        }
        if (pageAnalysis.performance?.score) {
            scores.performance = pageAnalysis.performance.score;
        }
        if (pageAnalysis.seo?.score) {
            scores.seo = pageAnalysis.seo.score;
        }

        const overall = (scores.structure + scores.accessibility + scores.performance + scores.seo) / 4;

        return { overall, breakdown: scores };
    }

    /**
     * Get accessibility solution for issue
     */
    getAccessibilitySolution(issue) {
        const solutions = {
            'missing alt text': 'Add descriptive alt text to images',
            'missing label': 'Add proper labels to form inputs',
            'low contrast': 'Increase color contrast to meet WCAG guidelines',
            'missing focus indicator': 'Add visible focus indicators for keyboard navigation'
        };

        for (const [key, solution] of Object.entries(solutions)) {
            if (issue.toLowerCase().includes(key)) {
                return solution;
            }
        }

        return 'Review accessibility guidelines for this issue';
    }

    /**
     * Get performance solution for issue
     */
    getPerformanceSolution(issue) {
        const solutions = {
            'large image': 'Optimize and compress images',
            'blocking script': 'Load scripts asynchronously or defer loading',
            'unused css': 'Remove unused CSS rules',
            'slow query': 'Optimize DOM queries and use caching'
        };

        for (const [key, solution] of Object.entries(solutions)) {
            if (issue.toLowerCase().includes(key)) {
                return solution;
            }
        }

        return 'Review performance best practices for this issue';
    }

    /**
     * Get SEO solution for issue
     */
    getSEOSolution(issue) {
        const solutions = {
            'missing title': 'Add descriptive page title',
            'missing meta description': 'Add meta description to improve search results',
            'missing h1': 'Add a main h1 heading to the page',
            'duplicate content': 'Ensure content is unique and valuable'
        };

        for (const [key, solution] of Object.entries(solutions)) {
            if (issue.toLowerCase().includes(key)) {
                return solution;
            }
        }

        return 'Review SEO best practices for this issue';
    }

    /**
     * Cache management methods
     */
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.analysisCache.entries()) {
            if (now - value.timestamp > this.config.CACHE_TTL) {
                this.analysisCache.delete(key);
            }
        }
    }

    pruneCache() {
        const entries = Array.from(this.analysisCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = Math.floor(entries.length * 0.3); // Remove 30% of oldest entries
        for (let i = 0; i < toRemove; i++) {
            this.analysisCache.delete(entries[i][0]);
        }
    }

    clearAnalysisCache() {
        this.analysisCache.clear();
        this.performanceCache.clear();
        console.log('🧹 Analysis cache cleared');
    }

    invalidateElementCache(element) {
        const elementKey = this.generateElementKey(element);
        this.analysisCache.delete(elementKey);
    }

    /**
     * Performance monitoring methods
     */
    updateAnalysisMetrics(analysisTime) {
        this.performanceMetrics.analysisCount++;
        this.performanceMetrics.averageAnalysisTime = 
            (this.performanceMetrics.averageAnalysisTime + analysisTime) / 2;
        this.performanceMetrics.lastAnalysis = Date.now();
    }

    updateCacheStats(isHit) {
        const totalRequests = this.performanceMetrics.analysisCount;
        if (isHit) {
            this.performanceMetrics.cacheHits = (this.performanceMetrics.cacheHits || 0) + 1;
        }
        
        if (totalRequests > 0) {
            this.performanceMetrics.cacheHitRate = 
                (this.performanceMetrics.cacheHits || 0) / totalRequests;
        }
    }

    updatePerformanceMetrics() {
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
    }

    /**
     * WebSocket message handlers
     */
    async handleElementAnalysisRequest(message) {
        try {
            const { selector, options } = message;
            const element = document.querySelector(selector);
            
            if (!element) {
                throw new Error(`Element not found: ${selector}`);
            }

            const analysis = await this.analyzeElement(element, options);
            
            this.websocket.send(JSON.stringify({
                type: 'element_analysis_response',
                requestId: message.requestId,
                analysis,
                success: true
            }));

        } catch (error) {
            this.websocket.send(JSON.stringify({
                type: 'element_analysis_response',
                requestId: message.requestId,
                error: error.message,
                success: false
            }));
        }
    }

    async handlePageAnalysisRequest(message) {
        try {
            const analysis = await this.analyzeFullPage(message.options);
            
            this.websocket.send(JSON.stringify({
                type: 'page_analysis_response',
                requestId: message.requestId,
                analysis,
                success: true
            }));

        } catch (error) {
            this.websocket.send(JSON.stringify({
                type: 'page_analysis_response',
                requestId: message.requestId,
                error: error.message,
                success: false
            }));
        }
    }

    async handlePerformanceAnalysisRequest(message) {
        try {
            const performanceModule = this.analysisModules.get('performance');
            const analysis = await performanceModule.analyzePagePerformance();
            
            this.websocket.send(JSON.stringify({
                type: 'performance_analysis_response',
                requestId: message.requestId,
                analysis,
                success: true
            }));

        } catch (error) {
            this.websocket.send(JSON.stringify({
                type: 'performance_analysis_response',
                requestId: message.requestId,
                error: error.message,
                success: false
            }));
        }
    }

    async handleAccessibilityAuditRequest(message) {
        try {
            const accessibilityModule = this.analysisModules.get('accessibility');
            const audit = await accessibilityModule.performFullAudit();
            
            this.websocket.send(JSON.stringify({
                type: 'accessibility_audit_response',
                requestId: message.requestId,
                audit,
                success: true
            }));

        } catch (error) {
            this.websocket.send(JSON.stringify({
                type: 'accessibility_audit_response',
                requestId: message.requestId,
                error: error.message,
                success: false
            }));
        }
    }

    async handleSEOAnalysisRequest(message) {
        try {
            const seoModule = this.analysisModules.get('seo');
            const analysis = await seoModule.performFullSEOAnalysis();
            
            this.websocket.send(JSON.stringify({
                type: 'seo_analysis_response',
                requestId: message.requestId,
                analysis,
                success: true
            }));

        } catch (error) {
            this.websocket.send(JSON.stringify({
                type: 'seo_analysis_response',
                requestId: message.requestId,
                error: error.message,
                success: false
            }));
        }
    }

    /**
     * Utility methods
     */
    saveAnalysisHistory() {
        try {
            localStorage.setItem('domAnalysisHistory', JSON.stringify(this.analysisHistory));
        } catch (error) {
            console.warn('Failed to save analysis history:', error);
        }
    }

    loadAnalysisHistory() {
        try {
            const history = localStorage.getItem('domAnalysisHistory');
            if (history) {
                this.analysisHistory = JSON.parse(history);
            }
        } catch (error) {
            console.warn('Failed to load analysis history:', error);
            this.analysisHistory = [];
        }
    }

    /**
     * Public API methods
     */
    getAnalysisCache() {
        return new Map(this.analysisCache);
    }

    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    getCapabilities() {
        return { ...this.capabilities };
    }

    isReady() {
        return this.isInitialized && this.websocket?.readyState === WebSocket.OPEN;
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        // Clean up observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        // Close WebSocket
        if (this.websocket) {
            this.websocket.close();
        }

        // Clear caches
        this.analysisCache.clear();
        this.performanceCache.clear();

        // Save history
        this.saveAnalysisHistory();

        console.log('🧹 DOM Analysis Engine destroyed');
    }
}

/**
 * Analysis Module Interfaces
 * These are placeholder implementations that should be extended
 */

class DOMTraversalModule {
    async analyze(element, options) {
        return {
            depth: this.getElementDepth(element),
            children: element.children.length,
            siblings: element.parentElement ? element.parentElement.children.length - 1 : 0,
            path: this.getElementPath(element),
            relationships: this.getElementRelationships(element),
            issues: this.findTraversalIssues(element)
        };
    }

    getElementDepth(element) {
        let depth = 0;
        let current = element;
        
        while (current && current !== document.documentElement) {
            depth++;
            current = current.parentElement;
        }
        
        return depth;
    }

    getElementPath(element) {
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            path.unshift({
                tagName: current.tagName.toLowerCase(),
                id: current.id,
                className: current.className
            });
            current = current.parentElement;
        }
        
        return path;
    }

    getElementRelationships(element) {
        return {
            parent: element.parentElement ? {
                tagName: element.parentElement.tagName.toLowerCase(),
                id: element.parentElement.id,
                className: element.parentElement.className
            } : null,
            nextSibling: element.nextElementSibling ? {
                tagName: element.nextElementSibling.tagName.toLowerCase(),
                id: element.nextElementSibling.id
            } : null,
            previousSibling: element.previousElementSibling ? {
                tagName: element.previousElementSibling.tagName.toLowerCase(),
                id: element.previousElementSibling.id
            } : null,
            firstChild: element.firstElementChild ? {
                tagName: element.firstElementChild.tagName.toLowerCase(),
                id: element.firstElementChild.id
            } : null,
            lastChild: element.lastElementChild ? {
                tagName: element.lastElementChild.tagName.toLowerCase(),
                id: element.lastElementChild.id
            } : null
        };
    }

    findTraversalIssues(element) {
        const issues = [];
        
        if (this.getElementDepth(element) > 15) {
            issues.push('Element is deeply nested (>15 levels)');
        }
        
        if (element.children.length > 50) {
            issues.push('Element has too many direct children (>50)');
        }
        
        return issues;
    }
}

class CSSAnalysisModule {
    async analyze(element, options) {
        const computedStyles = window.getComputedStyle(element);
        
        return {
            computedStyles: this.getRelevantStyles(computedStyles),
            inheritance: this.analyzeStyleInheritance(element),
            specificity: this.calculateSpecificity(element),
            boxModel: this.getBoxModel(element, computedStyles),
            issues: this.findStyleIssues(element, computedStyles)
        };
    }

    getRelevantStyles(computedStyles) {
        const relevantProperties = [
            'display', 'position', 'float', 'clear',
            'width', 'height', 'margin', 'padding', 'border',
            'color', 'background-color', 'background-image',
            'font-family', 'font-size', 'font-weight', 'line-height',
            'text-align', 'vertical-align',
            'z-index', 'overflow', 'visibility', 'opacity'
        ];

        const styles = {};
        relevantProperties.forEach(prop => {
            styles[prop] = computedStyles.getPropertyValue(prop);
        });

        return styles;
    }

    analyzeStyleInheritance(element) {
        const inheritableProperties = [
            'color', 'font-family', 'font-size', 'font-weight',
            'line-height', 'text-align', 'visibility'
        ];

        const inheritance = {};
        const computedStyles = window.getComputedStyle(element);
        const parentStyles = element.parentElement ? 
            window.getComputedStyle(element.parentElement) : null;

        inheritableProperties.forEach(prop => {
            const value = computedStyles.getPropertyValue(prop);
            const parentValue = parentStyles ? parentStyles.getPropertyValue(prop) : null;
            
            inheritance[prop] = {
                value,
                inherited: value === parentValue,
                parentValue
            };
        });

        return inheritance;
    }

    calculateSpecificity(element) {
        // This is a simplified specificity calculation
        // In a real implementation, you'd parse the actual CSS rules
        let specificity = 0;
        
        if (element.id) specificity += 100;
        if (element.className) specificity += element.className.split(' ').length * 10;
        specificity += 1; // element itself
        
        return specificity;
    }

    getBoxModel(element, computedStyles) {
        const rect = element.getBoundingClientRect();
        
        return {
            width: rect.width,
            height: rect.height,
            margin: {
                top: parseFloat(computedStyles.marginTop),
                right: parseFloat(computedStyles.marginRight),
                bottom: parseFloat(computedStyles.marginBottom),
                left: parseFloat(computedStyles.marginLeft)
            },
            padding: {
                top: parseFloat(computedStyles.paddingTop),
                right: parseFloat(computedStyles.paddingRight),
                bottom: parseFloat(computedStyles.paddingBottom),
                left: parseFloat(computedStyles.paddingLeft)
            },
            border: {
                top: parseFloat(computedStyles.borderTopWidth),
                right: parseFloat(computedStyles.borderRightWidth),
                bottom: parseFloat(computedStyles.borderBottomWidth),
                left: parseFloat(computedStyles.borderLeftWidth)
            }
        };
    }

    findStyleIssues(element, computedStyles) {
        const issues = [];
        
        // Check for potential issues
        const opacity = parseFloat(computedStyles.opacity);
        if (opacity < 0.5 && opacity > 0) {
            issues.push('Low opacity may affect visibility');
        }
        
        if (computedStyles.overflow === 'hidden' && element.scrollHeight > element.clientHeight) {
            issues.push('Content may be cut off due to overflow:hidden');
        }
        
        const zIndex = parseInt(computedStyles.zIndex);
        if (zIndex > 9999) {
            issues.push('Extremely high z-index value');
        }
        
        return issues;
    }
}

class AccessibilityModule {
    async analyze(element, options) {
        return {
            role: this.getElementRole(element),
            labels: this.getElementLabels(element),
            ariaProperties: this.getAriaProperties(element),
            keyboardAccessibility: this.checkKeyboardAccessibility(element),
            colorContrast: await this.checkColorContrast(element),
            issues: this.findAccessibilityIssues(element)
        };
    }

    async analyzePageAccessibility() {
        const issues = [];
        const checks = [
            this.checkHeadingStructure(),
            this.checkImageAltText(),
            this.checkFormLabels(),
            this.checkLinkText(),
            this.checkColorContrast()
        ];

        const results = await Promise.all(checks);
        results.forEach(result => {
            if (result.issues) {
                issues.push(...result.issues);
            }
        });

        return {
            issues,
            score: Math.max(100 - (issues.length * 5), 0),
            checks: results
        };
    }

    async performFullAudit() {
        return await this.analyzePageAccessibility();
    }

    getElementRole(element) {
        return {
            explicit: element.getAttribute('role'),
            implicit: this.getImplicitRole(element.tagName.toLowerCase()),
            computed: element.getAttribute('role') || this.getImplicitRole(element.tagName.toLowerCase())
        };
    }

    getImplicitRole(tagName) {
        const roleMap = {
            'button': 'button',
            'a': 'link',
            'img': 'img',
            'input': 'textbox',
            'textarea': 'textbox',
            'select': 'combobox',
            'nav': 'navigation',
            'main': 'main',
            'aside': 'complementary',
            'header': 'banner',
            'footer': 'contentinfo',
            'h1': 'heading',
            'h2': 'heading',
            'h3': 'heading',
            'h4': 'heading',
            'h5': 'heading',
            'h6': 'heading'
        };

        return roleMap[tagName] || null;
    }

    getElementLabels(element) {
        const labels = [];
        
        // Associated label elements
        if (element.labels) {
            Array.from(element.labels).forEach(label => {
                labels.push({
                    type: 'label',
                    text: label.textContent.trim(),
                    position: this.getLabelPosition(label, element)
                });
            });
        }

        // aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) {
            labels.push({
                type: 'aria-label',
                text: ariaLabel
            });
        }

        // aria-labelledby
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            if (labelElement) {
                labels.push({
                    type: 'aria-labelledby',
                    text: labelElement.textContent.trim(),
                    elementId: ariaLabelledBy
                });
            }
        }

        return labels;
    }

    getLabelPosition(label, element) {
        const labelRect = label.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        if (labelRect.bottom <= elementRect.top) return 'above';
        if (labelRect.top >= elementRect.bottom) return 'below';
        if (labelRect.right <= elementRect.left) return 'left';
        if (labelRect.left >= elementRect.right) return 'right';
        return 'overlapping';
    }

    getAriaProperties(element) {
        const ariaProperties = {};
        
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('aria-')) {
                ariaProperties[attr.name] = attr.value;
            }
        });

        return ariaProperties;
    }

    checkKeyboardAccessibility(element) {
        const isInteractive = this.isInteractiveElement(element);
        const isFocusable = element.tabIndex >= 0;
        const hasKeyboardHandlers = this.hasKeyboardEventListeners(element);

        return {
            isInteractive,
            isFocusable,
            tabIndex: element.tabIndex,
            hasKeyboardHandlers,
            accessible: !isInteractive || isFocusable
        };
    }

    isInteractiveElement(element) {
        const interactiveTags = ['button', 'a', 'input', 'textarea', 'select'];
        const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio'];
        
        return interactiveTags.includes(element.tagName.toLowerCase()) ||
               interactiveRoles.includes(element.getAttribute('role')) ||
               element.hasAttribute('onclick') ||
               element.hasAttribute('onkeydown');
    }

    hasKeyboardEventListeners(element) {
        // This is a simplified check - in reality, you'd need to check for actual event listeners
        return element.hasAttribute('onkeydown') || 
               element.hasAttribute('onkeyup') || 
               element.hasAttribute('onkeypress');
    }

    async checkColorContrast(element) {
        const computedStyles = window.getComputedStyle(element);
        const color = computedStyles.color;
        const backgroundColor = computedStyles.backgroundColor;
        
        // This is a simplified contrast check
        // In a real implementation, you'd use a proper color contrast algorithm
        const hasTransparentBackground = backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent';
        
        return {
            textColor: color,
            backgroundColor: backgroundColor,
            hasTransparentBackground,
            ratio: null, // Would calculate actual contrast ratio
            meetsWCAG: null, // Would check against WCAG standards
            issue: hasTransparentBackground ? 'Cannot determine contrast ratio with transparent background' : null
        };
    }

    findAccessibilityIssues(element) {
        const issues = [];
        
        // Check for missing alt text on images
        if (element.tagName.toLowerCase() === 'img' && !element.getAttribute('alt')) {
            issues.push('Image missing alt text');
        }

        // Check for form inputs without labels
        if (['input', 'textarea', 'select'].includes(element.tagName.toLowerCase())) {
            const labels = this.getElementLabels(element);
            if (labels.length === 0) {
                issues.push('Form input missing accessible label');
            }
        }

        // Check for interactive elements without keyboard accessibility
        if (this.isInteractiveElement(element) && element.tabIndex < 0) {
            issues.push('Interactive element not keyboard accessible');
        }

        // Check for empty links
        if (element.tagName.toLowerCase() === 'a' && !element.textContent.trim() && !element.getAttribute('aria-label')) {
            issues.push('Link has no accessible text');
        }

        return issues;
    }

    checkHeadingStructure() {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const issues = [];
        
        if (headings.length === 0) {
            issues.push('No headings found on page');
        } else if (headings[0].tagName !== 'H1') {
            issues.push('Page should start with h1 heading');
        }

        let lastLevel = 0;
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level > lastLevel + 1) {
                issues.push(`Heading level skipped from h${lastLevel} to h${level}`);
            }
            
            if (!heading.textContent.trim()) {
                issues.push(`Empty ${heading.tagName.toLowerCase()} heading`);
            }
            
            lastLevel = level;
        });

        return { type: 'heading-structure', issues };
    }

    checkImageAltText() {
        const images = Array.from(document.querySelectorAll('img'));
        const issues = [];
        
        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                issues.push(`Image missing alt attribute: ${img.src}`);
            } else if (img.alt.length > 125) {
                issues.push(`Alt text too long (${img.alt.length} chars): ${img.src}`);
            }
        });

        return { type: 'image-alt-text', issues };
    }

    checkFormLabels() {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        const issues = [];
        
        inputs.forEach(input => {
            const labels = this.getElementLabels(input);
            if (labels.length === 0) {
                issues.push(`Form input without label: ${input.type || input.tagName}`);
            }
        });

        return { type: 'form-labels', issues };
    }

    checkLinkText() {
        const links = Array.from(document.querySelectorAll('a[href]'));
        const issues = [];
        
        links.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            
            if (!text && !link.getAttribute('aria-label') && !link.querySelector('img[alt]')) {
                issues.push('Link without accessible text');
            } else if (['click here', 'read more', 'more', 'here'].includes(text)) {
                issues.push(`Non-descriptive link text: "${text}"`);
            }
        });

        return { type: 'link-text', issues };
    }
}

class PerformanceModule {
    async analyze(element, options) {
        return {
            renderingCost: this.estimateRenderingCost(element),
            memoryImpact: this.estimateMemoryImpact(element),
            layoutThrashing: this.checkLayoutThrashing(element),
            issues: this.findPerformanceIssues(element)
        };
    }

    async analyzePagePerformance() {
        const metrics = {
            loadTimes: this.getLoadTimes(),
            resourceMetrics: this.getResourceMetrics(),
            renderingMetrics: this.getRenderingMetrics(),
            memoryMetrics: this.getMemoryMetrics(),
            issues: []
        };

        // Analyze issues based on metrics
        if (metrics.loadTimes.domContentLoaded > 2000) {
            metrics.issues.push('DOM content loaded time is slow (>2s)');
        }

        if (metrics.resourceMetrics.totalSize > 3000000) { // 3MB
            metrics.issues.push('Total resource size is large (>3MB)');
        }

        metrics.score = this.calculatePerformanceScore(metrics);
        return metrics;
    }

    estimateRenderingCost(element) {
        const styles = window.getComputedStyle(element);
        let cost = 1; // Base cost

        // Expensive properties
        const expensiveProperties = {
            'box-shadow': 2,
            'border-radius': 1.5,
            'filter': 3,
            'transform': 1.5,
            'opacity': 1.2
        };

        Object.entries(expensiveProperties).forEach(([prop, multiplier]) => {
            if (styles[prop] !== 'none' && styles[prop] !== 'initial') {
                cost *= multiplier;
            }
        });

        // Complex selectors increase cost
        if (element.children.length > 20) {
            cost *= 1.5;
        }

        return Math.round(cost * 10) / 10;
    }

    estimateMemoryImpact(element) {
        // Simplified memory estimation
        let impact = 1;
        
        // Element size impact
        const rect = element.getBoundingClientRect();
        const area = rect.width * rect.height;
        impact += area / 10000; // Scale down

        // Children impact
        impact += element.children.length * 0.1;

        // Event listeners (simplified check)
        const eventAttributes = ['onclick', 'onload', 'onchange', 'onsubmit'];
        eventAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                impact += 0.5;
            }
        });

        return Math.round(impact * 10) / 10;
    }

    checkLayoutThrashing(element) {
        const styles = window.getComputedStyle(element);
        const issues = [];

        // Check for properties that cause layout
        const layoutProperties = ['width', 'height', 'padding', 'margin', 'border', 'display', 'position'];
        const animatedStyles = element.style.cssText;

        layoutProperties.forEach(prop => {
            if (animatedStyles.includes(prop)) {
                issues.push(`Animating ${prop} causes layout thrashing`);
            }
        });

        return {
            hasIssues: issues.length > 0,
            issues
        };
    }

    findPerformanceIssues(element) {
        const issues = [];
        const styles = window.getComputedStyle(element);

        // Check for expensive styles
        if (styles.filter !== 'none') {
            issues.push('Element uses CSS filters which can be expensive');
        }

        if (styles.boxShadow !== 'none' && styles.boxShadow.includes('blur')) {
            issues.push('Element uses blurred box-shadow which can impact performance');
        }

        // Check for large elements
        const rect = element.getBoundingClientRect();
        if (rect.width * rect.height > 1000000) { // 1M pixels
            issues.push('Element is very large which may impact rendering');
        }

        // Check for complex structures
        if (element.querySelectorAll('*').length > 100) {
            issues.push('Element contains many child elements (>100)');
        }

        return issues;
    }

    getLoadTimes() {
        if (!performance.navigation) return null;

        const navigation = performance.getEntriesByType('navigation')[0];
        
        return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstByte: navigation.responseStart - navigation.requestStart,
            domInteractive: navigation.domInteractive - navigation.navigationStart
        };
    }

    getResourceMetrics() {
        const resources = performance.getEntriesByType('resource');
        
        const metrics = {
            totalResources: resources.length,
            totalSize: 0,
            byType: {}
        };

        resources.forEach(resource => {
            const size = resource.transferSize || resource.encodedBodySize || 0;
            metrics.totalSize += size;

            const type = this.getResourceType(resource.name);
            if (!metrics.byType[type]) {
                metrics.byType[type] = { count: 0, size: 0 };
            }
            metrics.byType[type].count++;
            metrics.byType[type].size += size;
        });

        return metrics;
    }

    getResourceType(url) {
        if (url.match(/\.(css)$/i)) return 'css';
        if (url.match(/\.(js)$/i)) return 'javascript';
        if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
        return 'other';
    }

    getRenderingMetrics() {
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {};
        paintEntries.forEach(entry => {
            metrics[entry.name] = entry.startTime;
        });

        return metrics;
    }

    getMemoryMetrics() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };
        }
        return null;
    }

    calculatePerformanceScore(metrics) {
        let score = 100;
        
        // Deduct for slow load times
        if (metrics.loadTimes) {
            if (metrics.loadTimes.domContentLoaded > 2000) score -= 20;
            if (metrics.loadTimes.firstByte > 1000) score -= 15;
        }

        // Deduct for large resource sizes
        if (metrics.resourceMetrics.totalSize > 3000000) score -= 20;
        if (metrics.resourceMetrics.totalResources > 100) score -= 10;

        // Deduct for memory usage
        if (metrics.memoryMetrics && metrics.memoryMetrics.percentage > 80) {
            score -= 15;
        }

        return Math.max(score, 0);
    }
}

class SEOModule {
    async analyze(element, options) {
        return {
            headingLevel: this.getHeadingInfo(element),
            textContent: this.analyzeTextContent(element),
            linkAnalysis: this.analyzeLinkSEO(element),
            imageAnalysis: this.analyzeImageSEO(element),
            issues: this.findSEOIssues(element)
        };
    }

    async analyzePage() {
        return await this.performFullSEOAnalysis();
    }

    async performFullSEOAnalysis() {
        const analysis = {
            title: this.analyzeTitleTag(),
            meta: this.analyzeMetaTags(),
            headings: this.analyzeHeadingStructure(),
            content: this.analyzeContent(),
            images: this.analyzeImages(),
            links: this.analyzeLinks(),
            structured: this.analyzeStructuredData(),
            issues: []
        };

        // Compile issues from all sections
        Object.values(analysis).forEach(section => {
            if (section && section.issues) {
                analysis.issues.push(...section.issues);
            }
        });

        analysis.score = this.calculateSEOScore(analysis);
        return analysis;
    }

    getHeadingInfo(element) {
        const tagName = element.tagName.toLowerCase();
        
        if (!tagName.match(/^h[1-6]$/)) {
            return null;
        }

        return {
            level: parseInt(tagName.charAt(1)),
            text: element.textContent.trim(),
            wordCount: element.textContent.trim().split(/\s+/).length,
            isEmpty: !element.textContent.trim()
        };
    }

    analyzeTextContent(element) {
        const text = element.textContent || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        
        return {
            wordCount: words.length,
            characterCount: text.length,
            isEmpty: words.length === 0,
            averageWordLength: words.length > 0 ? 
                words.reduce((sum, word) => sum + word.length, 0) / words.length : 0
        };
    }

    analyzeLinkSEO(element) {
        if (element.tagName.toLowerCase() !== 'a' || !element.href) {
            return null;
        }

        const text = element.textContent.trim();
        const url = new URL(element.href, window.location.origin);
        const isExternal = url.hostname !== window.location.hostname;

        return {
            text,
            href: element.href,
            isExternal,
            hasTitle: !!element.title,
            hasNoFollow: element.rel && element.rel.includes('nofollow'),
            hasNoOpener: element.rel && element.rel.includes('noopener'),
            textLength: text.length,
            isEmpty: !text,
            isGeneric: ['click here', 'read more', 'more', 'here'].includes(text.toLowerCase())
        };
    }

    analyzeImageSEO(element) {
        if (element.tagName.toLowerCase() !== 'img') {
            return null;
        }

        const alt = element.getAttribute('alt');
        const title = element.getAttribute('title');
        const src = element.src;

        return {
            src,
            hasAlt: !!alt,
            altText: alt,
            altLength: alt ? alt.length : 0,
            hasTitle: !!title,
            titleText: title,
            isEmpty: !alt,
            isDecorative: alt === '',
            filename: src ? src.split('/').pop() : null
        };
    }

    findSEOIssues(element) {
        const issues = [];
        const tagName = element.tagName.toLowerCase();

        // Heading issues
        if (tagName.match(/^h[1-6]$/)) {
            if (!element.textContent.trim()) {
                issues.push('Empty heading tag');
            }
            if (element.textContent.length > 70) {
                issues.push('Heading text too long for SEO (>70 chars)');
            }
        }

        // Image issues
        if (tagName === 'img') {
            const imageAnalysis = this.analyzeImageSEO(element);
            if (!imageAnalysis.hasAlt) {
                issues.push('Image missing alt text');
            }
            if (imageAnalysis.altLength > 125) {
                issues.push('Alt text too long (>125 chars)');
            }
        }

        // Link issues
        if (tagName === 'a' && element.href) {
            const linkAnalysis = this.analyzeLinkSEO(element);
            if (linkAnalysis.isEmpty) {
                issues.push('Link has no text content');
            }
            if (linkAnalysis.isGeneric) {
                issues.push('Link uses generic text (not SEO friendly)');
            }
            if (linkAnalysis.isExternal && !linkAnalysis.hasNoOpener) {
                issues.push('External link should use rel="noopener"');
            }
        }

        return issues;
    }

    analyzeTitleTag() {
        const title = document.querySelector('title');
        const titleText = title ? title.textContent : '';

        const issues = [];
        if (!title) {
            issues.push('Missing title tag');
        } else if (!titleText.trim()) {
            issues.push('Title tag is empty');
        } else if (titleText.length < 30) {
            issues.push('Title too short (<30 chars)');
        } else if (titleText.length > 60) {
            issues.push('Title too long (>60 chars)');
        }

        return {
            text: titleText,
            length: titleText.length,
            wordCount: titleText.trim().split(/\s+/).length,
            issues
        };
    }

    analyzeMetaTags() {
        const metaTags = Array.from(document.querySelectorAll('meta'));
        const analysis = {
            description: null,
            keywords: null,
            viewport: null,
            robots: null,
            ogTags: [],
            twitterTags: [],
            issues: []
        };

        metaTags.forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');

            switch (name) {
                case 'description':
                    analysis.description = {
                        content,
                        length: content ? content.length : 0
                    };
                    if (!content) {
                        analysis.issues.push('Meta description is empty');
                    } else if (content.length < 120) {
                        analysis.issues.push('Meta description too short (<120 chars)');
                    } else if (content.length > 160) {
                        analysis.issues.push('Meta description too long (>160 chars)');
                    }
                    break;

                case 'keywords':
                    analysis.keywords = {
                        content,
                        count: content ? content.split(',').length : 0
                    };
                    break;

                case 'viewport':
                    analysis.viewport = { content };
                    break;

                case 'robots':
                    analysis.robots = { content };
                    break;

                default:
                    if (name && name.startsWith('og:')) {
                        analysis.ogTags.push({ name, content });
                    } else if (name && name.startsWith('twitter:')) {
                        analysis.twitterTags.push({ name, content });
                    }
            }
        });

        if (!analysis.description) {
            analysis.issues.push('Missing meta description');
        }

        if (!analysis.viewport) {
            analysis.issues.push('Missing viewport meta tag');
        }

        return analysis;
    }

    analyzeHeadingStructure() {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const structure = [];
        const issues = [];

        if (headings.length === 0) {
            issues.push('No headings found on page');
            return { structure, issues };
        }

        const h1Count = headings.filter(h => h.tagName === 'H1').length;
        if (h1Count === 0) {
            issues.push('No H1 tag found');
        } else if (h1Count > 1) {
            issues.push('Multiple H1 tags found (should be only one)');
        }

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();

            structure.push({
                level,
                tag: heading.tagName.toLowerCase(),
                text: text.substring(0, 100),
                length: text.length,
                isEmpty: !text
            });

            if (!text) {
                issues.push(`Empty ${heading.tagName} heading`);
            }
        });

        return { structure, issues };
    }

    analyzeContent() {
        const body = document.body;
        const textContent = body.textContent || '';
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);

        const analysis = {
            wordCount: words.length,
            characterCount: textContent.length,
            paragraphs: document.querySelectorAll('p').length,
            issues: []
        };

        if (analysis.wordCount < 300) {
            analysis.issues.push('Content too short (<300 words)');
        }

        if (analysis.paragraphs === 0) {
            analysis.issues.push('No paragraph tags found');
        }

        return analysis;
    }

    analyzeImages() {
        const images = Array.from(document.querySelectorAll('img'));
        const analysis = {
            total: images.length,
            withAlt: 0,
            withoutAlt: 0,
            decorative: 0,
            issues: []
        };

        images.forEach(img => {
            const alt = img.getAttribute('alt');
            
            if (alt === null) {
                analysis.withoutAlt++;
                analysis.issues.push(`Image without alt: ${img.src}`);
            } else if (alt === '') {
                analysis.decorative++;
            } else {
                analysis.withAlt++;
                if (alt.length > 125) {
                    analysis.issues.push(`Alt text too long: ${img.src}`);
                }
            }
        });

        return analysis;
    }

    analyzeLinks() {
        const links = Array.from(document.querySelectorAll('a[href]'));
        const analysis = {
            total: links.length,
            internal: 0,
            external: 0,
            nofollow: 0,
            issues: []
        };

        const currentDomain = window.location.hostname;

        links.forEach(link => {
            const url = new URL(link.href, window.location.origin);
            const text = link.textContent.trim();

            if (url.hostname === currentDomain) {
                analysis.internal++;
            } else {
                analysis.external++;
            }

            if (link.rel && link.rel.includes('nofollow')) {
                analysis.nofollow++;
            }

            if (!text && !link.getAttribute('aria-label')) {
                analysis.issues.push('Link without text or aria-label');
            }

            if (['click here', 'read more', 'more'].includes(text.toLowerCase())) {
                analysis.issues.push(`Generic link text: "${text}"`);
            }
        });

        return analysis;
    }

    analyzeStructuredData() {
        const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        const microdata = Array.from(document.querySelectorAll('[itemscope]'));
        const rdfa = Array.from(document.querySelectorAll('[typeof]'));

        return {
            jsonLd: jsonLd.length,
            microdata: microdata.length,
            rdfa: rdfa.length,
            total: jsonLd.length + microdata.length + rdfa.length
        };
    }

    calculateSEOScore(analysis) {
        let score = 100;

        // Title issues
        if (analysis.title.issues.length > 0) {
            score -= analysis.title.issues.length * 10;
        }

        // Meta description issues
        if (analysis.meta.issues.length > 0) {
            score -= analysis.meta.issues.length * 8;
        }

        // Heading issues
        if (analysis.headings.issues.length > 0) {
            score -= analysis.headings.issues.length * 5;
        }

        // Content issues
        if (analysis.content.issues.length > 0) {
            score -= analysis.content.issues.length * 5;
        }

        // Image issues
        if (analysis.images.issues.length > 0) {
            score -= Math.min(analysis.images.issues.length * 3, 20);
        }

        return Math.max(score, 0);
    }
}

class CompatibilityModule {
    async analyze(element, options) {
        return {
            browserSupport: this.checkBrowserSupport(element),
            cssSupport: this.checkCSSSupport(element),
            jsFeatures: this.checkJSFeatures(element),
            issues: this.findCompatibilityIssues(element)
        };
    }

    checkBrowserSupport(element) {
        const tagName = element.tagName.toLowerCase();
        const unsupportedInOlderBrowsers = {
            'picture': 'IE',
            'source': 'IE < 9',
            'video': 'IE < 9',
            'audio': 'IE < 9',
            'canvas': 'IE < 9',
            'svg': 'IE < 9'
        };

        return {
            element: tagName,
            issues: unsupportedInOlderBrowsers[tagName] ? 
                [`Not supported in ${unsupportedInOlderBrowsers[tagName]}`] : []
        };
    }

    checkCSSSupport(element) {
        const computedStyles = window.getComputedStyle(element);
        const modernProperties = [
            'grid-template-columns',
            'flex-direction',
            'clip-path',
            'filter',
            'backdrop-filter',
            'object-fit'
        ];

        const issues = [];
        modernProperties.forEach(prop => {
            const value = computedStyles.getPropertyValue(prop);
            if (value && value !== 'none' && value !== 'initial') {
                // Check if property is supported
                if (!CSS.supports(prop, value)) {
                    issues.push(`CSS property ${prop} may not be supported in all browsers`);
                }
            }
        });

        return { issues };
    }

    checkJSFeatures(element) {
        const issues = [];
        
        // Check for modern JS features in inline handlers
        const eventHandlers = [
            'onclick', 'onload', 'onchange', 'onsubmit', 
            'onkeydown', 'onkeyup', 'onmouseover'
        ];

        eventHandlers.forEach(handler => {
            const code = element.getAttribute(handler);
            if (code) {
                // Simple checks for modern JS features
                if (code.includes('=>')) {
                    issues.push('Arrow functions may not be supported in IE');
                }
                if (code.includes('const ') || code.includes('let ')) {
                    issues.push('const/let keywords may not be supported in older browsers');
                }
                if (code.includes('...')) {
                    issues.push('Spread operator may not be supported in older browsers');
                }
            }
        });

        return { issues };
    }

    findCompatibilityIssues(element) {
        const issues = [];
        
        // Combine all compatibility issues
        const browserIssues = this.checkBrowserSupport(element);
        const cssIssues = this.checkCSSSupport(element);
        const jsIssues = this.checkJSFeatures(element);

        issues.push(...browserIssues.issues);
        issues.push(...cssIssues.issues);
        issues.push(...jsIssues.issues);

        return issues;
    }
}

class PatternModule {
    async analyze(element, options) {
        return {
            designPatterns: this.identifyDesignPatterns(element),
            antiPatterns: this.identifyAntiPatterns(element),
            recommendations: this.generatePatternRecommendations(element),
            issues: this.findPatternIssues(element)
        };
    }

    identifyDesignPatterns(element) {
        const patterns = [];
        const classList = Array.from(element.classList);
        const tagName = element.tagName.toLowerCase();

        // Common UI patterns
        if (classList.some(cls => cls.includes('card'))) {
            patterns.push('Card Pattern');
        }
        if (classList.some(cls => cls.includes('modal'))) {
            patterns.push('Modal Pattern');
        }
        if (classList.some(cls => cls.includes('dropdown'))) {
            patterns.push('Dropdown Pattern');
        }
        if (classList.some(cls => cls.includes('tab'))) {
            patterns.push('Tab Pattern');
        }
        if (classList.some(cls => cls.includes('accordion'))) {
            patterns.push('Accordion Pattern');
        }
        
        // Navigation patterns
        if (tagName === 'nav' || classList.some(cls => cls.includes('nav'))) {
            patterns.push('Navigation Pattern');
        }

        // Form patterns
        if (tagName === 'form') {
            patterns.push('Form Pattern');
        }

        // Grid patterns
        if (classList.some(cls => cls.includes('grid'))) {
            patterns.push('Grid Pattern');
        }

        return patterns;
    }

    identifyAntiPatterns(element) {
        const antiPatterns = [];
        const styles = window.getComputedStyle(element);

        // CSS anti-patterns
        if (styles.fontSize && parseFloat(styles.fontSize) < 12) {
            antiPatterns.push('Font too small for readability');
        }

        if (styles.color === styles.backgroundColor) {
            antiPatterns.push('Text and background same color');
        }

        // Inline styles anti-pattern
        if (element.style.cssText) {
            antiPatterns.push('Inline styles should be avoided');
        }

        // Empty elements
        if (!element.textContent.trim() && element.children.length === 0 && 
            !['img', 'br', 'hr', 'input'].includes(element.tagName.toLowerCase())) {
            antiPatterns.push('Empty element without content or children');
        }

        return antiPatterns;
    }

    generatePatternRecommendations(element) {
        const recommendations = [];
        const tagName = element.tagName.toLowerCase();
        const classList = Array.from(element.classList);

        // Semantic HTML recommendations
        if (element.getAttribute('role') === 'button' && tagName !== 'button') {
            recommendations.push('Consider using <button> element instead of role="button"');
        }

        if (classList.some(cls => cls.includes('btn')) && tagName !== 'button') {
            recommendations.push('Button-styled elements should use <button> tag');
        }

        // Accessibility recommendations
        if (tagName === 'div' && element.getAttribute('onclick')) {
            recommendations.push('Interactive divs should be buttons or links');
        }

        return recommendations;
    }

    findPatternIssues(element) {
        const issues = [];
        
        // Combine anti-patterns as issues
        const antiPatterns = this.identifyAntiPatterns(element);
        issues.push(...antiPatterns);

        return issues;
    }
}

// Initialize the DOM Analysis Engine
const domAnalysisEngine = new DOMAnalysisEngine();

// Expose to global scope for integration
window.domAnalysisEngine = domAnalysisEngine;

// Register with element inspector if available
if (window.elementInspector) {
    window.elementInspector.setDOMAnalysisEngine(domAnalysisEngine);
}

// Register with AI chat integration if available
if (window.aiChatIntegration) {
    window.aiChatIntegration.setDOMAnalysisEngine(domAnalysisEngine);
}

console.log('🔬 DOM Analysis Engine loaded with comprehensive analysis capabilities');