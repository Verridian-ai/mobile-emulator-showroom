/**
 * AI Prompt Templates for Computer Vision Analysis
 * Specialized prompts for different types of UI/UX analysis
 */

class AIPromptTemplates {
    constructor() {
        this.templates = {
            fullPageAnalysis: this.createFullPageAnalysisTemplate(),
            elementAnalysis: this.createElementAnalysisTemplate(),
            accessibilityAnalysis: this.createAccessibilityAnalysisTemplate(),
            performanceAnalysis: this.createPerformanceAnalysisTemplate(),
            designPatternAnalysis: this.createDesignPatternAnalysisTemplate(),
            mobileResponsivenessAnalysis: this.createMobileResponsivenessTemplate(),
            colorSchemeAnalysis: this.createColorSchemeAnalysisTemplate(),
            typographyAnalysis: this.createTypographyAnalysisTemplate(),
            layoutAnalysis: this.createLayoutAnalysisTemplate(),
            usabilityAnalysis: this.createUsabilityAnalysisTemplate()
        };
    }

    getFullPageAnalysisPrompt(context = {}) {
        const basePrompt = this.templates.fullPageAnalysis;
        const contextInfo = this.buildContextInfo(context);
        
        return `${basePrompt}

${contextInfo}

Please provide a comprehensive analysis covering:
1. Overall UI/UX quality and user experience
2. Visual hierarchy and information architecture
3. Accessibility compliance and potential issues
4. Design consistency and brand alignment
5. Mobile responsiveness indicators
6. Performance optimization opportunities
7. Actionable improvement recommendations

Format your response with clear sections and specific, actionable suggestions.`;
    }

    getElementAnalysisPrompt(elementInfo, context = {}) {
        const basePrompt = this.templates.elementAnalysis;
        const elementContext = this.buildElementContext(elementInfo);
        const contextInfo = this.buildContextInfo(context);
        
        return `${basePrompt}

${elementContext}
${contextInfo}

Focus your analysis on:
1. Element functionality and usability
2. Visual design and styling
3. Accessibility compliance for this element
4. Integration with surrounding elements
5. Mobile compatibility
6. Specific improvement recommendations

Provide detailed, actionable feedback for this specific element.`;
    }

    getAccessibilityAnalysisPrompt(accessibilityData = {}) {
        const basePrompt = this.templates.accessibilityAnalysis;
        const dataContext = this.buildAccessibilityDataContext(accessibilityData);
        
        return `${basePrompt}

${dataContext}

Analyze this interface for accessibility compliance focusing on:
1. WCAG 2.1 AA compliance level
2. Keyboard navigation support
3. Screen reader compatibility
4. Color contrast and visibility
5. Focus management
6. Alternative text and labeling
7. Semantic HTML structure
8. Interactive element accessibility

Provide specific recommendations with priority levels (High/Medium/Low) and implementation guidance.`;
    }

    getPerformanceAnalysisPrompt(performanceData = {}) {
        const basePrompt = this.templates.performanceAnalysis;
        const perfContext = this.buildPerformanceDataContext(performanceData);
        
        return `${basePrompt}

${perfContext}

Analyze the visual interface for performance indicators and optimization opportunities:
1. Loading states and performance feedback
2. Visual complexity and rendering implications
3. Image optimization opportunities
4. Layout shift potential
5. Resource loading indicators
6. User feedback during loading states
7. Perceived performance factors

Provide actionable recommendations to improve both actual and perceived performance.`;
    }

    getDesignPatternAnalysisPrompt(designData = {}) {
        const basePrompt = this.templates.designPatternAnalysis;
        const designContext = this.buildDesignDataContext(designData);
        
        return `${basePrompt}

${designContext}

Analyze the design patterns and consistency:
1. Common UI patterns and their implementation
2. Design system consistency
3. Component reusability
4. Visual consistency across elements
5. Modern design pattern adoption
6. User expectation alignment
7. Brand consistency

Identify patterns that work well and suggest improvements for inconsistencies.`;
    }

    getMobileResponsivenessAnalysisPrompt(viewport = {}) {
        const basePrompt = this.templates.mobileResponsivenessAnalysis;
        const viewportContext = this.buildViewportContext(viewport);
        
        return `${basePrompt}

${viewportContext}

Analyze mobile responsiveness and touch-friendly design:
1. Layout adaptation for mobile screens
2. Touch target sizes and spacing
3. Text readability on mobile
4. Navigation usability on mobile
5. Content prioritization for smaller screens
6. Gesture support and interactions
7. Mobile-specific UI patterns

Provide specific recommendations for improving mobile user experience.`;
    }

