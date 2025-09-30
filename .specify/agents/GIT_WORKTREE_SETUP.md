# Git Worktree Setup for Multi-Agent Development

**Project:** Mobile Emulator Platform
**Strategy:** Each agent works in isolated worktree, merges to main after validation
**Agents:** 5 parallel agents with dedicated branches

---

## Why Git Worktrees?

**Problem:** 5 agents working in parallel on same codebase = merge conflicts

**Solution:** Git worktrees = separate working directories, same repo
- Each agent has isolated filesystem
- No conflicts during development
- Testing Agent validates before merge to main
- Clean, linear git history

---

## Step 1: Initialize Git Repository

### If not already a git repo:

```bash
cd "C:\Users\Danie\Desktop\Mobile emulater"

# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Test coverage
coverage/

# Temporary
*.tmp
*.temp
EOF

# Initial commit
git add .
git commit -m "Initial commit: Mobile Emulator Platform with Spec-Kit structure

- Complete spec-kit specifications (.specify/)
- Constitution with 9 articles
- 20 tasks defined for Phase 1
- 5 agent architecture documented
- Current codebase (needs optimization)

Phase 1 Goal: Production-ready emulator in 5 days"
```

---

## Step 2: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if needed
# Download from: https://cli.github.com/

# Login to GitHub
gh auth login
# Follow prompts: HTTPS, Login with browser

# Create repository
gh repo create mobile-emulator-platform \
  --private \
  --description "Internal development tool for testing mobile and web apps with device emulation" \
  --source=. \
  --remote=origin \
  --push

# Verify
gh repo view
```

### Option B: Manual Setup (GitHub Web UI)

1. Go to https://github.com/new
2. Repository name: `mobile-emulator-platform`
3. Description: "Internal development tool for testing mobile and web apps"
4. Visibility: **Private** (internal tool)
5. Do NOT initialize with README (we have files)
6. Click "Create repository"

Then connect:
```bash
git remote add origin https://github.com/YOUR_USERNAME/mobile-emulator-platform.git
git branch -M main
git push -u origin main
```

---

## Step 3: Create Agent Branches

```bash
# Create and push branches for each agent
git branch agent/frontend-ui
git branch agent/backend-infrastructure
git branch agent/core-business-logic
git branch agent/build-tooling
git branch agent/testing-qa

# Push all branches
git push -u origin agent/frontend-ui
git push -u origin agent/backend-infrastructure
git push -u origin agent/core-business-logic
git push -u origin agent/build-tooling
git push -u origin agent/testing-qa

# Verify branches
git branch -a
```

---

## Step 4: Create Worktrees for Each Agent

### Create worktree directory structure:

```bash
# Create worktrees directory
mkdir -p ../mobile-emulator-worktrees

# Create worktree for each agent
git worktree add ../mobile-emulator-worktrees/frontend-ui agent/frontend-ui
git worktree add ../mobile-emulator-worktrees/backend-infrastructure agent/backend-infrastructure
git worktree add ../mobile-emulator-worktrees/core-business-logic agent/core-business-logic
git worktree add ../mobile-emulator-worktrees/build-tooling agent/build-tooling
git worktree add ../mobile-emulator-worktrees/testing-qa agent/testing-qa

# Verify worktrees
git worktree list
```

**Result:**
```
C:\Users\Danie\Desktop\Mobile emulater                            [main]
C:\Users\Danie\Desktop\mobile-emulator-worktrees\frontend-ui     [agent/frontend-ui]
C:\Users\Danie\Desktop\mobile-emulator-worktrees\backend-infrastructure [agent/backend-infrastructure]
C:\Users\Danie\Desktop\mobile-emulator-worktrees\core-business-logic [agent/core-business-logic]
C:\Users\Danie\Desktop\mobile-emulator-worktrees\build-tooling   [agent/build-tooling]
C:\Users\Danie\Desktop\mobile-emulator-worktrees\testing-qa      [agent/testing-qa]
```

---

## Step 5: Configure Each Agent with Their Worktree

### Tell each agent to work in their dedicated worktree:

**Agent 1 (Frontend UI Specialist):**
```
@frontend-ui-specialist

Your isolated working directory:
C:\Users\Danie\Desktop\mobile-emulator-worktrees\frontend-ui

Branch: agent/frontend-ui

All your work (Tasks 1.2, 1.3, 1.7, 1.12) should be done in this directory.

Git workflow:
1. cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\frontend-ui
2. Make changes
3. git add [files]
4. git commit -m "Task 1.2: Optimize images - reduced 95MB to 1.8MB"
5. git push origin agent/frontend-ui

When task complete, hand off to @testing-qa-validator for validation.

Confirm you understand your working directory.
```

**Agent 2 (Backend & Infrastructure):**
```
@backend-infrastructure

Your isolated working directory:
C:\Users\Danie\Desktop\mobile-emulator-worktrees\backend-infrastructure

Branch: agent/backend-infrastructure

All your work (Tasks 1.4, 1.6, 1.8, 1.13, 1.14) should be done in this directory.

