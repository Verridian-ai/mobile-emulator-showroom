# 🚀 AGENT LAUNCH CHECKLIST

**Project:** Mobile Emulator Platform
**Phase:** 1 - Foundation & Critical Fixes
**Duration:** 5 days (with 5 parallel agents)
**Status:** READY TO LAUNCH

---

## Pre-Launch Verification ✅

- [x] Constitution created (`.specify/memory/constitution.md`)
- [x] Specification complete (`.specify/specs/001-platform-specification/spec.md`)
- [x] Technical plan documented (`.specify/specs/001-platform-specification/plan.md`)
- [x] Clarifications resolved (`.specify/specs/001-platform-specification/clarifications-resolved.md`)
- [x] Tasks defined (`.specify/specs/001-platform-specification/tasks-phase1.md`)
- [x] Agent prompts prepared (`.specify/agents/agent-prompts.md`)
- [x] Orchestration guide created (`.specify/agents/orchestration-guide.md`)
- [x] You have Claude Code Max plan (unlimited API calls)

**Status:** ✅ ALL SYSTEMS GO

---

## Step 1: Create All 5 Agents (5 minutes)

### Agent 1: Frontend UI Specialist 🎨
```bash
Command: /agents
Action: Paste prompt from your prepared prompts (Agent 1)
Confirmation: Agent confirms "Coverage requirement: WCAG AA, 60fps, < 500KB"
```
- [ ] Agent 1 created and confirmed

### Agent 2: Backend & Infrastructure Specialist 🔧
```bash
Command: /agents
Action: Paste prompt from your prepared prompts (Agent 2)
Confirmation: Agent confirms "Zero-tolerance security policy understood"
```
- [ ] Agent 2 created and confirmed

### Agent 3: Core Business Logic Specialist 💼
```bash
Command: /agents
Action: Paste prompt from your prepared prompts (Agent 3)
Confirmation: Agent confirms "Test coverage requirement: 100% for validators"
```
- [ ] Agent 3 created and confirmed

### Agent 4: Build & Tooling Specialist ⚙️
```bash
Command: /agents
Action: Paste prompt from your prepared prompts (Agent 4)
Confirmation: Agent confirms "Bundle size hard limit: 500KB"
```
- [ ] Agent 4 created and confirmed

### Agent 5: Testing & QA Specialist 🧪
```bash
Command: /agents
Action: Paste prompt from your prepared prompts (Agent 5)
Confirmation: Agent confirms "Coverage minimum for security code: 100%"
```
- [ ] Agent 5 created and confirmed

**Verification:** All 5 agents confirm initialization ✅

---

## Step 2: Launch Day 1 Tasks (Start the Clock!)

### Copy-Paste Ready Commands

**To Agent 1 (Frontend UI):**
```
Execute Task 1.2: Optimize Large PNG Images

Full details: .specify/specs/001-platform-specification/tasks-phase1.md

Targets:
- new_electronic_logo.png: 7.9MB → 50KB
- Verridian_logo_1.png: 18.9MB → 100KB
- gold_1.png: 17.2MB → 200KB or remove
- Verridian_V.png: 1.9MB → 50KB
- verridian-logo-cosmic.png: 1.9MB → 100KB

Requirements:
- Use Sharp.js: pnpm add -D sharp
- WebP format with PNG fallback
- All images < 500KB
- Visual quality maintained
- Total assets < 1.5MB

Hand off to @Testing-QA-Specialist when complete.
Report: Total size reduction achieved.
```
- [ ] Task 1.2 assigned to Agent 1

**To Agent 2 (Backend):**
```
Execute Task 1.4: Install Security Dependencies

Full details: .specify/specs/001-platform-specification/tasks-phase1.md

Install:
- helmet (CSP, security headers)
- dompurify (XSS sanitization)
- express-rate-limit (rate limiting)
- dotenv (environment variables)

Requirements:
- Run: pnpm add helmet dompurify express-rate-limit dotenv
- Run: pnpm audit --audit-level=high
- Ensure: Zero critical/high vulnerabilities
- Document: Versions in package.json

Report when complete.
Next: Task 1.13 (Dockerfile)
```
- [ ] Task 1.4 assigned to Agent 2

