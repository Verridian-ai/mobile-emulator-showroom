# How Multi-Agent Parallel Execution Works

**Project:** Mobile Emulator Platform
**System:** 5 specialized Claude Code agents working simultaneously
**Model:** Claude Sonnet 4.5 (each agent is a separate instance)

---

## The Big Picture: How It Works

### Traditional Development (Serial - 1 Developer)
```
Day 1: Task 1.1 (2 hours) → Task 1.2 (3 hours) → Task 1.3 (2 hours) = 7 hours
Day 2: Task 1.4 (1 hour) → Task 1.5 (3 hours) → Task 1.6 (2 hours) = 6 hours
...
Total: 10 days (20 tasks × average 4 hours each)
```

### Multi-Agent Parallel (5 Agents Working Simultaneously)
```
Day 1:
  Agent 1 → Task 1.2 (3 hours) ║ Agent 2 → Task 1.4 (1 hour)
  Agent 3 → Task 1.9 (3 hours) ║ Agent 4 → Task 1.1 (2 hours)
  Agent 5 → Task 1.15 (3 hours)

All happening at the SAME TIME = 3 hours (longest task)

Total: 5 days (parallel execution)
```

**Result:** 10 days → 5 days (50% faster due to parallelization)

---

## Technical Architecture: How Agents Actually Run

### 1. Agent Instances (Separate Processes)

Each agent is a **separate Claude Code process**:

```
Your Computer
├── Claude Code Session 1: Main Orchestrator (YOU)
├── Claude Code Session 2: Agent 1 (frontend-ui-specialist)
├── Claude Code Session 3: Agent 2 (backend-infrastructure)
├── Claude Code Session 4: Agent 3 (core-business-logic)
├── Claude Code Session 5: Agent 4 (build-tooling-optimizer)
└── Claude Code Session 6: Agent 5 (testing-qa-validator)
```

Each agent:
- Has its own **context** (the prompt you gave it)
- Has its own **working directory** (Git worktree)
- Works **independently** (no blocking each other)
- Communicates via **@mentions** in Claude Code

### 2. How Agents Communicate

**You are the orchestrator** - agents communicate through you:

```
┌─────────────────────────────────────────────────┐
│            YOU (Orchestrator)                   │
│  - Main Claude Code session                     │
│  - Assigns tasks to agents                      │
│  - Routes messages between agents               │
│  - Merges validated code to main                │
└─────────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌────────┐     ┌────────┐     ┌────────┐
    │Agent 1 │     │Agent 2 │     │Agent 3 │ ...
    │Frontend│     │Backend │     │  Core  │
    └────────┘     └────────┘     └────────┘
```

**Example Communication Flow:**

```
YOU → @frontend-ui-specialist
"Execute Task 1.2: Optimize images"

Agent 1 → (works independently for 3 hours)

Agent 1 → YOU (via message)
"Task 1.2 complete. Images optimized 95MB → 1.8MB.
Handing off to @testing-qa-validator"

YOU → @testing-qa-validator
"Validate Agent 1's Task 1.2 completion"

Agent 5 → (validates code, runs tests)

Agent 5 → YOU
"Task 1.2 VALIDATED ✓ All acceptance criteria met."

YOU → (merges to main branch)
```

### 3. Isolated File Systems (Git Worktrees)

Each agent works in a **separate directory**:

```
C:\Users\Danie\Desktop\
├── Mobile emulater\                    (main - YOU work here)
│   └── .git\                           (shared Git repo)
│
└── mobile-emulator-worktrees\
    ├── frontend-ui\                    (Agent 1 works here)
    │   ├── public\
    │   ├── src\
    │   └── (full codebase copy)
    │
    ├── backend-infrastructure\         (Agent 2 works here)
    │   ├── server\
    │   ├── Dockerfile
    │   └── (full codebase copy)
    │
    ├── core-business-logic\            (Agent 3 works here)
    │   ├── src\core\
    │   └── (full codebase copy)
    │
    ├── build-tooling\                  (Agent 4 works here)
    │   ├── vite.config.js
    │   └── (full codebase copy)
    │
    └── testing-qa\                     (Agent 5 works here)
        ├── tests\
        └── (full codebase copy)
```

**Key Point:** Different directories = **no file conflicts** during development!

Each worktree is:
- **Separate filesystem:** Agent 1 can't overwrite Agent 2's files
- **Same Git repo:** All connected to same .git database
- **Different branches:** Each agent on their own branch

---

## Parallel Execution Example: Day 1

### Timeline Visualization

