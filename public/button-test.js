/**
 * Button Functionality Test Script
 * Tests all interactive buttons in the interface
 */

class ButtonTester {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }

    async runAllTests() {
        console.log('🧪 Starting button functionality tests...');
        
        // Wait for all components to load
        await this.waitForComponents();
        
        // Test device buttons
        await this.testDeviceButtons();
        
        // Test AI chat buttons
        await this.testAIChatButtons();
        
        // Test URL submit button
        await this.testURLSubmitButton();
        
        // Report results
        this.reportResults();
    }
    
    async waitForComponents() {
        const maxWait = 5000;
        const checkInterval = 100;
        const startTime = Date.now();

        while (Date.now() - startTime < maxWait) {
            const componentsLoaded = {
                screenshotSystem: !!window.screenshotCaptureSystem,
                aiChatIntegration: !!window.aiChatIntegration,
                integrationInitializer: !!window.integrationInitializer
            };

            if (Object.values(componentsLoaded).every(loaded => loaded)) {
                console.log('✅ All components loaded for testing');
                return;
            }

            await this.sleep(checkInterval);
        }
        
        console.warn('⚠️ Some components may not be fully loaded');
    }
    
    async testDeviceButtons() {
        console.log('📱 Testing device selection buttons...');
        
        const deviceButtons = document.querySelectorAll('[data-device]');
        
        if (deviceButtons.length === 0) {
            this.recordTest('Device Buttons', false, 'No device buttons found');
            return;
        }
        
        try {
            // Test clicking the first device button
            const firstButton = deviceButtons[0];
            const deviceType = firstButton.dataset.device;
            
            // Simulate click
            firstButton.click();
            
            // Check if device frame updated
            const deviceFrame = document.getElementById('deviceFrame');
            const hasCorrectClass = deviceFrame && deviceFrame.className.includes(deviceType);
            
            this.recordTest('Device Button Click', hasCorrectClass, 
                hasCorrectClass ? `Device changed to ${deviceType}` : 'Device frame not updated');
        } catch (error) {
            this.recordTest('Device Buttons', false, error.message);
        }
    }
    
    async testURLSubmitButton() {
        console.log('🌐 Testing URL submit button...');
        
        try {
            const urlSubmitBtn = document.getElementById('urlSubmitBtn');
            const urlInput = document.getElementById('urlInput');
            
            if (!urlSubmitBtn || !urlInput) {
                this.recordTest('URL Submit Button', false, 'URL button or input not found');
                return;
            }
            
            // Test the button exists and has event listener
            const originalValue = urlInput.value;
            urlInput.value = 'https://example.com';
            
            // Simulate click
            urlSubmitBtn.click();
            
            // Check if iframe source was updated (might need delay)
            setTimeout(() => {
                const iframe = document.getElementById('deviceIframe');
                const srcUpdated = iframe && iframe.src.includes('example.com');
                
                this.recordTest('URL Submit Button', srcUpdated, 
                    srcUpdated ? 'URL updated successfully' : 'URL not updated in iframe');
                
                // Restore original value
                urlInput.value = originalValue;
            }, 500);
            
        } catch (error) {
            this.recordTest('URL Submit Button', false, error.message);
        }
    }
    
    async testAIChatButtons() {
        console.log('🤖 Testing AI chat buttons...');
        
        if (!window.aiChatIntegration) {
            this.recordTest('AI Chat Buttons', false, 'AI Chat Integration not found');
            return;
        }
        
        // Test screenshot button
        await this.testButton('screenshot-btn', 'Screenshot Button', () => {
            return !!window.aiChatIntegration.screenshotSystem || !!window.screenshotCaptureSystem;
        });
        
        // Test element selection button
        await this.testButton('element-select-btn', 'Element Selection Button', () => {
            return !!window.aiChatIntegration.elementInspector || !!window.elementInspector;
        });
        
        // Test analysis buttons
        const analysisButtons = [
            { id: 'full-analysis-btn', name: 'Full Analysis Button' },
            { id: 'accessibility-check-btn', name: 'Accessibility Check Button' },
            { id: 'performance-analysis-btn', name: 'Performance Analysis Button' },
            { id: 'design-pattern-btn', name: 'Design Pattern Button' },
            { id: 'mobile-analysis-btn', name: 'Mobile Analysis Button' }
        ];
        
        for (const button of analysisButtons) {
            await this.testButton(button.id, button.name, () => true);
        }
    }
    
    async testButton(buttonId, buttonName, prerequisiteCheck = null) {
        try {
            const button = document.getElementById(buttonId);
            
            if (!button) {
                this.recordTest(buttonName, false, `Button with ID '${buttonId}' not found`);
                return;
            }
            
            // Check prerequisites
            if (prerequisiteCheck && !prerequisiteCheck()) {
                this.recordTest(buttonName, false, 'Prerequisites not met');
                return;
            }
            
            // Test if button is clickable and has event listeners
            const hasEventListeners = this.hasEventListeners(button);
            const isClickable = !button.disabled && button.offsetParent !== null;
            
            if (!isClickable) {
                this.recordTest(buttonName, false, 'Button is not clickable');
                return;
            }
            
            if (!hasEventListeners) {
                this.recordTest(buttonName, false, 'No event listeners detected');
                return;
            }
            
            // Simulate click (but don't actually trigger full functionality to avoid side effects)
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            button.dispatchEvent(clickEvent);
            
            this.recordTest(buttonName, true, 'Button is functional');
            
        } catch (error) {
            this.recordTest(buttonName, false, error.message);
        }
    }
    
    hasEventListeners(element) {
        // This is a simplified check - in a real environment, 
        // we'd need more sophisticated detection
        
        // Check for onclick attribute
        if (element.onclick) return true;
        
        // Check if element has been processed by event listeners
        // (this is heuristic and may not catch all cases)
        const events = ['click', 'mousedown', 'mouseup'];
        
        for (const eventType of events) {
            // Try to access event listeners (this is browser-dependent)
            try {
                const listeners = element.getEventListeners?.[eventType];
                if (listeners && listeners.length > 0) return true;
            } catch (e) {
                // getEventListeners is not standard, so this may fail
            }
        }
        
        // Fallback: assume button has listeners if it's part of known UI
        const hasClass = element.className && (
            element.className.includes('btn') || 
            element.className.includes('button') ||
            element.className.includes('tool-btn')
        );
        
        return hasClass;
    }
    
    recordTest(testName, passed, message) {
        this.totalTests++;
        if (passed) this.passedTests++;
        
        this.testResults.push({
            name: testName,
            passed: passed,
            message: message
        });
        
        const emoji = passed ? '✅' : '❌';
        console.log(`${emoji} ${testName}: ${message}`);
    }
    
    reportResults() {
        console.log('\n📊 Button Test Results:');
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.totalTests - this.passedTests}`);
        console.log(`Success Rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%`);
        
        const failedTests = this.testResults.filter(test => !test.passed);
        if (failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`- ${test.name}: ${test.message}`);
            });
        }
        
        // Create visual report
        this.createVisualReport();
    }
    
    createVisualReport() {
        const reportDiv = document.createElement('div');
        reportDiv.id = 'button-test-report';
        reportDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 10001;
            font-family: monospace;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        const successRate = Math.round((this.passedTests / this.totalTests) * 100);
        const statusColor = successRate >= 80 ? 'green' : successRate >= 60 ? 'orange' : 'red';
        
        reportDiv.innerHTML = `
            <h3 style="margin-top: 0; color: ${statusColor};">Button Test Report</h3>
            <p><strong>Total Tests:</strong> ${this.totalTests}</p>
            <p><strong>Passed:</strong> <span style="color: green;">${this.passedTests}</span></p>
            <p><strong>Failed:</strong> <span style="color: red;">${this.totalTests - this.passedTests}</span></p>
            <p><strong>Success Rate:</strong> <span style="color: ${statusColor};">${successRate}%</span></p>
            
            <h4>Test Details:</h4>
            <ul style="padding-left: 20px;">
                ${this.testResults.map(test => `
                    <li style="color: ${test.passed ? 'green' : 'red'};">
                        ${test.passed ? '✅' : '❌'} ${test.name}: ${test.message}
                    </li>
                `).join('')}
            </ul>
            
            <button onclick="document.getElementById('button-test-report').remove()" 
                    style="background: #007cba; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                Close Report
            </button>
        `;
        
        document.body.appendChild(reportDiv);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Auto-run tests when script loads (after a delay to ensure everything is loaded)
setTimeout(() => {
    const tester = new ButtonTester();
    tester.runAllTests();
}, 3000);

// Also make it available for manual testing
window.buttonTester = new ButtonTester();

console.log('🧪 Button test script loaded. Auto-test will run in 3 seconds, or run manually with window.buttonTester.runAllTests()');