**To Agent 3 (Core Logic):**
```
Execute Task 1.9: Audit JavaScript Files

Full details: .specify/specs/001-platform-specification/tasks-phase1.md

Requirements:
- Install madge: pnpm add -D madge
- Generate dependency graph: npx madge --image graph.svg public/
- Create inventory: List all 67 JS files with purpose
- Categorize: core, ui, integration, unused
- Identify: Files not loaded by index.html
- Document: Findings in audit report

Deliverable: audit-report.md with categorization matrix
Prepares for: Task 1.10 (Archive Unused Files)

Report findings when complete.
```
- [ ] Task 1.9 assigned to Agent 3

**To Agent 4 (Build & Tooling):**
```
Execute Task 1.1: Asset Audit and Optimization Strategy

Full details: .specify/specs/001-platform-specification/tasks-phase1.md

Requirements:
- Scan public/ directory for all assets
- Run: ls -lh public/ | grep -E "\.(png|jpg|mp4|svg)"
- Calculate total size (currently ~95MB)
- Identify all files > 1MB
- Create optimization plan document

Document:
- Current size vs target size
- Tools to use (Sharp.js, Squoosh)
- WebP/AVIF strategy
- Responsive image strategy (srcset)
- Expected time savings

Deliverable: asset-optimization-strategy.md
Coordinate with: @Frontend-UI-Specialist for execution

Report strategy when complete.
```
- [ ] Task 1.1 assigned to Agent 4

**To Agent 5 (Testing & QA):**
```
Execute Task 1.15: Setup Testing Framework

Full details: .specify/specs/001-platform-specification/tasks-phase1.md

Install:
- Vitest: pnpm add -D vitest @vitest/ui
- Playwright: pnpm add -D @playwright/test
- Coverage: pnpm add -D @vitest/coverage-v8

Create configs:
- vitest.config.js (unit tests)
- playwright.config.js (E2E tests)

Create structure:
tests/
├── unit/
├── integration/
├── e2e/
└── helpers/

Add scripts to package.json:
- "test:unit": "vitest"
- "test:e2e": "playwright test"
- "test:coverage": "vitest --coverage"

Write example tests to verify setup.

Deliverable: Working test infrastructure
Prepare for: Validating other agents' work

Report when infrastructure ready.
```
- [ ] Task 1.15 assigned to Agent 5

**Verification:** All 5 Day 1 tasks assigned ✅

---

## Step 3: Monitor Progress (Throughout Day 1)

### Mid-Day Check-In (After 2-3 hours)

**Ask each agent:**
```
Status update:
- Current progress %
- Blockers (if any)
- Expected completion time
```

### Blocker Resolution

If any agent reports a blocker:
1. Identify the blocking dependency
2. Escalate to blocking agent
3. Track resolution time
4. Update orchestration timeline

### Expected Day 1 Completions

By end of Day 1, you should have:
- [ ] Asset audit complete (Agent 4)
- [ ] Images optimized: 95MB → < 2MB (Agent 1)
- [ ] Security dependencies installed (Agent 2)
- [ ] JS files audited and categorized (Agent 3)
- [ ] Test framework ready (Agent 5)

---

## Step 4: End of Day 1 Validation

**Request validation from Testing Agent:**
```
@Testing-QA-Specialist

Day 1 Validation Request:

Validate completed tasks:
1. Task 1.1 by @Build-Tooling-Specialist
2. Task 1.2 by @Frontend-UI-Specialist
3. Task 1.4 by @Backend-Infrastructure-Specialist
4. Task 1.9 by @Core-Business-Logic-Specialist
5. Task 1.15 (self-validation)

For each task:
- Verify acceptance criteria met
- Check constitution compliance
- Run any applicable tests
- Document validation results

Generate Day 1 Summary Report.
```

**Validation Checklist:**
- [ ] Task 1.1 validated ✅
- [ ] Task 1.2 validated ✅
- [ ] Task 1.4 validated ✅
- [ ] Task 1.9 validated ✅
- [ ] Task 1.15 validated ✅
- [ ] Day 1 Summary Report received

