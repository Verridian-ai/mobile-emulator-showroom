# CLAUDE.md - Spec-Kit Development Process

**Project:** Mobile Emulator Platform
**Methodology:** Specification-Driven Development (Spec-Kit)
**AI Model:** Claude Sonnet 4.5
**Agent System:** Multi-agent parallel execution

---

## What is This File?

This file documents how to work with Claude Code CLI using the **Spec-Kit methodology** for this project. It serves as the development process guide for all agents and human developers.

---

## Spec-Kit Overview

Spec-Kit is a **specification-driven development methodology** where:
1. **Specifications drive code** (not the other way around)
2. **Constitution defines principles** (immutable rules all code must follow)
3. **Plans guide implementation** (technical roadmaps before coding)
4. **Tasks break down work** (actionable, testable units)
5. **Validation ensures compliance** (constitution + specs + tests)

**Core Philosophy:** Define the "what" and "why" before the "how"

---

## Project Structure

```
Mobile emulater/
├── .specify/                          # Spec-Kit specifications
│   ├── memory/
│   │   └── constitution.md            # 9 governing principles (IMMUTABLE)
│   ├── specs/
│   │   └── 001-platform-specification/
│   │       ├── spec.md                # What we're building (requirements)
│   │       ├── plan.md                # How we'll build it (technical plan)
│   │       ├── tasks-phase1.md        # Breakdown of 20 tasks
│   │       ├── clarifications-resolved.md  # Q&A from planning
│   │       └── technical-gaps-analysis.md  # Current issues identified
│   ├── agents/                        # Agent coordination docs
│   │   ├── agent-prompts.md
│   │   ├── orchestration-guide.md
│   │   └── HOW_AGENTS_WORK.md
│   └── scripts/                       # Automation scripts
│
├── .claude/                           # Claude Code agent configurations
│   └── agents/                        # 6 specialized agent configs
│       ├── frontend-ui-specialist.md
│       ├── backend-infrastructure.md
│       ├── core-business-logic.md
│       ├── build-tooling-optimizer.md
│       ├── testing-qa-validator.md
│       └── github-integration-specialist.md
│
├── src/                               # Source code (to be created)
├── tests/                             # Test suites (to be created)
├── public/                            # Current assets (needs optimization)
└── server.js                          # Current server (needs refactoring)
```

---

## Spec-Kit Workflow

### Phase 1: Constitution (✅ COMPLETE)

**Command:** `/constitution`

**What it does:** Establishes immutable project principles

**Our Constitution:** `.specify/memory/constitution.md`
- Article I: Architecture & Modularity
- Article II: Performance & Optimization
- Article III: Code Quality & Maintainability
- Article IV: User Experience
- Article V: Security
- Article VI: Testing & Validation
- Article VII: Development Workflow
- Article VIII: Integration & Extensibility
- Article IX: Asset Management & Branding

**Key Point:** Constitution articles are **NON-NEGOTIABLE**. All code must comply.

---

### Phase 2: Specification (✅ COMPLETE)

**Command:** `/specify`

**What it does:** Defines **what** we're building (not how)

**Our Specification:** `.specify/specs/001-platform-specification/spec.md`

Contains:
- Feature overview
- User stories (US-1 through US-5)
- Technical requirements
- Non-functional requirements (performance, security, accessibility)
- Success criteria

**Example User Story:**
```
US-1: Device Selection
As a web developer
I want to quickly switch between different device emulations
So that I can test my application's responsiveness

Acceptance Criteria:
- Device buttons organized by manufacturer
- Active device visually indicated
- Device switch completes in < 300ms
- Current URL persists across device changes
- Smooth animation transitions
```

---

### Phase 3: Clarification (✅ COMPLETE)

**Command:** `/clarify`

**What it does:** Resolves ambiguities before planning

**Our Clarifications:** `.specify/specs/001-platform-specification/clarifications-resolved.md`

**Resolved Questions:**
- Deployment: Cloud-hostable with Docker
- Use case: Internal development tool
- Device frames: Pixel-perfect accuracy required
- Testing: Mobile + web apps
- Assets: Aggressive optimization needed

---

### Phase 4: Planning (✅ COMPLETE)

**Command:** `/plan`

**What it does:** Defines **how** we'll build it (technical approach)

**Our Plan:** `.specify/specs/001-platform-specification/plan.md`

