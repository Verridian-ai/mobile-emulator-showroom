# Clarification Questions - RESOLVED

**Date:** 2025-09-30
**Specification:** 001-platform-specification
**Status:** ✅ Resolved - Ready for /tasks

---

## Stakeholder Responses

### Critical Requirements Clarified

**1. Primary Use Case**
- **Answer:** Internal development tool for testing mobile and web apps
- **Implication:** Focus on developer productivity, not public user experience
- **Impact:** Security can be enterprise-focused, performance critical for workflow

**2. Hosting Requirements**
- **Answer:** Cloud-hostable (internal deployment)
- **Implication:** Need containerization (Docker) + cloud deployment config
- **Impact:** Build for cloud deployment, environment configuration, authentication

**3. Device Frame Accuracy**
- **Answer:** Pixel-perfect device skins required - must look identical to actual devices
- **Implication:** High-fidelity CSS/SVG device frames, accurate dimensions
- **Impact:** Significant design work, visual validation testing required

**4. Testing Scope**
- **Answer:** Need to test both mobile apps and web apps
- **Implication:** iframe must support diverse content types
- **Impact:** Enhanced security sandboxing, broader compatibility testing

---

## Resolved Clarifications Matrix

| Question | User Answer | Implementation Impact |
|----------|-------------|----------------------|
| **Deployment** | Cloud-hostable (internal) | Docker + K8s configs, env-based config |
| **Use Case** | Internal dev tool | Enterprise auth, team features priority |
| **Device Frames** | Pixel-perfect accuracy | High-fidelity design work, CSS precision |
| **Testing Target** | Mobile + Web apps | Enhanced iframe security, broad compat |
| **WebSocket** | Keep optional (recommended) | Feature flag, graceful degradation |
| **Assets** | Aggressive optimization | Remove video, optimize images |
| **AI Chat** | Remove for now | Archive unused integration files |
| **Collaboration** | Future feature | Archive, document for later |
| **Testing Phase 1** | Critical paths (40%) | Unit + E2E for core flows |
| **TypeScript** | JSDoc → TypeScript Phase 2 | Gradual migration, type safety |

---

## Updated Requirements

### New Requirement 1: Cloud Deployment Architecture
```yaml
Deployment Strategy:
  - Container: Docker multi-stage build
  - Orchestration: Kubernetes-ready (optional)
  - Hosting: Cloud provider agnostic (AWS/GCP/Azure)
  - Configuration: Environment variables + secrets
  - Authentication: Enterprise SSO integration capability
```

### New Requirement 2: Pixel-Perfect Device Frames
```yaml
Device Frame Standards:
  - Accuracy: Exact dimensions, bezels, notches, cameras
  - Materials: CSS + SVG for scalability
  - Validation: Visual regression tests vs. real device screenshots
  - Coverage: All 23 devices with high fidelity
  - Details: Dynamic Island, camera cutouts, rounded corners, button placement
```

### New Requirement 3: Enhanced Security for Enterprise
```yaml
Enterprise Security:
  - Authentication: SSO integration hooks (SAML/OAuth)
  - Authorization: Role-based access control (future)
  - Iframe Sandboxing: Strict isolation for untrusted content
  - Content Security: CSP for both mobile and web app content
  - Audit Logging: Track usage for internal compliance
```

### New Requirement 4: Internal Tool UX
```yaml
Developer-Focused Features:
  - Fast device switching (< 300ms)
  - URL history/favorites
  - Screenshot comparison tools
  - Responsive design testing overlays
  - Console access for debugging (future)
  - Network throttling simulation (future)
```

---

## Updated Success Criteria

### Phase 1 Success Criteria (Revised)
1. ✅ Load time < 2s (optimized assets)
2. ✅ Cloud-ready Docker container
3. ✅ Environment-based configuration
4. ✅ Basic device frame accuracy (90% accurate)
5. ✅ Secure iframe for mobile/web app testing
6. ✅ Core functionality tested (40% coverage)

### Phase 2+ Success Criteria
- Pixel-perfect device frames (100% accurate)
- Visual regression testing system
- SSO authentication integration
- Advanced developer tools
- Team collaboration features