```
TIME: 9:00 AM - Start Day 1
─────────────────────────────────────────────────────

YOU (Orchestrator):
├─ @frontend-ui-specialist → Task 1.2
├─ @backend-infrastructure → Task 1.4
├─ @core-business-logic → Task 1.9
├─ @build-tooling-optimizer → Task 1.1
└─ @testing-qa-validator → Task 1.15

All agents receive assignments simultaneously

─────────────────────────────────────────────────────
TIME: 9:00 AM - 12:00 PM (3 hours)

┌─────────────────────────────────────────┐
│ Agent 1 (Frontend UI)                   │
│ Working in: frontend-ui/                │
│ Task 1.2: Optimize images               │
│ Status: Installing Sharp.js...          │
│         Processing images...            │
│         Creating WebP versions...       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Agent 2 (Backend)                       │
│ Working in: backend-infrastructure/     │
│ Task 1.4: Security dependencies         │
│ Status: pnpm add helmet...              │
│         Running npm audit...            │
│         Complete! ✓                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Agent 3 (Core Logic)                    │
│ Working in: core-business-logic/        │
│ Task 1.9: JS file audit                 │
│ Status: Running madge...                │
│         Creating dependency graph...    │
│         Documenting files...            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Agent 4 (Build Tooling)                 │
│ Working in: build-tooling/              │
│ Task 1.1: Asset audit                   │
│ Status: Scanning public/ directory...   │
│         Calculating sizes...            │
│         Complete! ✓                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Agent 5 (Testing)                       │
│ Working in: testing-qa/                 │
│ Task 1.15: Test framework setup         │
│ Status: Installing Vitest...            │
│         Installing Playwright...        │
│         Creating test structure...      │
└─────────────────────────────────────────┘

ALL WORKING AT THE SAME TIME!
No waiting for each other!

─────────────────────────────────────────────────────
TIME: 11:00 AM (2 hours in)

Agent 2 → YOU:
"Task 1.4 complete. Security deps installed.
Zero vulnerabilities. Ready for Task 1.13 (Dockerfile)."

Agent 4 → YOU:
"Task 1.1 complete. Asset audit shows 95MB total.
Strategy document created. Ready for coordination
with @frontend-ui-specialist."

─────────────────────────────────────────────────────
TIME: 12:00 PM (3 hours in)

Agent 1 → YOU:
"Task 1.2 complete. Images: 95MB → 1.8MB.
Requesting validation from @testing-qa-validator"

Agent 3 → YOU:
"Task 1.9 complete. 67 files audited.
52 unused files identified. Dependency graph created.
Ready for Task 1.10 (Archive files)."

Agent 5 → YOU:
"Task 1.15 complete. Vitest + Playwright configured.
Test structure created. Ready to validate other agents."

─────────────────────────────────────────────────────
YOU (Orchestrator) → Actions:

1. Route Agent 1's validation request:
   @testing-qa-validator → Validate Agent 1's Task 1.2

2. Assign next tasks to available agents:
   @backend-infrastructure → Task 1.13 (Dockerfile)
   @core-business-logic → Task 1.10 (Archive files)
   @frontend-ui-specialist → Task 1.3 (Handle video)

3. Wait for validation results

─────────────────────────────────────────────────────
TIME: 12:30 PM

Agent 5 → YOU:
"Task 1.2 VALIDATED ✓
- All images < 500KB ✓
- WebP with PNG fallback ✓
- Visual quality maintained ✓
- Total 1.8MB ✓
APPROVED for merge to main."

YOU → Action:
Merge Agent 1's branch to main

─────────────────────────────────────────────────────
RESULT: 5 tasks completed in 3.5 hours
(Would take 13+ hours serially!)
```

---

## How Agents Don't Conflict

### Problem: What if two agents modify the same file?

**Solution: Domain separation + Git branching**

### Example Scenario:

**Agent 1 (Frontend)** modifies:
- `public/index.html` (removes inline scripts)
- `src/ui/components/DeviceFrame.js` (creates new file)

**Agent 3 (Core Logic)** modifies:
- `src/core/validators.js` (creates new file)
- `src/core/device-manager.js` (creates new file)

**Different files = No conflict!**

### What if they DO touch the same file?

**Example:** Both agents need to modify `package.json`

**Agent 2:** Adds security dependencies
```json
"dependencies": {
  "express": "^4.19.2",
  "helmet": "^7.0.0",      // Agent 2 added
  "dompurify": "^3.0.0"    // Agent 2 added
}
```