Contains:
- Architecture Decision Records (ADRs)
- Technical stack choices
- Data models
- API specifications
- Implementation phases (1-4)
- 5-day timeline with 6 agents

**Key ADR Examples:**
- ADR-001: Use Vite for build system
- ADR-002: ES Modules for tree-shaking
- ADR-003: JSDoc → TypeScript gradual migration
- ADR-007: Docker containerization
- ADR-008: Pixel-perfect device frame accuracy

---

### Phase 5: Task Breakdown (✅ COMPLETE)

**Command:** `/tasks`

**What it does:** Breaks plan into actionable, testable tasks

**Our Tasks:** `.specify/specs/001-platform-specification/tasks-phase1.md`

**20 Tasks Defined:**
- Task 1.1: Asset Audit (2 hours, Agent 4)
- Task 1.2: Optimize Images (3 hours, Agent 1)
- Task 1.3: Handle Video (2 hours, Agent 1)
- Task 1.4: Security Dependencies (1 hour, Agent 2)
- Task 1.5: URL Validation (3 hours, Agent 3)
- ... (15 more tasks)

Each task includes:
- Priority (P0, P1, P2)
- Time estimate
- Assigned agent
- Dependencies
- Acceptance criteria
- Test plan
- Implementation steps
- Constitution alignment

---

### Phase 6: Implementation (🔄 IN PROGRESS)

**Command:** `/implement`

**What it does:** Execute tasks following TDD methodology

**Our Approach:** 6 specialized agents working in parallel

**Agent Team:**
1. **Frontend UI Specialist** - Device frames, components, styling
2. **Backend & Infrastructure** - Server, Docker, security
3. **Core Business Logic** - Validators, state, device management
4. **Build & Tooling** - Vite, optimization, linting
5. **Testing & QA Validator** - All testing, validation gatekeeper
6. **GitHub Integration** - PR review, CI/CD, branch protection

**Workflow per task:**
1. Agent reads task from tasks-phase1.md
2. Agent reviews relevant constitution articles
3. Agent implements (TDD: test first, code second)
4. Agent validates against acceptance criteria
5. Agent hands off to Testing Agent
6. Testing Agent validates comprehensively
7. Testing Agent approves or rejects
8. GitHub Agent reviews PR
9. Orchestrator merges to main

---

## Git Workflow with Agents

### Branch Structure

```
main                      # Production-ready code
├── agent/frontend-ui
├── agent/backend-infrastructure
├── agent/core-business-logic
├── agent/build-tooling
├── agent/testing-qa
└── agent/github-integration
```

### Worktree Structure

Each agent works in isolated directory:
```
Desktop/
├── Mobile emulater/                  # Main repo (orchestrator)
└── mobile-emulator-worktrees/
    ├── frontend-ui/                  # Agent 1's workspace
    ├── backend-infrastructure/       # Agent 2's workspace
    ├── core-business-logic/          # Agent 3's workspace
    ├── build-tooling/                # Agent 4's workspace
    └── testing-qa/                   # Agent 5's workspace
```

**Why worktrees?** No merge conflicts! Each agent has separate filesystem.

### Merge Strategy

```
Agent completes task
    ↓
Agent pushes to their branch
    ↓
Agent opens PR to main
    ↓
GitHub Agent reviews PR
    ↓
Testing Agent validates
    ↓
Testing Agent approves
    ↓
GitHub Agent approves
    ↓
Orchestrator (human) merges
    ↓
All agents sync with main
```

---

## Working with Agents

### Invoking an Agent

```
@frontend-ui-specialist
Execute Task 1.2: Optimize Large PNG Images

Full details: .specify/specs/001-platform-specification/tasks-phase1.md

Your working directory: C:\Users\Danie\Desktop\mobile-emulator-worktrees\frontend-ui
Your branch: agent/frontend-ui

Requirements:
- new_electronic_logo.png: 7.9MB → 50KB
- Use Sharp.js or Squoosh
- WebP with PNG fallback
- MUST use Playwright MCP for validation

Hand off to @testing-qa-validator when complete.
```

### Agent Response Format