    getAnalysisPromptByTypes(analysisTypes) {
        const prompts = [];
        
        if (analysisTypes.includes('ui_ux')) {
            prompts.push(this.templates.fullPageAnalysis);
        }
        if (analysisTypes.includes('accessibility')) {
            prompts.push(this.templates.accessibilityAnalysis);
        }
        if (analysisTypes.includes('performance')) {
            prompts.push(this.templates.performanceAnalysis);
        }
        if (analysisTypes.includes('design_consistency')) {
            prompts.push(this.templates.designPatternAnalysis);
        }
        if (analysisTypes.includes('mobile_responsiveness')) {
            prompts.push(this.templates.mobileResponsivenessAnalysis);
        }
        
        return prompts.join('\n\n---\n\n');
    }

    // Template Creation Methods
    createFullPageAnalysisTemplate() {
        return `As an expert UX/UI designer and accessibility specialist, analyze this screenshot of a web interface. 

Examine the visual design, layout, user experience, and overall quality. Look for both strengths and areas for improvement.

Key areas to evaluate:
- Visual hierarchy and information architecture
- Color usage and contrast
- Typography and readability
- Layout and spacing
- Navigation and user flow
- Interactive elements and their design
- Accessibility considerations
- Mobile-friendliness indicators
- Brand consistency and professional appearance
- User engagement and conversion potential`;
    }

    createElementAnalysisTemplate() {
        return `As an expert UX/UI designer, analyze this specific UI element in the context of the overall interface.

Focus on this element's design, functionality, and integration with the surrounding interface. Consider both visual and functional aspects.

Evaluation criteria:
- Element purpose and functionality clarity
- Visual design and styling quality
- Size, spacing, and positioning
- Color and contrast appropriateness
- Typography and text treatment
- Accessibility of this specific element
- User interaction patterns
- Integration with overall design system`;
    }

    createAccessibilityAnalysisTemplate() {
        return `As an accessibility expert specializing in WCAG compliance, thoroughly analyze this interface for accessibility issues and compliance.

Identify potential barriers for users with disabilities and provide specific remediation guidance.

Focus areas:
- Color contrast and visual accessibility
- Text readability and font sizing
- Navigation and keyboard accessibility
- Interactive element identification
- Alternative text and labeling
- Form accessibility
- Focus indicators and management
- Screen reader compatibility
- Semantic structure and landmarks`;
    }

    createPerformanceAnalysisTemplate() {
        return `As a web performance expert, analyze this interface for visual performance indicators and optimization opportunities.

Look for elements that may impact loading performance, rendering efficiency, and perceived performance.

Performance considerations:
- Visual complexity and rendering cost
- Image usage and optimization opportunities
- Layout efficiency and potential layout shifts
- Loading states and performance feedback
- Resource loading indicators
- Critical rendering path elements
- Above-the-fold optimization
- User feedback during loading states`;
    }

    createDesignPatternAnalysisTemplate() {
        return `As a design systems expert, analyze this interface for design patterns, consistency, and adherence to modern UI conventions.

Identify design patterns in use and evaluate their effectiveness and consistency.

Pattern analysis focus:
- Common UI patterns and their implementation
- Design system consistency across elements
- Component design and reusability
- Modern design pattern adoption
- User expectation alignment
- Visual consistency and cohesion
- Pattern accessibility and usability
- Brand pattern integration`;
    }

    createMobileResponsivenessTemplate() {
        return `As a mobile UX specialist, analyze this interface for mobile responsiveness and touch-friendly design.

Evaluate how well this interface would work on mobile devices and touch interactions.

Mobile analysis criteria:
- Layout adaptation for mobile screens
- Touch target sizes and accessibility
- Text readability on small screens
- Navigation usability on mobile
- Content hierarchy for mobile consumption
- Gesture-friendly interactions
- Mobile-specific UI patterns usage
- Thumb-friendly zone utilization`;
    }

    createColorSchemeAnalysisTemplate() {
        return `As a color theory and accessibility expert, analyze the color usage in this interface.

Evaluate color choices for both aesthetic and functional effectiveness.

Color analysis focus:
- Color harmony and aesthetic appeal
- Brand color integration
- Contrast ratios and accessibility
- Color psychology and user perception
- Color coding and meaning clarity
- Visual hierarchy through color
- Cultural color considerations
- Color blindness accessibility`;
    }