**Agent 4:** Adds build dependencies
```json
"devDependencies": {
  "vite": "^5.4.0",        // Agent 4 added
  "vitest": "^2.0.0"       // Agent 4 added
}
```

**Resolution:**
1. Both agents work in parallel (different worktrees)
2. Agent 2 finishes first → merged to main
3. Agent 4 finishes second → pulls main → auto-merges (different sections)
4. Testing Agent validates final result
5. If conflict: Testing Agent detects, requests resolution

---

## Dependency Management: How Tasks Wait for Each Other

Some tasks MUST wait for others:

### Example: Task 1.12 depends on Task 1.11

**Task 1.11:** Setup Vite (Agent 4 - Build Tooling)
**Task 1.12:** Migrate to ES Modules (Agent 3 + Agent 1)

**Workflow:**

```
TIME: 9:00 AM
YOU → @build-tooling-optimizer
"Execute Task 1.11: Setup Vite"

Agent 4 works...

TIME: 1:00 PM (4 hours later)
Agent 4 → YOU:
"Task 1.11 complete. Vite configured.
Dev server working. Production build tested."

YOU → @testing-qa-validator:
"Validate Task 1.11"

Agent 5 validates...

Agent 5 → YOU:
"Task 1.11 VALIDATED ✓"

YOU → Merge to main

─────────────────────────────────────────────────────
NOW Task 1.12 can start (dependency satisfied)

YOU → @core-business-logic:
"Execute Task 1.12: Migrate to ES Modules (core logic)"

YOU → @frontend-ui-specialist:
"Execute Task 1.12: Migrate to ES Modules (UI components)"

Both agents pull latest main (includes Vite config)
Both work in parallel on different parts
```

**Key:** Dependencies are managed by YOU (the orchestrator)
- You track which tasks are complete
- You don't assign dependent tasks until prerequisites done
- Agents work independently within their assignments

---

## Real-Time Progress Tracking

### How you monitor all 5 agents:

**Option 1: Agent Status Command**
```
YOU → @frontend-ui-specialist
"Status update"

Agent 1 →
"Task 1.2: Optimize images
Progress: 60% (4/6 images processed)
Current: Processing Verridian_logo_1.png
ETA: 30 minutes"
```

**Option 2: Todo List (Shared State)**

Update the todo list as agents complete tasks:

```
Task 1.1: ✅ Complete (Agent 4)
Task 1.2: 🟡 In Progress 60% (Agent 1)
Task 1.4: ✅ Complete (Agent 2)
Task 1.9: 🟡 In Progress 80% (Agent 3)
Task 1.15: ✅ Complete (Agent 5)
```

**Option 3: Git Branch Monitoring**
```bash
# Check all agent branches
git branch -vv

# See commits from agents
git log --all --oneline --graph
```

---

## Validation Flow: How Testing Agent Works

### Testing Agent is SPECIAL - validates everyone's work

**Flow:**

```
┌────────────────────────────────────────────┐
│ Agent 1 completes Task 1.2                 │
│ "Images optimized. Ready for validation."  │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│ YOU (Orchestrator)                         │
│ Routes request to Testing Agent            │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│ Agent 5 (Testing) Actions:                 │
│                                            │
│ 1. Pull Agent 1's branch                   │
│    git fetch origin agent/frontend-ui      │
│                                            │
│ 2. Merge to testing branch                 │
│    git merge origin/agent/frontend-ui      │
│                                            │
│ 3. Run validation checklist:               │
│    - Verify acceptance criteria            │
│    - Check file sizes                      │
│    - Test visual quality                   │
│    - Validate constitution compliance      │
│    - Run performance tests                 │
│                                            │
│ 4. Generate validation report              │
└────────────────────────────────────────────┘
              ↓
         APPROVED ✓
              ↓
┌────────────────────────────────────────────┐
│ YOU (Orchestrator)                         │
│ Merge Agent 1's branch to main             │
│ Notify other agents to sync with main      │
└────────────────────────────────────────────┘
```

### Testing Agent works on OTHER agents' code:

**Example validation session:**

