/**
 * IDE Integration Module for Mobile Emulator Platform
 * Article V: Security - Sanitize all data before sending to IDE
 * Article I: Architecture - Clean abstraction for multiple IDEs
 * Article IV: UX - Seamless IDE communication
 */

class IDEIntegration {
    constructor() {
        this.detectedIDE = null;
        this.preferredIDE = null;
        this.connectionStatus = 'disconnected';
        this.capabilities = {
            claudeCode: false,
            vsCode: false,
            cursor: false,
            filesystem: false
        };

        // Load user preferences
        this.loadPreferences();

        // Detect available IDEs
        this.detectIDEs();
    }

    /**
     * Detect available IDE integrations
     * Article I: Architecture - Extensible IDE detection
     */
    detectIDEs() {
        console.log('Detecting available IDEs...');

        // Check for Claude Code
        if (typeof window.CLAUDE_CODE_API !== 'undefined') {
            this.capabilities.claudeCode = true;
            this.detectedIDE = 'claudeCode';
            console.log('✓ Claude Code API detected');
        }

        // Check for VS Code
        if (typeof window.acquireVsCodeApi !== 'undefined') {
            this.capabilities.vsCode = true;
            this.detectedIDE = this.detectedIDE || 'vsCode';
            console.log('✓ VS Code API detected');
        }

        // Check for Cursor (similar to VS Code)
        if (window.location.href.includes('cursor://')) {
            this.capabilities.cursor = true;
            this.detectedIDE = this.detectedIDE || 'cursor';
            console.log('✓ Cursor detected');
        }

        // Check for File System Access API (fallback)
        if ('showSaveFilePicker' in window) {
            this.capabilities.filesystem = true;
            console.log('✓ File System Access API available (fallback)');
        }

        // Update connection status
        if (this.detectedIDE) {
            this.connectionStatus = 'connected';
        } else if (this.capabilities.filesystem) {
            this.connectionStatus = 'fallback';
        }

        console.log('IDE Detection Results:', {
            detected: this.detectedIDE,
            capabilities: this.capabilities,
            status: this.connectionStatus
        });
    }