    createTypographyAnalysisTemplate() {
        return `As a typography expert, analyze the text treatment and typographic hierarchy in this interface.

Evaluate font choices, sizing, spacing, and overall text presentation.

Typography evaluation:
- Font selection and appropriateness
- Typographic hierarchy and clarity
- Text readability and legibility
- Line spacing and text density
- Responsive typography considerations
- Brand typography alignment
- Accessibility of text treatment
- Text-to-UI element relationships`;
    }

    createLayoutAnalysisTemplate() {
        return `As a layout and information architecture expert, analyze the spatial organization and structure of this interface.

Evaluate how content is organized and presented to users.

Layout analysis focus:
- Grid systems and alignment
- White space usage and breathing room
- Content organization and grouping
- Visual flow and scanning patterns
- Information hierarchy
- Layout responsiveness indicators
- Component spacing consistency
- Visual weight distribution`;
    }

    createUsabilityAnalysisTemplate() {
        return `As a usability expert, analyze this interface for user experience quality and ease of use.

Focus on how users would interact with and navigate this interface.

Usability considerations:
- Navigation clarity and findability
- Task flow efficiency
- Error prevention and handling
- User feedback and confirmation
- Cognitive load and complexity
- User control and flexibility
- Recognition vs recall principles
- Consistency and standards adherence`;
    }

    // Context Building Methods
    buildContextInfo(context) {
        if (!context || Object.keys(context).length === 0) return '';
        
        let contextString = 'CONTEXT INFORMATION:\n';
        
        if (context.url) {
            contextString += `URL: ${context.url}\n`;
        }
        if (context.viewport) {
            contextString += `Viewport: ${context.viewport.width}x${context.viewport.height}\n`;
        }
        if (context.device) {
            contextString += `Device: ${context.device.type || 'desktop'}\n`;
        }
        if (context.userAgent) {
            contextString += `Browser: ${this.extractBrowserInfo(context.userAgent)}\n`;
        }
        
        return contextString;
    }

    buildElementContext(elementInfo) {
        if (!elementInfo) return '';
        
        let elementString = 'ELEMENT DETAILS:\n';
        elementString += `Tag: ${elementInfo.tagName}\n`;
        
        if (elementInfo.id) {
            elementString += `ID: ${elementInfo.id}\n`;
        }
        if (elementInfo.className) {
            elementString += `Classes: ${elementInfo.className}\n`;
        }
        if (elementInfo.textContent) {
            elementString += `Text: ${elementInfo.textContent}\n`;
        }
        if (elementInfo.bounds) {
            elementString += `Size: ${elementInfo.bounds.width}x${elementInfo.bounds.height}\n`;
        }
        
        return elementString;
    }

    buildAccessibilityDataContext(accessibilityData) {
        if (!accessibilityData || Object.keys(accessibilityData).length === 0) return '';
        
        let dataString = 'ACCESSIBILITY DATA:\n';
        
        if (accessibilityData.headingStructure) {
            dataString += `Headings: ${accessibilityData.headingStructure.count} total, `;
            dataString += `H1 present: ${accessibilityData.headingStructure.hasH1}\n`;
        }
        if (accessibilityData.altTexts) {
            const totalImages = accessibilityData.altTexts.length;
            const withAlt = accessibilityData.altTexts.filter(img => img.hasAlt).length;
            dataString += `Images: ${totalImages} total, ${withAlt} with alt text\n`;
        }
        if (accessibilityData.formLabels) {
            const totalInputs = accessibilityData.formLabels.length;
            const withLabels = accessibilityData.formLabels.filter(input => input.hasLabel).length;
            dataString += `Form inputs: ${totalInputs} total, ${withLabels} properly labeled\n`;
        }
        
        return dataString;
    }

    buildPerformanceDataContext(performanceData) {
        if (!performanceData || Object.keys(performanceData).length === 0) return '';
        
        let perfString = 'PERFORMANCE DATA:\n';
        
        if (performanceData.loadTiming) {
            if (performanceData.loadTiming.domContentLoaded) {
                perfString += `DOM Content Loaded: ${Math.round(performanceData.loadTiming.domContentLoaded)}ms\n`;
            }
            if (performanceData.loadTiming.firstContentfulPaint) {
                perfString += `First Contentful Paint: ${Math.round(performanceData.loadTiming.firstContentfulPaint)}ms\n`;
            }
        }
        
        if (performanceData.resources) {
            perfString += `Resources: ${performanceData.resources.totalCount} total\n`;
        }
        
        if (performanceData.renderingMetrics) {
            perfString += `DOM Elements: ${performanceData.renderingMetrics.domElements}\n`;
            perfString += `Images: ${performanceData.renderingMetrics.imagesCount}\n`;
        }
        
        return perfString;
    }

