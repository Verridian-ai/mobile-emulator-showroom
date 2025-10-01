# Specification: Device Frame Modularization

**Specification ID:** 002-device-frame-refactoring
**Created:** 2025-10-01
**Status:** Active
**Priority:** P1 (High)
**Methodology:** Spec-Kit
**Constitution:** `.specify/memory/constitution.md`

---

## Overview

Transform the Mobile Emulator Platform's device frame system from a monolithic CSS architecture to a modular, component-based system where each device is an independent, self-contained module with standardized interfaces.

---

## User Stories

### US-1: Developer Maintainability
**As a** platform developer
**I want** each device frame in its own file
**So that** I can update individual devices without affecting others

**Acceptance Criteria:**
- Each device has its own module file (e.g., `src/devices/apple/iphone-14-pro.js`)
- Device modules follow standardized interface
- Changes to one device don't require testing all devices
- Device-specific code is co-located (CSS, specs, features)

---

### US-2: Easy Device Addition
**As a** platform maintainer
**I want** a simple process to add new devices
**So that** I can keep the platform up-to-date with new hardware releases

**Acceptance Criteria:**
- New device requires only creating one module file
- Device auto-registers with the system
- Documentation template provided
- Visual validation automated (Playwright MCP)

---

### US-3: Performance Optimization
**As a** end user
**I want** fast device switching
**So that** I can efficiently test across multiple devices

**Acceptance Criteria:**
- Device switching remains < 300ms
- Only active device CSS loaded (code splitting)
- Bundle size reduced by 30%
- 60fps animations maintained

---

### US-4: Visual Accuracy
**As a** designer/developer
**I want** pixel-perfect device frames
**So that** I can accurately preview my designs

**Acceptance Criteria:**
- All device dimensions match official specifications (±2px)
- Notches, Dynamic Island, punch-holes accurately rendered
- Physical buttons positioned correctly
- Materials and colors authentic

---

### US-5: Comprehensive Testing
**As a** QA engineer
**I want** automated visual regression testing
**So that** I can ensure device frames remain accurate

**Acceptance Criteria:**
- Playwright MCP captures screenshots of all devices
- Visual regression tests detect frame changes
- Each device has unit tests
- Performance benchmarks automated

---

## Technical Requirements

### TR-1: Modular Architecture
- **TR-1.1**: Each device in separate module file
- **TR-1.2**: Standardized device interface (metadata, specs, CSS generation)
- **TR-1.3**: Device registry system for auto-discovery
- **TR-1.4**: Manufacturer-based directory structure

### TR-2: Device Module Interface
Each device module must export:
- **TR-2.1**: Device metadata (id, name, manufacturer, category, year)
- **TR-2.2**: Display specifications (viewport, physical, dpr, display size)
- **TR-2.3**: Frame dimensions (width, height, padding, border radius)
- **TR-2.4**: Visual features (notch, Dynamic Island, punch-hole, buttons)
- **TR-2.5**: Material properties (type, gradient, shadow)
- **TR-2.6**: CSS generation function

### TR-3: Build System Integration
- **TR-3.1**: Vite plugin for device CSS compilation
- **TR-3.2**: Hot module replacement for device changes
- **TR-3.3**: Code splitting per device
- **TR-3.4**: Minification and optimization

### TR-4: Testing Infrastructure
- **TR-4.1**: Unit tests for each device module
- **TR-4.2**: Visual regression tests (Playwright MCP)
- **TR-4.3**: Performance benchmarks (device switching < 300ms)
- **TR-4.4**: Cross-browser validation

### TR-5: Documentation
- **TR-5.1**: API documentation for device interface
- **TR-5.2**: Guide for adding new devices
- **TR-5.3**: Migration guide from old system
- **TR-5.4**: Troubleshooting guide

---

## Non-Functional Requirements

### NFR-1: Performance
- Device switching time: < 300ms (maintained from current)
- CSS compilation time: < 2 seconds
- Bundle size reduction: 30% (via code splitting)
- Animation frame rate: 60fps (maintained)

### NFR-2: Maintainability
- Code duplication: < 5% (DRY principle)
- Module cohesion: High (single responsibility)
- Module coupling: Low (independent modules)
- Documentation coverage: 100%