---

## Architecture Decisions Updated

### ADR-007: Deployment Strategy
**Decision:** Docker containerization with cloud provider agnostic design

**Configuration:**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4175
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
```

**Environment Variables:**
```bash
# Required
PORT=4175
NODE_ENV=production

# Optional
WEBSOCKET_BROKER_URL=ws://broker:7071
WEBSOCKET_TOKEN=${SECRET_TOKEN}
ENABLE_AUTH=true
SSO_PROVIDER=okta
SSO_CLIENT_ID=${SSO_CLIENT_ID}
SSO_CLIENT_SECRET=${SSO_SECRET}
```

### ADR-008: Device Frame Accuracy
**Decision:** CSS Grid + SVG for device frames, validated against real screenshots

**Approach:**
1. Measure real devices or use official specs
2. Create SVG bezels with exact dimensions
3. CSS for responsive scaling
4. Visual regression testing with Percy or Chromatic
5. Iterative refinement based on screenshots

**Example Structure:**
```css
.device-iphone-14-pro {
  /* Exact dimensions from Apple specs */
  --device-width: 430px;
  --device-height: 932px;
  --bezel-width: 12px;
  --border-radius: 47.33px; /* Exact curve radius */
  --notch-width: 125px;
  --dynamic-island-width: 125px;
  --dynamic-island-height: 37.33px;
}
```

### ADR-009: Testing Strategy for Internal Tool
**Decision:** Focus on developer workflow testing, not edge cases

**Priority Tests:**
1. Device switching speed
2. URL loading reliability
3. Frame accuracy (visual regression)
4. Security isolation (iframe sandbox)
5. Cloud deployment functionality

---

## Updated Technical Stack

### Added Dependencies
```json
{
  "dependencies": {
    "express": "^4.19.2",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "dotenv": "^16.4.0",
    "passport": "^0.7.0",
    "passport-saml": "^4.0.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.47.0",
    "percy": "^1.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "typescript": "^5.6.0"
  }
}
```

---

## Phase 1 Scope - REVISED

### Now Includes:
1. ✅ Asset optimization (critical for cloud hosting costs)
2. ✅ Docker containerization
3. ✅ Environment-based configuration
4. ✅ Basic device frame accuracy (90%)
5. ✅ Security hardening for enterprise
6. ✅ Core testing (40% coverage)

### Deferred to Phase 2:
- Pixel-perfect device frames (100% accuracy)
- Visual regression testing
- SSO authentication
- Advanced dev tools

### Removed from Scope:
- AI chat integrations
- Collaboration features
- Particle effects (performance cost)
- 37MB video background

---

## Risk Assessment - UPDATED

### New Risks Identified

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Device frame accuracy takes longer | High | Medium | Start with 90% accuracy, iterate |
| Cloud hosting costs (large assets) | High | High | Aggressive asset optimization |
| Enterprise security requirements | Medium | High | Implement CSP, sandbox, audit logging |
| Visual regression testing complexity | Medium | Low | Use Percy/Chromatic SaaS |

---

## Next Steps - Ready for `/tasks`

**Status:** ✅ All clarifications resolved

**Ready to proceed with:**
1. `/tasks` - Break down Phase 1 into actionable tasks
2. `/implement` - Execute tasks with TDD methodology
3. Validate against constitution at each milestone

**Updated Phase 1 Timeline:** 2 weeks (was 1 week)
- Week 1: Asset optimization + Docker + Security
- Week 2: Device frame refinement + Testing

---

## Questions Resolved Summary

✅ **Deployment:** Cloud-hostable with Docker
✅ **Use Case:** Internal development tool
✅ **Device Frames:** Pixel-perfect accuracy required
✅ **Testing:** Mobile + web apps
✅ **WebSocket:** Optional feature
✅ **Assets:** Aggressive optimization
✅ **AI/Collaboration:** Archive for now
✅ **TypeScript:** Gradual migration

**All Priority 1 questions answered. Proceeding to `/tasks` phase.**