# Agent Orchestration Guide - Mobile Emulator Platform

**Date:** 2025-09-30
**Project:** Mobile Emulator Platform
**Methodology:** Spec-Kit + Multi-Agent Parallel Execution
**Agent Count:** 5 specialized agents

---

## Quick Start: Launch All 5 Agents

### Step 1: Create Agents (5 minutes)

Open Claude Code and create each agent:

```bash
# Agent 1: Frontend UI Specialist
/agents
# Paste prompt from your prepared agent-prompts.md - Agent 1

# Agent 2: Backend & Infrastructure Specialist
/agents
# Paste prompt from your prepared agent-prompts.md - Agent 2

# Agent 3: Core Business Logic Specialist
/agents
# Paste prompt from your prepared agent-prompts.md - Agent 3

# Agent 4: Build & Tooling Specialist
/agents
# Paste prompt from your prepared agent-prompts.md - Agent 4

# Agent 5: Testing & Quality Assurance Specialist
/agents
# Paste prompt from your prepared agent-prompts.md - Agent 5
```

### Step 2: Verify Agent Initialization

Each agent should confirm:
- ✅ Domain ownership understood
- ✅ Constitution articles acknowledged
- ✅ Quality gates confirmed
- ✅ Ready for task assignment

### Step 3: Launch Day 1 Tasks (Parallel Execution)

Send these commands **simultaneously** to all 5 agents:

```bash
@Frontend-UI-Specialist
Execute Task 1.2: Optimize Large PNG Images
Full details in: .specify/specs/001-platform-specification/tasks-phase1.md
Target: 7.9MB → 50KB (new_electronic_logo.png), 18.9MB → 100KB (Verridian_logo_1.png)
Use Sharp.js or Squoosh. WebP with PNG fallback.
Report when complete and hand off to @Testing-QA-Specialist

@Backend-Infrastructure-Specialist
Execute Task 1.4: Install Security Dependencies
Full details in: .specify/specs/001-platform-specification/tasks-phase1.md
Install: helmet, dompurify, express-rate-limit, dotenv
Run npm audit - zero critical vulnerabilities required
Document in package.json
Report when complete

@Core-Business-Logic-Specialist
Execute Task 1.9: Audit JavaScript Files
Full details in: .specify/specs/001-platform-specification/tasks-phase1.md
Create dependency graph using madge
Document each file's purpose
Categorize: core, ui, integration, unused
Report findings - preparing for Task 1.10

@Build-Tooling-Specialist
Execute Task 1.1: Asset Audit and Optimization Strategy
Full details in: .specify/specs/001-platform-specification/tasks-phase1.md
Scan public/ directory for all assets
Identify files > 1MB
Create optimization plan document
Coordinate with @Frontend-UI-Specialist for execution
Report strategy when complete

@Testing-QA-Specialist
Execute Task 1.15: Setup Testing Framework
Full details in: .specify/specs/001-platform-specification/tasks-phase1.md
Install Vitest and Playwright
Create test directory structure
Write example tests
Prepare to validate other agents' work
Report when infrastructure ready
```

---

## Execution Schedule (5 Days with Parallel Agents)

### Day 1: Foundation & Security Dependencies