### NFR-3: Testability
- Unit test coverage: 100% on device modules
- Visual regression coverage: 100% (all devices)
- Performance test coverage: 100% (all devices)
- Integration test coverage: 90%

### NFR-4: Extensibility
- New device addition time: < 30 minutes
- Device variant creation: < 15 minutes
- Feature flag support: Yes
- Backward compatibility: Maintained

---

## Device Inventory

### Apple Devices (10)
1. iPhone 6/6s/7/8 (shared module)
2. iPhone X
3. iPhone 11
4. iPhone 12
5. iPhone 13
6. iPhone 14 Pro
7. iPhone 15 Pro
8. iPhone 16 Pro
9. iPad Pro 13" M4
10. iPad Air 2022

### Samsung Devices (6)
11. Galaxy S7
12. Galaxy S10
13. Galaxy S21
14. Galaxy S22
15. Galaxy S24
16. Galaxy S25 Ultra

### Google Devices (5)
17. Pixel 3
18. Pixel 5
19. Pixel 7
20. Pixel 8
21. Pixel 9 Pro

### Desktop (1)
22. Chrome Desktop Browser

**Total:** 22 device modules (some iPhones share module)

---

## Success Criteria

### Phase 1: Foundation (Week 1)
- [ ] Base infrastructure created
- [ ] First device (iPhone 14 Pro) extracted and validated
- [ ] Build pipeline functional
- [ ] Documentation template created

### Phase 2: Migration (Week 2-3)
- [ ] All 22 device modules created
- [ ] Zero visual regressions detected
- [ ] All devices pass unit tests
- [ ] Performance benchmarks met

### Phase 3: Validation (Week 4)
- [ ] 100% test coverage achieved
- [ ] Visual regression suite complete
- [ ] Documentation complete
- [ ] Migration guide published

### Overall Success
- [ ] All devices modularized
- [ ] Constitution compliance: 100%
- [ ] Performance maintained or improved
- [ ] Zero production bugs
- [ ] Team trained on new system

---

## Risks & Mitigation

### Risk 1: Visual Regressions
**Impact:** High
**Probability:** Medium
**Mitigation:**
- Playwright MCP visual testing before/after
- Pixel-perfect comparison screenshots
- Manual QA review for each device
- Rollback plan if issues detected

### Risk 2: Performance Degradation
**Impact:** High
**Probability:** Low
**Mitigation:**
- Performance benchmarks before/after
- Code splitting to reduce bundle size
- Lazy loading for unused devices
- Continuous monitoring

### Risk 3: Breaking Changes
**Impact:** Medium
**Probability:** Low
**Mitigation:**
- Maintain backward compatibility
- Feature flag for new system
- Gradual rollout (device by device)
- Comprehensive testing

### Risk 4: Developer Learning Curve
**Impact:** Low
**Probability:** Medium
**Mitigation:**
- Comprehensive documentation
- Code examples and templates
- Pair programming sessions
- Video tutorials

---

## Dependencies

### Internal
- Constitution (`.specify/memory/constitution.md`)
- Phase 1 tasks completion (asset optimization, build system)
- Testing framework (Vitest, Playwright)
- Visual Verification Agent

### External
- Vite 5.x (build system)
- Playwright MCP (visual testing)
- Sharp.js (image optimization)
- PostCSS (CSS processing)

---

## Timeline

**Total Duration:** 4 weeks

- **Week 1:** Foundation & Proof of Concept
- **Week 2:** Apple Devices Migration
- **Week 3:** Samsung, Google, Desktop Migration
- **Week 4:** Testing, Documentation, Validation

---

## Stakeholders

- **Owner:** Frontend UI Specialist Agent
- **Validator:** Visual Verification Agent
- **Reviewer:** Testing & QA Validator Agent
- **Approver:** Orchestrator (Human)

---

## References

- Architecture Plan: `architecture-plan.md`
- Constitution: `.specify/memory/constitution.md`
- Current Device CSS: `public/device-skins.css`
- Device Specifications: `public/js/device-specifications.js`
- Device Reference: `docs/device-frame-reference.md`

---

**Status:** Specification Complete - Ready for Clarification Phase
**Next Step:** Create `clarifications.md` to resolve ambiguities