    buildDesignDataContext(designData) {
        if (!designData || Object.keys(designData).length === 0) return '';
        
        let designString = 'DESIGN PATTERN DATA:\n';
        
        if (designData.colorScheme) {
            designString += `Colors: ${designData.colorScheme.colorCount} unique colors\n`;
        }
        if (designData.typography) {
            designString += `Fonts: ${designData.typography.fontFamilyCount} font families, `;
            designString += `${designData.typography.fontSizeCount} font sizes\n`;
        }
        if (designData.componentPatterns) {
            designString += `UI Components: ${designData.componentPatterns.buttons} buttons, `;
            designString += `${designData.componentPatterns.forms} forms, `;
            designString += `${designData.componentPatterns.navigation} navigation elements\n`;
        }
        
        return designString;
    }

    buildViewportContext(viewport) {
        if (!viewport) return '';
        
        let viewportString = 'VIEWPORT INFORMATION:\n';
        viewportString += `Size: ${viewport.width}x${viewport.height}\n`;
        viewportString += `Device Pixel Ratio: ${viewport.devicePixelRatio || 1}\n`;
        
        if (viewport.orientation) {
            viewportString += `Orientation: ${viewport.orientation}\n`;
        }
        
        // Determine device category
        if (viewport.width <= 480) {
            viewportString += 'Device Category: Mobile Phone\n';
        } else if (viewport.width <= 768) {
            viewportString += 'Device Category: Tablet Portrait\n';
        } else if (viewport.width <= 1024) {
            viewportString += 'Device Category: Tablet Landscape / Small Laptop\n';
        } else {
            viewportString += 'Device Category: Desktop\n';
        }
        
        return viewportString;
    }

    extractBrowserInfo(userAgent) {
        if (!userAgent) return 'Unknown';
        
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        
        return 'Unknown';
    }

    // Custom Prompt Builder
    buildCustomPrompt(analysisType, context = {}, customInstructions = '') {
        let basePrompt = this.templates[analysisType] || this.templates.fullPageAnalysis;
        let contextInfo = this.buildContextInfo(context);
        
        let prompt = `${basePrompt}\n\n${contextInfo}`;
        
        if (customInstructions) {
            prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${customInstructions}`;
        }
        
        return prompt;
    }

    // Prompt Validation
    validatePrompt(prompt) {
        if (!prompt || typeof prompt !== 'string') {
            return { isValid: false, error: 'Prompt must be a non-empty string' };
        }
        
        if (prompt.length < 50) {
            return { isValid: false, error: 'Prompt too short for meaningful analysis' };
        }
        
        if (prompt.length > 4000) {
            return { isValid: false, error: 'Prompt too long, may exceed API limits' };
        }
        
        return { isValid: true };
    }

    // Get available analysis types
    getAvailableAnalysisTypes() {
        return [
            { key: 'ui_ux', name: 'UI/UX Analysis', description: 'Overall user interface and experience evaluation' },
            { key: 'accessibility', name: 'Accessibility Analysis', description: 'WCAG compliance and accessibility assessment' },
            { key: 'performance', name: 'Performance Analysis', description: 'Visual performance indicators and optimization' },
            { key: 'design_consistency', name: 'Design Pattern Analysis', description: 'Design system consistency and patterns' },
            { key: 'mobile_responsiveness', name: 'Mobile Analysis', description: 'Mobile responsiveness and touch-friendly design' },
            { key: 'color_scheme', name: 'Color Analysis', description: 'Color usage, harmony, and accessibility' },
            { key: 'typography', name: 'Typography Analysis', description: 'Font usage, hierarchy, and readability' },
            { key: 'layout', name: 'Layout Analysis', description: 'Spatial organization and information architecture' },
            { key: 'usability', name: 'Usability Analysis', description: 'User experience and ease of use evaluation' }
        ];
    }
}

// Initialize AI Prompt Templates
window.AIPromptTemplates = AIPromptTemplates;

console.log('🤖 AI Prompt Templates initialized for computer vision analysis');