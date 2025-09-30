# Mobile Emulator Platform Constitution

## Project Vision
A professional, high-performance device emulator platform for testing web applications across multiple device types with real-time preview capabilities and development integrations.

## Core Principles

### Article I: Architecture & Modularity
1. **Separation of Concerns**: Client-side UI, server infrastructure, and device rendering must remain independent modules
2. **Component-Based Design**: All UI elements (device frames, controls, overlays) must be self-contained, reusable components
3. **Plugin Architecture**: Integration capabilities (WebSocket, screenshot, collaboration) must be modular and independently toggleable
4. **State Management**: Application state must be centralized and predictable (device selection, URL, view settings)

### Article II: Performance & Optimization
1. **Fast Initial Load**: Page load time must be < 2 seconds on standard connections
2. **Efficient Rendering**: Device frame switching must complete in < 300ms with smooth animations
3. **Asset Optimization**:
   - Images must be optimized and served at appropriate resolutions
   - Large media files (37MB+ videos) must be evaluated for necessity
   - CSS/JS must be minified in production
4. **Resource Management**: Monitor and limit particle effects, canvas animations to maintain 60fps
5. **Lazy Loading**: Non-critical resources must load on-demand

### Article III: Code Quality & Maintainability
1. **Single Responsibility**: Each JavaScript file must serve one clear purpose
2. **DRY Principle**: Eliminate duplicate code (multiple bridge implementations, redundant CSS)
3. **Clear Naming**: Functions, variables, classes must be self-documenting
4. **Documentation**: All public APIs and complex logic must be documented
5. **Type Safety**: Consider TypeScript migration for improved reliability

### Article IV: User Experience
1. **Responsive Design**: Interface must work on mobile, tablet, and desktop viewports
2. **Accessibility**: WCAG 2.1 AA compliance (keyboard navigation, ARIA labels, color contrast)
3. **Visual Feedback**: All interactions must provide immediate visual/auditory feedback
4. **Error Handling**: Graceful degradation when iframe fails, network errors occur
5. **Loading States**: Clear indicators during device switching and URL loading

### Article V: Security
1. **Iframe Sandboxing**: Strict CSP and sandbox attributes on embedded content
2. **Input Validation**: All user inputs (URLs, commands) must be sanitized
3. **CORS Policy**: Explicit, minimal permissions for cross-origin resources
4. **No Inline Scripts**: Move all inline JavaScript to external files with nonces
5. **Secure WebSocket**: Authentication and encryption for broker connections

### Article VI: Testing & Validation
1. **Unit Testing**: Core functions (URL parsing, device switching, state management) must have tests
2. **Integration Testing**: End-to-end flows (device selection → URL load → screenshot) must be tested
3. **Cross-Browser**: Support Chrome, Firefox, Safari, Edge latest versions
4. **Device Testing**: Validate accuracy of device emulation frames
5. **Performance Testing**: Regular benchmarking of load times, FPS, memory usage

### Article VII: Development Workflow
1. **Version Control**: Git with semantic versioning, meaningful commit messages
2. **Build Process**: Automated build pipeline with linting, testing, minification
3. **Environment Management**: Clear separation of development, staging, production configs
4. **Dependency Management**: Lock files committed, regular security audits
5. **Code Review**: All changes reviewed before merging

### Article VIII: Integration & Extensibility
1. **API-First**: All features accessible via programmatic API
2. **WebSocket Protocol**: Well-defined message schema for real-time communication
3. **Screenshot API**: Standard interface for capturing device screenshots
4. **CLI Integration**: Support for automation and CI/CD pipelines
5. **Agent Compatibility**: Work seamlessly with Claude Code, GitHub Copilot, Cursor

### Article IX: Asset Management & Branding
1. **Consistent Branding**: Unified logo, color scheme, typography across all views
2. **Asset Organization**: Clear directory structure for fonts, images, videos, icons
3. **Media Optimization**: Responsive images with srcset, WebP/AVIF formats
4. **Font Strategy**: Limit custom fonts to 2-3 families, subset for used glyphs
5. **Icon System**: SVG icon library with consistent sizing and styling

## Current State Assessment

### Strengths
- Comprehensive device coverage (iPhone, Galaxy, Pixel, iPad, Desktop)
- Beautiful cosmic/glass UI design system
- Multiple integration points (WebSocket, collaboration, screenshot)
- Detailed documentation (APP_MAP.md)

### Critical Issues
1. **File Bloat**: 67+ JavaScript files, many redundant or unused
2. **Asset Size**: 37MB video, 18MB+ PNG files significantly impact load time
3. **Code Duplication**: 3 versions of protocol integration bridge
4. **Architectural Confusion**: Unclear which integration agents are active
5. **No Build Process**: Raw files served without minification/bundling
6. **Security Gaps**: Inline scripts, loose CSP, unsanitized inputs
7. **No Testing**: Zero test coverage

### Immediate Priorities
1. Consolidate and eliminate duplicate JavaScript files
2. Optimize or remove large media assets
3. Implement proper build process (Vite/Webpack)
4. Add security headers and input validation
5. Create comprehensive specification document
6. Establish testing framework

## Success Metrics
- Initial page load: < 2 seconds
- Device switch time: < 300ms
- Frame rate: Consistent 60fps
- Lighthouse score: > 90 (Performance, Accessibility, Best Practices)
- Bundle size: < 500KB total (JS + CSS)
- Zero critical security vulnerabilities
- 80%+ test coverage