    /**
     * Load user preferences from localStorage
     * Article IV: UX - Remember user settings
     */
    loadPreferences() {
        try {
            const prefs = localStorage.getItem('idePreferences');
            if (prefs) {
                const parsed = JSON.parse(prefs);
                this.preferredIDE = parsed.preferredIDE || null;
            }
        } catch (error) {
            console.error('Failed to load IDE preferences:', error);
        }
    }

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('idePreferences', JSON.stringify({
                preferredIDE: this.preferredIDE
            }));
        } catch (error) {
            console.error('Failed to save IDE preferences:', error);
        }
    }

    /**
     * Set preferred IDE
     * Article IV: UX - User choice
     */
    setPreferredIDE(ide) {
        if (this.capabilities[ide]) {
            this.preferredIDE = ide;
            this.savePreferences();
            console.log('Preferred IDE set to:', ide);
            return true;
        } else {
            console.warn('IDE not available:', ide);
            return false;
        }
    }

    /**
     * Send screenshot to IDE
     * Article V: Security - Sanitize all data before sending
     */
    async sendScreenshotToIDE(screenshot) {
        const targetIDE = this.preferredIDE || this.detectedIDE;

        if (!targetIDE && !this.capabilities.filesystem) {
            throw new Error('No IDE integration available');
        }

        // Prepare context data
        const context = this.prepareContext(screenshot);

        try {
            switch (targetIDE) {
                case 'claudeCode':
                    return await this.sendToClaudeCode(screenshot, context);
                case 'vsCode':
                    return await this.sendToVSCode(screenshot, context);
                case 'cursor':
                    return await this.sendToCursor(screenshot, context);
                default:
                    return await this.saveToFileSystem(screenshot, context);
            }
        } catch (error) {
            console.error('Failed to send to IDE:', error);
            // Fallback to filesystem
            return await this.saveToFileSystem(screenshot, context);
        }
    }

    /**
     * Prepare context data for IDE
     * Article V: Security - Sanitize all context data
     */
    prepareContext(screenshot) {
        const metadata = screenshot.metadata || {};

        return {
            device: this.sanitize(metadata.device || 'unknown'),
            url: this.sanitize(metadata.url || 'about:blank'),
            timestamp: metadata.timestamp || new Date().toISOString(),
            viewport: metadata.viewport || {},
            captureType: this.sanitize(screenshot.captureType || 'unknown'),
            userAgent: navigator.userAgent,
            consoleErrors: screenshot.consoleErrors || [],
            errorContext: screenshot.errorContext || null
        };
    }

    /**
     * Sanitize data for security
     * Article V: Security - XSS prevention
     */
    sanitize(value) {
        if (typeof value !== 'string') {
            return String(value);
        }
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    /**
     * Send to Claude Code
     * Article I: Architecture - Claude Code specific implementation
     */
    async sendToClaudeCode(screenshot, context) {
        try {
            // Check if Claude Code API is available
            if (typeof window.CLAUDE_CODE_API === 'undefined') {
                throw new Error('Claude Code API not available');
            }

            // Use Claude Code API to send screenshot with context
            const result = await window.CLAUDE_CODE_API.sendScreenshot({
                image: screenshot.dataUrl,
                context: context,
                message: this.formatContextMessage(context)
            });

            console.log('Screenshot sent to Claude Code successfully');
            return { success: true, method: 'claudeCode', result };
        } catch (error) {
            console.error('Failed to send to Claude Code:', error);
            throw error;
        }
    }

    /**
     * Send to VS Code
     * Article I: Architecture - VS Code specific implementation
     */
    async sendToVSCode(screenshot, context) {
        try {
            const vscode = window.acquireVsCodeApi();

            vscode.postMessage({
                command: 'screenshot',
                data: {
                    image: screenshot.dataUrl,
                    context: context,
                    message: this.formatContextMessage(context)
                }
            });

            console.log('Screenshot sent to VS Code successfully');
            return { success: true, method: 'vsCode' };
        } catch (error) {
            console.error('Failed to send to VS Code:', error);
            throw error;
        }
    }

    /**
     * Send to Cursor
     * Article I: Architecture - Cursor specific implementation
     */
    async sendToCursor(screenshot, context) {
        // Cursor uses similar API to VS Code
        return await this.sendToVSCode(screenshot, context);
    }

    /**
     * Save to filesystem (fallback)
     * Article I: Architecture - Filesystem fallback for all IDEs
     */
    async saveToFileSystem(screenshot, context) {
        try {
            // Convert data URL to blob
            const blob = await this.dataUrlToBlob(screenshot.dataUrl);

            // Generate filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const device = context.device.replace(/\s+/g, '-');
            const filename = `screenshot-${device}-${timestamp}.png`;

            // Check if File System Access API is available
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'PNG Image',
                        accept: { 'image/png': ['.png'] }
                    }]
                });

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                // Also save context as JSON
                const contextFilename = filename.replace('.png', '-context.json');
                const contextHandle = await window.showSaveFilePicker({
                    suggestedName: contextFilename,
                    types: [{
                        description: 'JSON',
                        accept: { 'application/json': ['.json'] }
                    }]
                });

                const contextWritable = await contextHandle.createWritable();
                await contextWritable.write(JSON.stringify(context, null, 2));
                await contextWritable.close();

                console.log('Screenshot saved to filesystem successfully');
                return { success: true, method: 'filesystem', filename };
            } else {
                // Fallback to download link
                const link = document.createElement('a');
                link.href = screenshot.dataUrl;
                link.download = filename;
                link.click();

                // Download context as well
                const contextBlob = new Blob([JSON.stringify(context, null, 2)], {
                    type: 'application/json'
                });
                const contextUrl = URL.createObjectURL(contextBlob);
                const contextLink = document.createElement('a');
                contextLink.href = contextUrl;
                contextLink.download = filename.replace('.png', '-context.json');
                contextLink.click();

                URL.revokeObjectURL(contextUrl);

                console.log('Screenshot downloaded successfully');
                return { success: true, method: 'download', filename };
            }
        } catch (error) {
            console.error('Failed to save to filesystem:', error);
            throw error;
        }
    }

    /**
     * Convert data URL to Blob
     * Article II: Performance - Efficient blob conversion
     */
    async dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return await response.blob();
    }

    /**
     * Format context message for IDE
     * Article IV: UX - Clear, readable context
     */
    formatContextMessage(context) {
        let message = `# Mobile Emulator Screenshot\n\n`;
        message += `**Device:** ${context.device}\n`;
        message += `**URL:** ${context.url}\n`;
        message += `**Timestamp:** ${context.timestamp}\n`;
        message += `**Capture Type:** ${context.captureType}\n`;
        message += `**Viewport:** ${context.viewport.width}x${context.viewport.height}\n\n`;

        if (context.errorContext) {
            message += `## Error Context\n\n`;
            message += `**Type:** ${context.errorContext.type}\n`;
            message += `**Message:** ${context.errorContext.message}\n`;
            if (context.errorContext.stack) {
                message += `**Stack Trace:**\n\`\`\`\n${context.errorContext.stack}\n\`\`\`\n`;
            }
        }

        if (context.consoleErrors && context.consoleErrors.length > 0) {
            message += `## Console Errors\n\n`;
            context.consoleErrors.forEach((error, i) => {
                message += `${i + 1}. ${error.message}\n`;
            });
        }

        return message;
    }

    /**
     * Send error report to IDE
     * Article V: Security - Sanitize error data
     */
    async sendErrorReport(error, screenshot) {
        // Add error context to screenshot
        screenshot.errorContext = {
            type: error.type || 'javascript',
            message: this.sanitize(error.message || error.toString()),
            stack: error.stack ? this.sanitize(error.stack) : null,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        return await this.sendScreenshotToIDE(screenshot);
    }

    /**
     * Get IDE status
     */
    getStatus() {
        return {
            detected: this.detectedIDE,
            preferred: this.preferredIDE,
            capabilities: this.capabilities,
            connectionStatus: this.connectionStatus
        };
    }

    /**
     * Get available IDEs
     */
    getAvailableIDEs() {
        return Object.keys(this.capabilities).filter(ide => this.capabilities[ide]);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IDEIntegration;
}