Git workflow:
1. cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\backend-infrastructure
2. Make changes
3. git add [files]
4. git commit -m "Task 1.4: Install security dependencies - helmet, dompurify"
5. git push origin agent/backend-infrastructure

Confirm you understand your working directory.
```

**Agent 3 (Core Business Logic):**
```
@core-business-logic

Your isolated working directory:
C:\Users\Danie\Desktop\mobile-emulator-worktrees\core-business-logic

Branch: agent/core-business-logic

All your work (Tasks 1.5, 1.7, 1.9, 1.10, 1.12) should be done in this directory.

Git workflow:
1. cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\core-business-logic
2. Make changes
3. git add [files]
4. git commit -m "Task 1.5: Implement URL validation with DOMPurify"
5. git push origin agent/core-business-logic

Confirm you understand your working directory.
```

**Agent 4 (Build & Tooling):**
```
@build-tooling-optimizer

Your isolated working directory:
C:\Users\Danie\Desktop\mobile-emulator-worktrees\build-tooling

Branch: agent/build-tooling

All your work (Tasks 1.1, 1.11, 1.18, 1.20) should be done in this directory.

Git workflow:
1. cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\build-tooling
2. Make changes
3. git add [files]
4. git commit -m "Task 1.11: Setup Vite build system"
5. git push origin agent/build-tooling

Confirm you understand your working directory.
```

**Agent 5 (Testing & QA):**
```
@testing-qa-validator

Your isolated working directory:
C:\Users\Danie\Desktop\mobile-emulator-worktrees\testing-qa

Branch: agent/testing-qa

All your work (Tasks 1.15, 1.16, 1.17, 1.19) should be done in this directory.

Git workflow:
1. cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\testing-qa
2. Make changes
3. git add [files]
4. git commit -m "Task 1.15: Setup Vitest and Playwright"
5. git push origin agent/testing-qa

SPECIAL ROLE: Validation and Merging

When validating other agents' work:
1. Pull their branch: git fetch origin agent/[agent-name]
2. Merge to your branch: git merge origin agent/[agent-name]
3. Run tests: pnpm test
4. If tests pass → APPROVE for merge to main
5. If tests fail → REJECT and request fixes

Confirm you understand your working directory and validation role.
```

---

## Step 6: Merge Strategy

### When a task is validated and approved:

**Testing Agent validates → You (orchestrator) merge to main**

```bash
# Switch to main branch
cd "C:\Users\Danie\Desktop\Mobile emulater"
git checkout main

# Pull latest
git pull origin main

# Merge agent branch (after Testing Agent approval)
git merge --no-ff agent/frontend-ui -m "Merge Task 1.2: Image optimization (93% size reduction)

Validated by: @testing-qa-validator
- All images < 500KB
- Visual quality maintained
- Total assets: 95MB → 1.8MB
- Constitution Article II compliance ✓"

# Push to main
git push origin main

# Update other agents' branches with merged changes
git checkout agent/backend-infrastructure
git merge main
git push origin agent/backend-infrastructure

# Repeat for all agent branches
```

---

## Step 7: Pull Request Workflow (Optional, Recommended for Teams)

### If you want PR-based workflow:

**Agent completes task:**
```bash
cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\frontend-ui
git push origin agent/frontend-ui
```

**Create PR:**
```bash
gh pr create \
  --base main \
  --head agent/frontend-ui \
  --title "Task 1.2: Optimize Large PNG Images" \
  --body "## Summary
- Optimized 6 PNG images: 95MB → 1.8MB
- Used Sharp.js with WebP conversion
- Implemented responsive srcset
- Visual quality maintained

## Validation
- [x] All images < 500KB
- [x] WebP with PNG fallback
- [x] Total assets < 1.5MB
- [x] Visual quality test passed

## Testing Agent Approval
@testing-qa-validator validated: APPROVED ✓

## Constitution Compliance
- Article II (Performance): Load time improved 93% ✓
- Article IX (Asset Management): Optimized, organized ✓"
```

**Review and merge:**
```bash
# List PRs
gh pr list

# Review specific PR
gh pr view 1

# Merge if approved
gh pr merge 1 --squash --delete-branch
```

---

## Worktree Management Commands

### Useful commands:

```bash
# List all worktrees
git worktree list

# Remove a worktree (if needed)
git worktree remove ../mobile-emulator-worktrees/frontend-ui

# Prune deleted worktrees
git worktree prune

# Move worktree (if needed)
git worktree move <old-path> <new-path>

# Lock worktree (prevent deletion)
git worktree lock ../mobile-emulator-worktrees/frontend-ui

# Unlock worktree
git worktree unlock ../mobile-emulator-worktrees/frontend-ui
```

### Sync all agents with main:

```bash
# Script to sync all agent branches with main
for branch in agent/frontend-ui agent/backend-infrastructure agent/core-business-logic agent/build-tooling agent/testing-qa; do
  git checkout $branch
  git merge main
  git push origin $branch
done