**Morning (Parallel Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Build Agent | 1.1: Asset Audit | 2 hours | None |
| Backend Agent | 1.4: Security Deps | 1 hour | None |
| Core Agent | 1.9: JS File Audit | 3 hours | None |
| Testing Agent | 1.15: Test Framework | 3 hours | None |
| Frontend Agent | Prepare for 1.2 | - | Wait for Build Agent 1.1 |

**Afternoon (Sequential Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Frontend Agent | 1.2: Optimize Images | 3 hours | Build Agent 1.1 complete |
| Frontend Agent | 1.3: Handle Video | 2 hours | Task 1.2 complete |
| Backend Agent | 1.13: Dockerfile | 2 hours | Task 1.4 complete |
| Testing Agent | Validate 1.2, 1.3 | 1 hour | Frontend tasks complete |

**Day 1 Completion Checklist:**
- [ ] Asset audit complete (Build Agent)
- [ ] Images optimized: 95MB → < 2MB (Frontend Agent)
- [ ] Video removed/replaced (Frontend Agent)
- [ ] Security dependencies installed (Backend Agent)
- [ ] Dockerfile created (Backend Agent)
- [ ] JS files audited (Core Agent)
- [ ] Test framework ready (Testing Agent)

---

### Day 2: Security Implementation

**Morning (Parallel Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Core Agent | 1.5: URL Validation | 3 hours | Testing Agent ready (TDD) |
| Backend Agent | 1.6: CSP Headers | 2 hours | Task 1.4 complete |
| Backend Agent | 1.8: Remove Secrets | 2 hours | Task 1.6 complete |
| Testing Agent | 1.16: Unit Tests for 1.5 | 3 hours | Coordinate with Core Agent |
| Frontend Agent | Standby | - | - |

**Coordination Point:** Core Agent and Testing Agent work together on Task 1.5 using TDD

**TDD Workflow (Core + Testing Agents):**
1. Testing Agent writes failing test for URL validation
2. Core Agent implements feature to pass test
3. Refactor together
4. Testing Agent validates 100% coverage
5. Both agents confirm complete

**Afternoon (Parallel Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Core Agent | 1.10: Archive Unused Files | 2 hours | Task 1.9 complete |
| Backend Agent | 1.14: Env Config System | 2 hours | Task 1.8 complete |
| Frontend Agent | Start 1.7: Inline Scripts (UI) | 2 hours | None |
| Testing Agent | Validate security tasks | 2 hours | Backend tasks complete |

**Day 2 Completion Checklist:**
- [ ] URL validation implemented with 100% coverage (Core + Testing)
- [ ] CSP headers active (Backend)
- [ ] All secrets moved to env vars (Backend)
- [ ] Unused files archived (Core)
- [ ] Environment config system working (Backend)
- [ ] Inline scripts partially moved (Frontend)
- [ ] All security validated (Testing)

---

### Day 3: Build System & Module Migration

**Morning (Parallel Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Build Agent | 1.11: Setup Vite | 4 hours | Tasks 1.7, 1.10 complete |
| Core Agent | 1.7: Inline Scripts (Logic) | 2 hours | None |
| Frontend Agent | 1.7: Inline Scripts (UI) | 2 hours | None |
| Testing Agent | Write integration tests | 3 hours | None |

**Afternoon (Parallel Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Core Agent | 1.12: ES Modules (Core) | 3 hours | Vite setup complete |
| Frontend Agent | 1.12: ES Modules (UI) | 3 hours | Vite setup complete |
| Build Agent | Test build pipeline | 2 hours | ES module migration |
| Testing Agent | Validate builds | 2 hours | Build complete |

**Day 3 Completion Checklist:**
- [ ] All inline scripts moved to external files (Frontend + Core)
- [ ] Vite build system working (Build Agent)
- [ ] ES modules migration complete (Core + Frontend)
- [ ] HMR working (Build Agent)
- [ ] Production build < 500KB (Build Agent)
- [ ] All tests passing (Testing Agent)

---

### Day 4: Testing & Quality

**All Day (Parallel Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Testing Agent | 1.16: Core Unit Tests | 4 hours | Core logic complete |
| Testing Agent | 1.17: E2E Critical Paths | 4 hours | App functional |
| Build Agent | 1.18: ESLint/Prettier | 2 hours | None |
| All Agents | Fix linting issues | 2 hours | ESLint configured |
| Testing Agent | Validate 80% coverage | 2 hours | All tests written |

**Day 4 Completion Checklist:**
- [ ] 80%+ code coverage achieved (Testing Agent)
- [ ] All unit tests passing (Testing Agent)
- [ ] E2E critical paths tested (Testing Agent)
- [ ] ESLint/Prettier configured (Build Agent)
- [ ] Zero linting errors (All Agents)
- [ ] All tests green in CI (Testing Agent)

---

### Day 5: Performance & Documentation

**Morning (Parallel Execution):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Build Agent | 1.20: Performance Validation | 2 hours | Build complete |
| Testing Agent | 1.19: Update Documentation | 3 hours | All tasks complete |
| All Agents | Address performance issues | 2 hours | Lighthouse results |

**Afternoon (Final Validation):**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| Testing Agent | Final validation sweep | 2 hours | All agents complete |
| All Agents | Fix any blockers | 2 hours | As needed |
| Testing Agent | Generate final report | 1 hour | All validated |

**Day 5 Completion Checklist:**
- [ ] Lighthouse Performance > 90 (Build Agent)
- [ ] Load time < 2 seconds (Build Agent)
- [ ] Bundle < 500KB (Build Agent)
- [ ] Documentation complete (Testing Agent)
- [ ] All acceptance criteria met (Testing Agent)
- [ ] Constitution compliance verified (Testing Agent)
- [ ] **Phase 1 COMPLETE** 🎉

---

## Agent Communication Protocol

### Daily Standup Format

Each agent reports:
1. **Completed yesterday:** [List tasks]
2. **Today's plan:** [Current task]
3. **Blockers:** [Dependencies waiting on other agents]
4. **Handoffs needed:** [Work ready for validation]

### Handoff Protocol

When an agent completes a task:

```markdown
## Task Handoff: [TASK_ID]

**From:** @[SOURCE_AGENT]
**To:** @[TARGET_AGENT] (usually Testing Agent)
**Task:** [TASK_DESCRIPTION]

**Completion Status:**
✅ All acceptance criteria met
✅ Constitution principles followed
✅ Code documented
✅ Self-tested

**Outputs:**
- Files created: [LIST]
- Files modified: [LIST]
- Tests written: [LIST]

**Validation Required:**
- [ ] Run tests
- [ ] Check code coverage
- [ ] Verify constitution compliance
- [ ] Review code quality

**Next Actions:**
@[TARGET_AGENT] please validate and approve.
```

### Blocker Resolution Protocol

When an agent is blocked:

```markdown
## BLOCKER: [TASK_ID]

**Blocked Agent:** @[AGENT_NAME]
**Blocking Agent:** @[AGENT_NAME]
**Reason:** [DESCRIPTION]

**Required to Unblock:**
- [ ] Task [X] must complete
- [ ] API contract must be defined
- [ ] Configuration decision needed

**Estimated Impact:** [TIME]
**Workaround Available:** [YES/NO] [DESCRIPTION]

**Requesting:** @[BLOCKING_AGENT] priority escalation
```

---

## Validation Checkpoints

### After Each Task (Testing Agent)

```markdown
## Validation Report: [TASK_ID]

**Agent:** @[IMPLEMENTATION_AGENT]
**Task:** [TASK_DESCRIPTION]
**Validator:** @Testing-QA-Specialist

**Acceptance Criteria:**
- [ ] Criterion 1: [STATUS]
- [ ] Criterion 2: [STATUS]
...

**Constitution Compliance:**
- [ ] Article [X]: [COMPLIANT/NON-COMPLIANT] [NOTES]

**Code Quality:**
- Test Coverage: [X]%
- Linting: [PASS/FAIL]
- Documentation: [COMPLETE/INCOMPLETE]

**Result:** [APPROVED / REJECTED / CONDITIONAL APPROVAL]

**Notes:**
[Any issues or recommendations]

**Signature:** @Testing-QA-Specialist [DATE]
```

### End of Day (All Agents)

```markdown
## Daily Summary: Day [X]

**Completed Tasks:**
- Task 1.X by @[AGENT] - VALIDATED ✅
- Task 1.Y by @[AGENT] - VALIDATED ✅

**In Progress:**
- Task 1.Z by @[AGENT] - 60% complete

**Blockers:**
- [DESCRIPTION] - Resolution: [PLAN]

**Tomorrow's Plan:**
- @Frontend: [TASK]
- @Backend: [TASK]
- @Core: [TASK]
- @Build: [TASK]
- @Testing: [TASK]

**Risks:**
[Any risks identified]

**Overall Status:** [ON TRACK / AT RISK / BLOCKED]
```

---

## Emergency Protocols

### If an agent gets stuck (> 2 hours):

1. **Agent reports blocker** using Blocker Protocol
2. **Testing Agent investigates** root cause
3. **Orchestrator (you) decides:**
   - Reassign task to different agent?
   - Simplify task scope?
   - Escalate to human decision?
4. **Document decision** in clarifications

### If agents produce conflicting code:

1. **Testing Agent detects** conflict via test failures
2. **Relevant agents coordinate** to resolve
3. **Follow constitution** as tie-breaker
4. **Testing Agent validates** resolution

### If quality gates fail:

1. **Testing Agent rejects** task completion
2. **Implementation agent fixes** issues
3. **Resubmit for validation**
4. **No moving forward** until gates pass

---

## Success Metrics Dashboard

Track throughout Phase 1:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Load Time | < 2s | TBD | 🟡 |
| Bundle Size | < 500KB | TBD | 🟡 |
| Test Coverage | > 80% | TBD | 🟡 |
| Lighthouse Score | > 90 | TBD | 🟡 |
| Tasks Complete | 20/20 | 0/20 | 🟡 |
| Security Vulns | 0 critical | TBD | 🟡 |
| Constitution Compliance | 100% | TBD | 🟡 |

**Legend:** 🟢 On Track | 🟡 In Progress | 🔴 At Risk

---

## Final Phase 1 Validation

Before declaring Phase 1 complete, Testing Agent must verify:

### Technical Validation
- [ ] All 20 tasks completed and approved
- [ ] 80%+ code coverage achieved
- [ ] All tests passing (unit, integration, E2E)
- [ ] Zero critical security vulnerabilities
- [ ] Lighthouse Performance > 90
- [ ] Bundle size < 500KB
- [ ] Load time < 2 seconds
- [ ] Docker image < 200MB
- [ ] No console errors in production build

### Specification Validation
- [ ] All user stories in spec.md satisfied
- [ ] All acceptance criteria met
- [ ] All technical requirements implemented
- [ ] All security requirements satisfied
- [ ] All performance targets achieved

### Constitution Validation
- [ ] Article I (Architecture): Modular, clean separation ✅
- [ ] Article II (Performance): < 2s load, 60fps ✅
- [ ] Article III (Code Quality): DRY, documented ✅
- [ ] Article IV (UX): Responsive, accessible ✅
- [ ] Article V (Security): Zero critical vulns ✅
- [ ] Article VI (Testing): 80% coverage ✅
- [ ] Article VII (Dev Workflow): Docker, CI/CD ready ✅
- [ ] Article VIII (Integration): API-first ✅
- [ ] Article IX (Asset Management): Optimized ✅

### Documentation Validation
- [ ] README.md updated
- [ ] ARCHITECTURE.md created
- [ ] API.md documented
- [ ] DEPLOYMENT.md created
- [ ] All TODOs resolved

**If all checkboxes ✅ → Phase 1 COMPLETE 🎉**

---

## Post-Phase 1: Next Steps

Once Phase 1 validated:

1. **Tag release:** `git tag v1.0.0-phase1`
2. **Deploy to staging:** Test in cloud environment
3. **Performance baseline:** Document metrics
4. **Team review:** Share with stakeholders
5. **Plan Phase 2:** Device frame pixel-perfect refinement

---

## Quick Reference Commands

### Check Agent Status
```bash
# List all active agents
/agents list

# Check specific agent status
@[AGENT-NAME] status report
```

### Assign New Task
```bash
@[AGENT-NAME] Execute Task [X.Y]: [TASK_NAME]
Review: .specify/specs/001-platform-specification/tasks-phase1.md
Report when complete and hand off to @Testing-QA-Specialist
```

### Request Validation
```bash
@Testing-QA-Specialist
Please validate Task [X.Y] completed by @[AGENT-NAME]
Use validation checklist from orchestration-guide.md
Report approval status
```

### Coordinate Between Agents
```bash
@[AGENT-1] and @[AGENT-2]
Coordinate on [ISSUE]
@[AGENT-1] provides [X]
@[AGENT-2] implements [Y]
Both report when synchronized
```

---

## Tips for Successful Orchestration

1. **Start each day** with task assignments to all agents
2. **Check in mid-day** for blocker resolution
3. **End each day** with validation sweep by Testing Agent
4. **Celebrate wins** - acknowledge completed tasks
5. **Trust the process** - agents follow spec-kit methodology
6. **Enforce quality gates** - Testing Agent is the gatekeeper
7. **Document everything** - maintain audit trail
8. **Stay parallel** - maximize concurrent work

---

## You Are Ready to Launch! 🚀

**Next Steps:**
1. Create all 5 agents using your prepared prompts
2. Verify each agent confirms initialization
3. Use Day 1 task assignments from this guide
4. Monitor progress using communication protocols
5. Trust Testing Agent to validate quality

**Your role as orchestrator:**
- Assign tasks
- Resolve blockers
- Track progress
- Make decisions when needed
- Celebrate Phase 1 completion

**Let's build this! 🎯**