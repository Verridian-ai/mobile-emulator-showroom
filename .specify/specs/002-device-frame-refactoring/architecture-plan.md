# Device Frame Refactoring - Architecture Plan

**Specification ID:** 002-device-frame-refactoring
**Created:** 2025-10-01
**Status:** Planning
**Methodology:** Spec-Kit (Specification-Driven Development)
**Constitution Alignment:** Article I (Architecture & Modularity)

---

## Executive Summary

Refactor the monolithic `device-skins.css` (1,611 lines) into a modular, maintainable architecture where each of the 23+ device frames exists as an independent, self-contained module with standardized interfaces.

**Current State:** All device frames in single CSS file
**Target State:** Modular file structure with device-specific modules
**Impact:** Improved maintainability, testability, and extensibility

---

## Problem Statement

### Current Issues

1. **Monolithic CSS File** (1,611 lines)
   - All 23+ devices in `public/device-skins.css`
   - Difficult to maintain and update individual devices
   - No clear separation of concerns
   - Hard to test device-specific styles

2. **Tight Coupling**
   - Device specifications scattered across multiple files
   - CSS, JavaScript, and configuration not co-located
   - Difficult to add new devices

3. **Constitution Violations**
   - **Article I.2**: Component-Based Design not followed
   - **Article I.1**: Separation of Concerns violated
   - **Article III.1**: Single Responsibility violated

---

## Proposed Architecture

### File Structure

```
src/
├── devices/
│   ├── index.js                    # Device registry and loader
│   ├── base/
│   │   ├── DeviceFrame.js          # Base device frame class
│   │   ├── device-base.css         # Shared base styles
│   │   └── constants.js            # Shared constants (shadows, gradients)
│   │
│   ├── apple/
│   │   ├── index.js                # Apple device registry
│   │   ├── iphone-6.js             # iPhone 6/6s/7/8 (shared)
│   │   ├── iphone-x.js             # iPhone X
│   │   ├── iphone-11.js            # iPhone 11
│   │   ├── iphone-12.js            # iPhone 12
│   │   ├── iphone-13.js            # iPhone 13
│   │   ├── iphone-14-pro.js        # iPhone 14 Pro
│   │   ├── iphone-15-pro.js        # iPhone 15 Pro
│   │   ├── iphone-16-pro.js        # iPhone 16 Pro
│   │   ├── ipad-pro-13-m4.js       # iPad Pro 13" M4
│   │   └── ipad-air-2022.js        # iPad Air 2022
│   │
│   ├── samsung/
│   │   ├── index.js                # Samsung device registry
│   │   ├── galaxy-s7.js            # Galaxy S7
│   │   ├── galaxy-s10.js           # Galaxy S10
│   │   ├── galaxy-s21.js           # Galaxy S21
│   │   ├── galaxy-s22.js           # Galaxy S22
│   │   ├── galaxy-s24.js           # Galaxy S24
│   │   └── galaxy-s25-ultra.js     # Galaxy S25 Ultra
│   │
│   ├── google/
│   │   ├── index.js                # Google device registry
│   │   ├── pixel-3.js              # Pixel 3
│   │   ├── pixel-5.js              # Pixel 5
│   │   ├── pixel-7.js              # Pixel 7
│   │   ├── pixel-8.js              # Pixel 8
│   │   └── pixel-9-pro.js          # Pixel 9 Pro
│   │
│   └── desktop/
│       ├── index.js                # Desktop browser registry
│       └── chrome.js               # Chrome desktop browser
│
└── styles/
    └── devices.css                 # Generated/compiled device styles
```

### Device Module Interface

Each device module exports a standardized interface:

```javascript
/**
 * Device Frame Module Interface
 * All device modules must implement this structure
 */
export default {
  // Device Metadata
  id: 'iphone-14-pro',
  name: 'iPhone 14 Pro',
  manufacturer: 'Apple',
  category: 'phone', // 'phone' | 'tablet' | 'desktop'
  year: 2022,
  
  // Display Specifications
  viewport: {
    width: 393,
    height: 852
  },
  
  physical: {
    width: 786,
    height: 1704
  },
  
  dpr: 3,
  display: '6.1"',
  
  // Frame Dimensions
  frame: {
    width: 393,
    height: 852,
    padding: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    },
    borderRadius: 56,
    screenRadius: 55
  },
  
  // Visual Features
  features: {
    notch: null,
    dynamicIsland: {
      width: 125,
      height: 35,
      borderRadius: 18,
      top: 10
    },
    punchHole: null,
    homeButton: false,
    speakerGrille: true
  },
  
  // Physical Buttons
  buttons: {
    power: {
      side: 'right',
      top: 180,
      height: 70
    },
    volumeUp: {
      side: 'left',
      top: 140,
      height: 45
    },
    volumeDown: {
      side: 'left',
      top: 195,
      height: 45
    },
    actionButton: {
      side: 'left',
      top: 85,
      height: 35
    }
  },
  
  // Material & Styling
  material: {
    type: 'titanium',
    gradient: 'var(--titanium-gradient)',
    shadow: 'var(--shadow-device-edge)'
  },
  
  // CSS Generation Function
  generateCSS() {
    return `
      .device-${this.id} {
        width: ${this.frame.width}px;
        height: ${this.frame.height}px;
        padding: ${this.frame.padding.top}px ${this.frame.padding.right}px 
                 ${this.frame.padding.bottom}px ${this.frame.padding.left}px;
        background: ${this.material.gradient};
        border-radius: ${this.frame.borderRadius}px;
        box-shadow: ${this.material.shadow};
      }
      
      .device-${this.id} .screen {
        border-radius: ${this.frame.screenRadius}px;
      }
      
      /* Dynamic Island */
      ${this.features.dynamicIsland ? `
      .device-${this.id}::before {
        content: '';
        position: absolute;
        top: ${this.features.dynamicIsland.top}px;
        left: 50%;
        transform: translateX(-50%);
        width: ${this.features.dynamicIsland.width}px;
        height: ${this.features.dynamicIsland.height}px;
        background: #000;
        border-radius: ${this.features.dynamicIsland.borderRadius}px;
        z-index: 10;
      }
      ` : ''}
      
      /* Buttons */
      ${this.generateButtonCSS()}
    `;
  },
  
  // Helper: Generate button CSS
  generateButtonCSS() {
    let css = '';
    Object.entries(this.buttons).forEach(([name, config]) => {
      css += `
      .device-${this.id} .button-${name} {
        position: absolute;
        ${config.side}: -4px;
        top: ${config.top}px;
        width: 4px;
        height: ${config.height}px;
        background: var(--button-gradient);
        border-radius: 2px;
      }
      `;
    });
    return css;
  }
};
```