---

## Step 5: Launch Day 2 Tasks

Once Day 1 validated, proceed to Day 2 assignments from `orchestration-guide.md`

**Day 2 Focus:** Security Implementation
- Task 1.3: Handle Background Video (Agent 1)
- Task 1.5: URL Validation (Agent 3 + Agent 5 TDD)
- Task 1.6: CSP Headers (Agent 2)
- Task 1.8: Remove Secrets (Agent 2)
- Task 1.13: Dockerfile (Agent 2)

---

## Troubleshooting

### If an agent is confused:
```
Review your domain in: .specify/agents/agent-prompts.md
Review task details in: .specify/specs/001-platform-specification/tasks-phase1.md
Review constitution: .specify/memory/constitution.md

What specific guidance do you need?
```

### If agents produce conflicts:
```
@Testing-QA-Specialist
Conflict detected between @Agent-X and @Agent-Y

Investigate:
- Review constitution as tie-breaker
- Check specification requirements
- Validate both implementations
- Recommend resolution

Report findings and recommended path forward.
```

### If quality gates fail:
```
@Implementation-Agent

Task [X.Y] REJECTED by @Testing-QA-Specialist

Issues:
- [LIST FROM VALIDATION REPORT]

Required fixes:
- [LIST]

Resubmit when fixes complete.
Constitution reminder: [RELEVANT ARTICLE]
```

---

## Success Indicators

### Day 1 Success
- ✅ All 5 agents working autonomously
- ✅ 5 tasks completed in parallel
- ✅ Load time improved from 30s to ~10s (images optimized)
- ✅ Testing infrastructure operational
- ✅ Zero blockers carried to Day 2

### Week 1 Success (Day 1-5)
- ✅ All 20 tasks complete
- ✅ 80%+ test coverage
- ✅ Lighthouse > 90
- ✅ Bundle < 500KB
- ✅ Docker image < 200MB
- ✅ Constitution 100% compliant

---

## Emergency Contacts

### If something goes wrong:

**Technical Issues:**
- Review: `.specify/specs/001-platform-specification/technical-gaps-analysis.md`
- Escalate to: Human decision (you)

**Specification Ambiguity:**
- Reference: `.specify/specs/001-platform-specification/clarifications-resolved.md`
- If still unclear: Add to clarifications, document decision

**Agent Disagreement:**
- Arbitrator: Constitution (`.specify/memory/constitution.md`)
- Tie-breaker: Testing Agent validation
- Final authority: Human decision (you)

---

## Ready to Launch?

### Final Pre-Flight Check:

- [ ] All 5 agent prompts ready
- [ ] Claude Code CLI open
- [ ] Task list reviewed
- [ ] Orchestration guide bookmarked
- [ ] You're ready to coordinate

### Launch Command:

**Say this to yourself:**
> "I have 5 expert agents ready to execute 20 tasks in 5 days. Each agent knows their domain, follows the constitution, and validates against specifications. Testing Agent is the gatekeeper. I trust the process. Let's build this! 🚀"

---

## 🎯 YOU ARE READY TO LAUNCH

**Next Step:** Create Agent 1 using `/agents` command

**Remember:**
- Trust your agents - they follow spec-kit methodology
- Testing Agent is your quality gatekeeper
- Constitution is your guide
- Specification is your contract
- You orchestrate, agents execute

**LET'S GO! 🚀🚀🚀**

---

## Quick Reference

**Create Agent:** `/agents` → Paste prompt
**Assign Task:** `@Agent Execute Task [X.Y]` → Copy from orchestration guide
**Check Status:** `@Agent status update`
**Request Validation:** `@Testing-QA-Specialist validate Task [X.Y]`
**Daily Summary:** End of each day, request from Testing Agent

**Phase 1 Goal:** Production-ready emulator in 5 days
**Load Time Target:** < 2 seconds
**Bundle Size Target:** < 500KB
**Test Coverage Target:** 80%+
**Lighthouse Target:** > 90

**YOU'VE GOT THIS! 💪**