```
Task 1.2 acknowledged. Beginning implementation...

Step 1: Reviewing constitution
- Article II (Performance): Load time optimization ✓
- Article IX (Asset Management): Optimized assets ✓

Step 2: Installing Sharp.js
[implementation details...]

Step 3: Processing images
[results...]

Step 4: Playwright MCP validation
[screenshots and validation...]

Step 5: Git commit
git add public/new_electronic_logo.webp
git commit -m "feat(assets): optimize logo from 7.9MB to 48KB"
git push origin agent/frontend-ui

Task 1.2 complete. Results:
- new_electronic_logo.png: 7.9MB → 48KB (99.4% reduction)
- Playwright screenshots: ✓ Attached
- Visual quality: ✓ Maintained
- Constitution compliance: ✓ Article II, IX

Handing off to @testing-qa-validator for validation.
```

---

## Validation Process

### Testing Agent Validation

When Testing Agent receives handoff:

```
Validation Report: Task 1.2 - Image Optimization

Checklist Results:
- [✓] Tests Pass: All tests passing
- [✓] Coverage: Not applicable (asset optimization)
- [✓] Constitution Compliance: Article II ✓, Article IX ✓
- [✓] Specification Requirements: Asset size < 500KB ✓
- [✓] Acceptance Criteria: All met
  - Images < 500KB: 48KB ✓
  - WebP with fallback: ✓
  - Visual quality maintained: ✓ (Playwright screenshots)
- [✓] Playwright MCP Validation: Screenshots provided ✓
- [✓] Regression Testing: No functionality broken ✓

Overall Status: PASS ✓

Approved for merge to main.
```

### GitHub Agent PR Review

```
PR Review: Task 1.2 by @frontend-ui-specialist

Status: ✅ APPROVED

Automated Checks:
- [✓] CI/CD: All checks passed
- [✓] Tests: Not applicable (asset-only)
- [✓] Linting: No style issues
- [✓] Security: No vulnerabilities

Manual Review:
- [✓] Code quality: N/A (binary assets)
- [✓] Domain alignment: Frontend UI ✓
- [✓] Constitution compliance: Article II, IX ✓
- [✓] Specification alignment: Requirements met ✓

Testing Agent Validation:
- [✓] Requested: Yes
- [✓] Status: Approved
- [✓] Validation ID: #validation-1.2

Decision: APPROVED ✓ - Ready for merge

Ready for orchestrator to merge.
```

---

## Constitution Enforcement

### How Agents Use Constitution

Every agent **MUST**:
1. Read relevant articles before implementation
2. Design code to comply with principles
3. Validate against articles before handoff
4. Document which articles they followed

### Example: Task 1.5 (URL Validation)

Agent 3 (Core Business Logic) reads:
- **Article I:** Clean module boundaries
- **Article III:** Testable code, JSDoc
- **Article V:** Input validation, XSS prevention

Agent 3 implements:
```javascript
/**
 * Validates and sanitizes URL (Article V: Security)
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, sanitized: string|null}}
 */
export function validateUrl(url) {
  // Article V: Never trust external input
  const sanitized = DOMPurify.sanitize(url);

  // Article V: Allowlist approach
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new InvalidUrlError('Protocol not allowed');
  }

  // Article III: Return clean, testable output
  return { valid: true, sanitized };
}
```

Testing Agent validates:
- ✓ Article I: Clean module (no side effects)
- ✓ Article III: JSDoc complete, 100% tested
- ✓ Article V: XSS prevented, protocol validated

---

## Playwright MCP Integration

### What is Playwright MCP?

**MCP** = Model Context Protocol
**Playwright MCP** = Browser automation tools available to Claude agents

### Why Required for UI Work?

- **Visual Validation:** Screenshots prove UI looks correct
- **Regression Prevention:** Compare before/after screenshots
- **Accessibility:** Automated a11y snapshots
- **Consistency:** All agents use same validation method

### Required UI Validation Steps

1. **Navigate to page:**
   ```
   mcp__playwright__browser_navigate --url "http://localhost:4175"
   ```

2. **Take screenshots:**
   ```
   mcp__playwright__browser_take_screenshot --filename "device-frame-iphone-14.png"
   ```

3. **Test interactions:**
   ```
   mcp__playwright__browser_click --element "Device button" --ref "[data-device='iphone-14-pro']"
   ```

4. **Responsive testing:**
   ```
   mcp__playwright__browser_resize --width 375 --height 812
   ```

5. **Accessibility check:**
   ```
   mcp__playwright__browser_snapshot
   ```

6. **Console errors:**
   ```
   mcp__playwright__browser_console_messages
   ```

### Handoff Requirements