---

## Implementation Strategy

### Phase 1: Foundation (Week 1)

#### 1.1 Create Base Infrastructure
- [ ] Create `src/devices/` directory structure
- [ ] Implement `DeviceFrame` base class
- [ ] Create shared constants file
- [ ] Create device registry system

#### 1.2 Extract First Device (Proof of Concept)
- [ ] Extract iPhone 14 Pro as first module
- [ ] Validate CSS generation
- [ ] Test device switching
- [ ] Document learnings

#### 1.3 Create Build Pipeline
- [ ] CSS compilation script
- [ ] Device registry auto-generation
- [ ] Vite integration
- [ ] Hot module replacement support

### Phase 2: Migration (Week 2-3)

#### 2.1 Apple Devices (8 devices)
- [ ] iPhone 6/6s/7/8 (shared module)
- [ ] iPhone X, 11, 12, 13
- [ ] iPhone 14 Pro, 15 Pro, 16 Pro
- [ ] iPad Pro 13" M4, iPad Air 2022

#### 2.2 Samsung Devices (6 devices)
- [ ] Galaxy S7, S10, S21, S22, S24, S25 Ultra

#### 2.3 Google Devices (5 devices)
- [ ] Pixel 3, 5, 7, 8, 9 Pro

#### 2.4 Desktop (1 device)
- [ ] Chrome desktop browser

### Phase 3: Validation (Week 4)

#### 3.1 Testing
- [ ] Unit tests for each device module
- [ ] Visual regression tests (Playwright MCP)
- [ ] Performance benchmarks
- [ ] Cross-browser validation

#### 3.2 Documentation
- [ ] API documentation for device modules
- [ ] Migration guide
- [ ] Adding new devices guide
- [ ] Troubleshooting guide

---

## Benefits

### Maintainability
- **Single Responsibility**: Each device in its own file
- **Easy Updates**: Modify one device without affecting others
- **Clear Ownership**: Device-specific code co-located

### Testability
- **Unit Testing**: Test individual device modules
- **Visual Testing**: Screenshot each device independently
- **Regression Prevention**: Changes isolated to specific devices

### Extensibility
- **Add New Devices**: Drop in new module, auto-registered
- **Device Variants**: Easy to create color/size variants
- **Feature Flags**: Enable/disable devices dynamically

### Performance
- **Code Splitting**: Load only needed device CSS
- **Tree Shaking**: Remove unused device code
- **Lazy Loading**: Load devices on-demand

---

## Constitution Compliance

### Article I: Architecture & Modularity ✓
- ✓ Separation of Concerns: Device logic separated by manufacturer
- ✓ Component-Based Design: Each device is self-contained component
- ✓ Plugin Architecture: Devices are pluggable modules
- ✓ State Management: Device state centralized in registry

### Article II: Performance & Optimization ✓
- ✓ Code Splitting: Load devices on-demand
- ✓ Tree Shaking: Remove unused devices
- ✓ Asset Optimization: CSS minified per device

### Article III: Code Quality & Maintainability ✓
- ✓ Single Responsibility: One device per file
- ✓ DRY Principle: Shared base class and constants
- ✓ Clear Naming: Standardized naming convention
- ✓ Documentation: JSDoc on all modules

---

## Success Metrics

- [ ] All 23+ devices extracted to individual modules
- [ ] Zero visual regressions (Playwright validation)
- [ ] Device switching time < 300ms (maintained)
- [ ] Bundle size reduced by 30% (code splitting)
- [ ] 100% test coverage on device modules
- [ ] Documentation complete for all devices

---

## Next Steps

1. **Create Specification** (`.specify/specs/002-device-frame-refactoring/spec.md`)
2. **Execute Clarification** (Resolve ambiguities)
3. **Create Technical Plan** (Detailed implementation)
4. **Break Down Tasks** (Actionable, testable units)
5. **Implement** (TDD methodology)
6. **Validate** (Visual Verification Agent)

---

**Status:** Ready for Specification Phase
**Owner:** Frontend UI Specialist Agent
**Validator:** Visual Verification Agent