git checkout main
```

---

## GitHub Project Board Setup (Recommended)

### Create project board for tracking:

```bash
gh project create --owner @me --title "Mobile Emulator - Phase 1"

# Or manually:
# 1. Go to GitHub repository
# 2. Click "Projects" tab
# 3. Click "New project"
# 4. Choose "Board" template
# 5. Name: "Phase 1 - Foundation & Critical Fixes"
```

### Add columns:
- **Backlog** (all 20 tasks)
- **In Progress** (agent currently working)
- **Validation** (Testing Agent reviewing)
- **Approved** (ready to merge)
- **Done** (merged to main)

### Add issues for each task:

```bash
# Create issue for Task 1.2
gh issue create \
  --title "Task 1.2: Optimize Large PNG Images" \
  --body "Agent: @frontend-ui-specialist
Priority: P0
Time: 3 hours

Targets:
- new_electronic_logo.png: 7.9MB → 50KB
- Verridian_logo_1.png: 18.9MB → 100KB
- Total: 95MB → < 1.5MB

Acceptance Criteria:
- [ ] All images < 500KB
- [ ] WebP with PNG fallback
- [ ] Visual quality maintained
- [ ] Responsive srcset implemented

Constitution: Article II (Performance), Article IX (Assets)" \
  --assignee YOUR_USERNAME \
  --label "frontend,optimization,phase-1"
```

---

## Directory Structure After Setup

```
Desktop/
├── Mobile emulater/              # Main repo (your orchestration center)
│   ├── .git/                     # Git repository
│   ├── .specify/                 # Spec-kit specifications
│   ├── public/                   # Current codebase
│   ├── server.js
│   └── package.json
│
└── mobile-emulator-worktrees/    # Agent working directories
    ├── frontend-ui/              # Agent 1's isolated workspace
    ├── backend-infrastructure/   # Agent 2's isolated workspace
    ├── core-business-logic/      # Agent 3's isolated workspace
    ├── build-tooling/            # Agent 4's isolated workspace
    └── testing-qa/               # Agent 5's isolated workspace
```

---

## Agent Workflow Summary

### For each agent:

1. **Work in your worktree:** `cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\[your-worktree]`
2. **Make changes:** Implement your assigned task
3. **Commit frequently:** `git commit -m "Task X.Y: Progress update"`
4. **Push to your branch:** `git push origin agent/[your-agent]`
5. **Request validation:** Hand off to @testing-qa-validator
6. **After approval:** Orchestrator merges to main
7. **Sync with main:** `git pull origin main`

### For Testing Agent (special role):

1. **Pull agent branch:** `git fetch origin agent/[agent-name]`
2. **Merge to your branch:** `git merge origin agent/[agent-name]`
3. **Run validation:** Tests, coverage, constitution compliance
4. **Approve or reject:** Report to orchestrator
5. **If approved:** Orchestrator merges to main

---

## Troubleshooting

### Merge conflicts:

```bash
# If conflict occurs during merge
git status  # See conflicted files

# Resolve conflicts manually, then:
git add [resolved-files]
git commit -m "Resolved merge conflicts"
git push origin [branch-name]
```

### Worktree out of sync:

```bash
cd C:\Users\Danie\Desktop\mobile-emulator-worktrees\[worktree]
git fetch origin
git merge origin/main
git push origin agent/[agent-name]
```

### Need to reset agent branch:

```bash
git checkout agent/[agent-name]
git reset --hard origin/main
git push --force origin agent/[agent-name]
```

---

## Quick Start Commands (Copy-Paste Ready)

### Setup Script (Run once):

```bash
cd "C:\Users\Danie\Desktop\Mobile emulater"

# Initialize git if needed
git init
git add .
git commit -m "Initial commit: Spec-Kit structure"

# GitHub login
gh auth login

# Create GitHub repo
gh repo create mobile-emulator-platform --private --source=. --remote=origin --push

# Create agent branches
git branch agent/frontend-ui && git push -u origin agent/frontend-ui
git branch agent/backend-infrastructure && git push -u origin agent/backend-infrastructure
git branch agent/core-business-logic && git push -u origin agent/core-business-logic
git branch agent/build-tooling && git push -u origin agent/build-tooling
git branch agent/testing-qa && git push -u origin agent/testing-qa

# Create worktrees
mkdir -p ../mobile-emulator-worktrees
git worktree add ../mobile-emulator-worktrees/frontend-ui agent/frontend-ui
git worktree add ../mobile-emulator-worktrees/backend-infrastructure agent/backend-infrastructure
git worktree add ../mobile-emulator-worktrees/core-business-logic agent/core-business-logic
git worktree add ../mobile-emulator-worktrees/build-tooling agent/build-tooling
git worktree add ../mobile-emulator-worktrees/testing-qa agent/testing-qa

# Verify
git worktree list
gh repo view
```

---

## You're Ready! 🚀

**Next Steps:**
1. Run setup script above
2. Tell each agent their worktree location
3. Agents start working in parallel
4. Testing Agent validates
5. You merge approved work to main

**No more merge conflicts. Clean parallel development. Let's go! 💪**