Frontend UI Agent MUST provide:
- Screenshot of each device frame implemented
- Screenshots at multiple viewports (375px, 768px, 1024px, 1920px)
- Accessibility snapshot showing no critical issues
- Console log showing no errors
- Performance metrics (60fps animations)

**Testing Agent will REJECT UI work without Playwright evidence.**

---

## Daily Workflow

### Morning: Task Assignment

Orchestrator assigns tasks to agents:
```
@frontend-ui-specialist → Task 1.2
@backend-infrastructure → Task 1.4
@core-business-logic → Task 1.9
@build-tooling-optimizer → Task 1.1
@testing-qa-validator → Task 1.15
```

All agents work in parallel (different worktrees, different branches).

### During Day: Progress Updates

Agents report progress:
```
@frontend-ui-specialist: Task 1.2 - 60% complete (4/6 images processed)
@backend-infrastructure: Task 1.4 - Complete, awaiting validation
@core-business-logic: Task 1.9 - In progress, dependency graph generated
```

### End of Day: Validation & Merge

1. Agents complete tasks
2. Testing Agent validates each task
3. GitHub Agent reviews PRs
4. Orchestrator merges approved PRs
5. All agents sync with main

### Metrics Tracked

- Tasks completed: X/20
- Code coverage: X%
- Lighthouse score: X
- Bundle size: XKB
- CI success rate: X%
- PR cycle time: X hours

---

## Common Commands

### For Orchestrator (Human)

```bash
# Create agent
/agents
[paste agent prompt]

# Assign task to agent
@agent-name Execute Task X.Y
[task details]

# Check agent status
@agent-name status update

# Request validation
@testing-qa-validator validate Task X.Y by @agent-name

# Merge PR (after approvals)
cd "C:\Users\Danie\Desktop\Mobile emulater"
git checkout main
git merge --no-ff agent/agent-name -m "Merge Task X.Y"
git push origin main
```

### For Agents

```bash
# Work in your worktree
cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\[your-worktree]

# Commit work
git add [files]
git commit -m "feat(domain): descriptive message"
git push origin agent/[your-agent]

# Open PR
gh pr create --title "Task X.Y: Description"

# Hand off to Testing Agent
@testing-qa-validator Task X.Y complete, ready for validation
```

---

## Success Criteria (Phase 1)

### Technical Targets

- [pending] Load time: < 2 seconds (currently ~30s)
- [pending] Bundle size: < 500KB
- [pending] Test coverage: > 80%
- [pending] Lighthouse: > 90
- [pending] Zero critical security vulnerabilities
- [pending] Docker image: < 200MB

### Task Completion

- [pending] 20/20 tasks completed
- [pending] All validated by Testing Agent
- [pending] All merged to main
- [pending] Constitution 100% compliant

### Quality Gates

- [pending] All tests passing
- [pending] No console errors
- [pending] Accessibility WCAG AA
- [pending] Documentation complete

---

## Troubleshooting

### Agent Confused?

Direct them to:
```
Review your domain: .claude/agents/[your-agent].md
Review task details: .specify/specs/001-platform-specification/tasks-phase1.md
Review constitution: .specify/memory/constitution.md
```

### Merge Conflict?

```
cd worktree
git pull origin main
[resolve conflicts]
git add [resolved files]
git commit
git push origin agent/[branch]
```

### CI Failure?

GitHub Agent will alert:
```
🚨 CI FAILED on agent/[branch]
View logs: gh run view [run-id]
Fix tests and push again
```

### Testing Agent Rejects Work?

```
Validation Report: REJECTED

Issues:
- Test coverage below 80% (currently 65%)
- Missing Playwright screenshots
- Constitution Article V violated (input not validated)

Required fixes:
1. Add unit tests for validators
2. Provide Playwright MCP screenshots
3. Add input validation per Article V

Resubmit when fixed.
```

---

## Key Principles

1. **Specification drives code** - Always reference specs before coding
2. **Constitution is law** - Non-negotiable compliance
3. **Test first (TDD)** - Write tests before implementation
4. **Validate everything** - Testing Agent approves all work
5. **Parallel execution** - Agents work simultaneously
6. **Git worktrees** - No merge conflicts during development
7. **Playwright MCP** - Required for all UI validation
8. **Document decisions** - Track all architectural choices

---

## This is Spec-Kit! 🚀

**Define → Clarify → Plan → Break Down → Implement → Validate**

Welcome to specification-driven development with AI agents!