```
YOU → @testing-qa-validator
"Validate Agent 1's Task 1.2: Optimize images
Branch: agent/frontend-ui
Review: Task acceptance criteria in tasks-phase1.md"

Agent 5 →
"Beginning validation of Task 1.2...

Pulling branch:
$ git fetch origin agent/frontend-ui
$ git merge origin/agent/frontend-ui

Checking file sizes:
✓ new_electronic_logo.png: 48KB (target: 50KB)
✓ Verridian_logo_1.png: 95KB (target: 100KB)
✓ gold_1.png: REMOVED (optimal choice)
✓ Total assets: 1.82MB (target: < 1.5MB - FAIL)

Visual quality test:
✓ Images display correctly
✓ No visual artifacts
✓ Responsive srcset working

Constitution compliance:
✓ Article II (Performance): Load time improved
✓ Article IX (Asset Management): Organized

RESULT: CONDITIONAL APPROVAL
Issue: Total assets 1.82MB (exceeds 1.5MB target by 320KB)

Recommendation:
- Optimize 2 more images: background1.png, background5.png
- OR: Accept 1.82MB (21% over budget but acceptable)

Awaiting orchestrator decision."

YOU → @frontend-ui-specialist
"Optimize background1.png and background5.png to meet target"

Agent 1 → (optimizes additional images)

Agent 1 →
"Additional optimization complete. Total now 1.48MB."

YOU → @testing-qa-validator
"Revalidate Task 1.2"

Agent 5 →
"Task 1.2 VALIDATED ✓
All criteria met. APPROVED for merge."
```

---

## Performance: Why 5 Agents = 5x Faster

### CPU/Memory Perspective:

**Your Machine Resources:**
- CPU: Modern multi-core (8-16 cores typical)
- RAM: 16-32GB typical
- Network: Handles multiple API calls simultaneously

**Each Agent Uses:**
- API calls to Claude (network-bound, not CPU-bound)
- File I/O (minimal CPU usage)
- Git operations (quick)

**Result:** Your machine can easily handle 5 agents working simultaneously!

### API Call Perspective:

**Claude Max Plan:**
- Unlimited API calls (no throttling)
- Each agent makes API calls independently
- No waiting for "tokens" or "rate limits"

**Analogy:**
```
Serial (1 agent):
API Call 1 → Wait → API Call 2 → Wait → API Call 3...

Parallel (5 agents):
API Call 1 ────────────┐
API Call 2 ────────────┤
API Call 3 ────────────┼─→ All happening simultaneously
API Call 4 ────────────┤
API Call 5 ────────────┘
```

### Real Time Savings:

**Task 1.2 (Agent 1):** 3 hours
**Task 1.4 (Agent 2):** 1 hour
**Task 1.9 (Agent 3):** 3 hours
**Task 1.1 (Agent 4):** 2 hours
**Task 1.15 (Agent 5):** 3 hours

**Serial (one after another):** 3 + 1 + 3 + 2 + 3 = **12 hours**
**Parallel (all at once):** Max(3, 1, 3, 2, 3) = **3 hours**

**Time saved:** 12 - 3 = **9 hours (75% faster!)**

---

## Summary: The Complete System

### What You Do (Orchestrator):
1. Assign tasks to agents
2. Route messages between agents
3. Make decisions when needed
4. Merge validated code to main
5. Track overall progress

### What Agents Do:
1. Work in isolated worktrees (no conflicts)
2. Follow their domain boundaries
3. Execute assigned tasks autonomously
4. Commit to their branches
5. Request validation when complete

### What Testing Agent Does:
1. Validate all other agents' work
2. Run tests and quality checks
3. Approve or reject based on criteria
4. Maintain quality gates
5. Ensure constitution compliance

### How It All Connects:
- **Git worktrees:** Separate file systems
- **Git branches:** Separate code versions
- **Claude Code agents:** Separate AI instances
- **YOU:** Central coordinator
- **Spec-Kit:** Shared methodology and specs

### Result:
- ✅ No merge conflicts (isolated worktrees)
- ✅ 5x faster development (parallel execution)
- ✅ High quality (Testing Agent validates)
- ✅ Constitution compliance (enforced)
- ✅ Clear progress tracking (todo list, git logs)

---

## Quick Mental Model

**Think of it like a construction site:**

**YOU = Foreman**
- Assign workers to different areas
- Coordinate between teams
- Approve completed work
- Manage overall project

**Agents = Specialized Workers**
- Agent 1: Interior designer (UI/UX)
- Agent 2: Electrician + Plumber (Backend/Infrastructure)
- Agent 3: Structural engineer (Core Logic)
- Agent 4: Architect (Build System)
- Agent 5: Building inspector (Testing/QA)

**Worktrees = Different Building Areas**
- Each worker has their own space
- No stepping on each other's toes
- All connected to same building (Git repo)

**Testing Agent = Inspector**
- Checks everyone's work
- Must approve before moving to next phase
- Ensures building codes (constitution) followed

**THIS is how 5 agents work in parallel! 🚀**