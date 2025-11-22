# DevFlow MCP: Visual Architecture & Quick Reference

**A visual guide to understanding DevFlow's four-layer architecture.**

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AI Agent (Claude, Cursor, Zed, etc.)           │
│                                                                         │
│  Receives unified context via MCP resources at session start           │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ MCP Protocol
                                      │ (stdio / HTTP+SSE)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DevFlow MCP Server                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Unified Context Manager                       │  │
│  │  • Aggregates context from all 4 layers                         │  │
│  │  • Handles cross-layer linking and validation                   │  │
│  │  • Manages consistency checks                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────────────┐│
│  │   Layer 1   │   Layer 2   │   Layer 3   │      Layer 4            ││
│  │    RULES    │   MEMORY    │    DOCS     │     PLANNING            ││
│  │             │             │             │                         ││
│  │ Standards   │ Continuity  │ Knowledge   │   Task Management       ││
│  │ Enforcement │ & Decisions │   Base      │   with Validation       ││
│  └─────────────┴─────────────┴─────────────┴─────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ File System Operations
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Project Repository (.devflow/)                   │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ rules/       │  │ memory/      │  │ docs/    │  │ plans/         │ │
│  │  *.mdc       │  │  *.md        │  │  *.md    │  │  *.json        │ │
│  └──────────────┘  └──────────────┘  └──────────┘  └────────────────┘ │
│                                                                         │
│  All files are git-friendly (markdown, JSON) for version control       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Interactions Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AGENT WORKFLOW EXAMPLE                          │
│              "I need to implement OAuth authentication"                 │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
      ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
      │   1. PLANNING    │  │   2. RULES       │  │   3. MEMORY      │
      │   Create plan    │  │   Check active   │  │   Review past    │
      │   with tasks     │  │   auth rules     │  │   decisions      │
      └──────────────────┘  └──────────────────┘  └──────────────────┘
                │                     │                     │
                │                     │                     │
                └─────────────────────┴─────────────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   4. DOCUMENTATION     │
                          │   Read architecture    │
                          │   docs on auth         │
                          └────────────────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   5. IMPLEMENTATION    │
                          │   Agent writes code    │
                          │   following rules      │
                          └────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
      ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
      │   6. VALIDATION  │  │   7. MEMORY      │  │   8. DOCS        │
      │   Auto-validate  │  │   Log decision   │  │   Update API     │
      │   task complete  │  │   & progress     │  │   reference      │
      └──────────────────┘  └──────────────────┘  └──────────────────┘
                │                     │                     │
                └─────────────────────┴─────────────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   9. CONSISTENCY       │
                          │   Validate cross-layer │
                          │   references intact    │
                          └────────────────────────┘
```

---

## Data Flow: Cross-Layer Linking

```
┌────────────────────────────────────────────────────────────────┐
│                      BIDIRECTIONAL LINKING                     │
└────────────────────────────────────────────────────────────────┘

    RULES                    MEMORY                  DOCS               PLANNING
      │                        │                       │                   │
      │  linkedDecisions       │                       │                   │
      │────────────────────────▶                       │                   │
      │                        │  relatedRules         │                   │
      │◀────────────────────────                       │                   │
      │                        │                       │                   │
      │  linkedDocs            │  relatedDocs          │                   │
      │────────────────────────┼───────────────────────▶                   │
      │                        │                       │  enforced_by      │
      │◀────────────────────────┴───────────────────────                   │
      │                        │                       │                   │
      │                        │  relatedPlans         │                   │
      │                        │───────────────────────┼──────────────────▶│
      │                        │                       │  relatedDecisions │
      │                        │◀──────────────────────┴───────────────────│
      │                        │                       │                   │
      └────────────────────────┴───────────────────────┴───────────────────┘

Example Cross-References:
• Rule "auth-token-handling" → Decision #47 → Doc "architecture/authentication.md"
• Plan "feature-123" → Decision #47 → Rule "auth-token-handling"
• Doc "api/auth.md" → Rule "auth-token-handling" (enforced_by)
```

---

## MCP Primitives Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MCP PRIMITIVES                                │
└─────────────────────────────────────────────────────────────────────────┘

RESOURCES (Auto-Loaded Context)
├─ devflow://context/unified ───────── All layers summary
├─ devflow://context/rules ────────── Active rules summary
├─ devflow://context/memory ───────── Current focus & decisions
├─ devflow://plans/active ─────────── Active plans summary
├─ devflow://docs/* ───────────────── Individual documentation files
├─ devflow://rules/{id} ───────────── Individual rule content
├─ devflow://memory/decision/{id} ── Individual decision content
└─ devflow://plans/{plan-id} ──────── Individual plan with tasks

TOOLS (Actionable Operations)
├─ RULES
│  ├─ rules:create ─────────────── Create new rule
│  ├─ rules:update ─────────────── Modify existing rule
│  ├─ rules:validate ───────────── Check code against rules
│  ├─ rules:activate ───────────── Enable manual rule
│  ├─ rules:import ─────────────── Import from .cursorrules, etc.
│  └─ rules:export ─────────────── Export to agent format
│
├─ MEMORY
│  ├─ memory:context:set ───────── Update current focus
│  ├─ memory:decision:log ──────── Log architectural decision
│  ├─ memory:blocker:add ───────── Add blocker
│  ├─ memory:blocker:resolve ───── Resolve blocker
│  ├─ memory:change:log ────────── Log significant change
│  ├─ memory:progress:task ─────── Update task progress
│  └─ memory:recall ────────────── Semantic search (Phase 2)
│
├─ DOCUMENTATION
│  ├─ doc:create ───────────────── Create new doc from template
│  ├─ doc:update ───────────────── Update existing doc
│  ├─ doc:validate ─────────────── Check quality & consistency
│  ├─ doc:consistency:check ────── Check terminology
│  ├─ doc:optimize:llm ─────────── Optimize for specific LLM
│  └─ doc:search ───────────────── Search documentation
│
├─ PLANNING
│  ├─ plan:create ──────────────── Create feature plan
│  ├─ plan:task:add ────────────── Add task to plan
│  ├─ plan:task:update ─────────── Update task status
│  ├─ plan:task:validate ───────── Validate task completion
│  ├─ plan:milestone:create ────── Add milestone
│  ├─ plan:metrics ─────────────── Get progress analytics
│  └─ plan:dependencies ────────── Visualize task dependencies
│
└─ INTEGRATION
   ├─ sync:validate ────────────── Check cross-layer consistency
   └─ sync:fix ─────────────────── Attempt automatic fixes

PROMPTS (Workflow Templates)
├─ init_session ────────────────── Session initialization
├─ plan_feature ────────────────── Guided feature planning
├─ decision_template ───────────── Decision logging guide
├─ create_documentation ────────── Doc creation wizard
├─ task_breakdown ──────────────── Decompose complex task
└─ onboarding_summary ──────────── New team member onboarding
```

---

## File Structure Overview

```
project-root/
│
├── .devflow/                      # DevFlow data directory
│   │
│   ├── rules/                     # Layer 1: Rules
│   │   ├── global/                # Always-active rules
│   │   │   ├── typescript-standards.mdc
│   │   │   ├── git-conventions.mdc
│   │   │   └── security-guidelines.mdc
│   │   ├── contextual/            # Pattern-matched rules
│   │   │   ├── api-patterns.mdc
│   │   │   └── react-hooks.mdc
│   │   └── manual/                # On-demand rules
│   │       └── performance-optimization.mdc
│   │
│   ├── memory/                    # Layer 2: Memory
│   │   ├── activeContext.md       # Current focus (last 7 days)
│   │   ├── progress.md            # Work history & milestones
│   │   ├── decisionLog.md         # Architectural decisions
│   │   ├── projectContext.md      # Project overview
│   │   └── .index/                # Optional SQLite (Phase 2)
│   │       └── memory.db
│   │
│   └── plans/                     # Layer 4: Planning
│       ├── active/                # Current plans
│       │   ├── feature-123.json
│       │   └── feature-124.json
│       ├── completed/             # Archived plans
│       │   └── feature-100.json
│       └── templates/             # Plan templates
│           ├── small.json
│           ├── medium.json
│           ├── large.json
│           └── xl.json
│
├── docs/                          # Layer 3: Documentation
│   ├── api/                       # API references
│   │   ├── authentication.md
│   │   └── users.md
│   ├── architecture/              # System design
│   │   ├── overview.md
│   │   └── authentication.md
│   ├── guides/                    # Tutorials
│   │   ├── getting-started.md
│   │   └── deployment.md
│   ├── .templates/                # Doc templates
│   │   ├── api-template.md
│   │   ├── architecture-template.md
│   │   └── guide-template.md
│   └── .meta/                     # Validation metadata
│       ├── terminology.json
│       └── validation-rules.json
│
├── src/                           # Your application code
│   └── ...
│
└── package.json
```

---

## Automatic Task Validation Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│              TASK VALIDATION ENGINE (Unique to DevFlow)        │
└────────────────────────────────────────────────────────────────┘

When task status changes to "completed":

  ┌─────────────────────────────────────────────────────────┐
  │  1. FILE CHANGE DETECTION                               │
  │  • Git log since task start                             │
  │  • Files created/modified                               │
  │  • Line changes (additions/deletions)                   │
  └─────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌─────────────────────────────────────────────────────────┐
  │  2. TEST EXECUTION                                      │
  │  • Run test suite                                       │
  │  • Measure code coverage                                │
  │  • Check test results (pass/fail)                       │
  └─────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌─────────────────────────────────────────────────────────┐
  │  3. STATIC ANALYSIS                                     │
  │  • ESLint/TSLint checks                                 │
  │  • TypeScript type checking                             │
  │  • Code quality metrics                                 │
  └─────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌─────────────────────────────────────────────────────────┐
  │  4. GIT COMMIT ANALYSIS                                 │
  │  • Commits since task start                             │
  │  • Task ID references                                   │
  │  • Commit message quality                               │
  └─────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌─────────────────────────────────────────────────────────┐
  │  5. RULES VALIDATION                                    │
  │  • Check changed files against active rules             │
  │  • Report violations                                    │
  │  • Adjust confidence score                              │
  └─────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌─────────────────────────────────────────────────────────┐
  │  6. CONFIDENCE SCORING                                  │
  │  • Required files present: 20%                          │
  │  • Required tests exist: 25%                            │
  │  • Tests passing: 25%                                   │
  │  • Linting passed: 10%                                  │
  │  • Type checking passed: 10%                            │
  │  • Git commit with task ref: 10%                        │
  │  ────────────────────────────                           │
  │  Total Confidence: 0-100%                               │
  └─────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌─────────────────────────────────────────────────────────┐
  │  7. RESULT                                              │
  │  • 0.0-0.3: Not started                                 │
  │  • 0.3-0.6: In progress                                 │
  │  • 0.6-0.8: Nearly complete                             │
  │  • 0.8-0.95: Complete with high confidence              │
  │  • 0.95-1.0: Complete, all criteria met ✓               │
  └─────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Common Commands

### Rules Layer
```typescript
// Create a rule
rules:create({ name, type: "always", priority: 8, content })

// Validate code
rules:validate({ filePath: "src/auth/session.ts" })

// Export to Cursor
rules:export({ target: "cursorrules" })
```

### Memory Layer
```typescript
// Update current focus
memory:context:set({ focus, task, files })

// Log decision
memory:decision:log({ title, decision, rationale, alternatives })

// Add blocker
memory:blocker:add({ title, severity: "high", impact })
```

### Documentation Layer
```typescript
// Create docs
doc:create({ type: "api", title, category })

// Validate quality
doc:validate({ path: "docs/api/auth.md" })

// Optimize for LLM
doc:optimize:llm({ path, model: "claude" })
```

### Planning Layer
```typescript
// Create plan
plan:create({ name, size: "medium", milestones })

// Update task
plan:task:update({ planId, taskId, status: "completed" })

// Validate task (auto)
plan:task:validate({ planId, taskId })
```

### Integration
```typescript
// Check consistency
sync:validate()

// Get unified context
// Resource: devflow://context/unified
```

---

## Confidence Score Breakdown

```
┌────────────────────────────────────────────────────────────┐
│           TASK COMPLETION CONFIDENCE FORMULA               │
└────────────────────────────────────────────────────────────┘

Confidence = Σ(criterion_met × weight)

WEIGHTS:
├─ Required files present ────────── 0.20 (20%)
├─ Required tests exist ─────────── 0.25 (25%)
├─ Tests passing ────────────────── 0.25 (25%)
├─ Linting passed ───────────────── 0.10 (10%)
├─ Type checking passed ─────────── 0.10 (10%)
└─ Git commit with task ref ─────── 0.10 (10%)
                                     ──────
                         Total:      1.00 (100%)

EXAMPLE CALCULATION:
Task: "Implement SessionManager class"
├─ ✓ Required files (session.ts, session.test.ts) → 0.20
├─ ✓ Required tests (create, retrieve, delete, expire) → 0.25
├─ ✓ Tests passing (12/12 passed) → 0.25
├─ ✓ Linting passed (0 errors) → 0.10
├─ ✓ Type checking passed (0 errors) → 0.10
└─ ✓ Git commit "#task-458 implement SessionManager" → 0.10
                                                        ──────
                                          Confidence:   1.00 ✓

INTERPRETATION:
• 1.00 (100%) = All criteria met, high confidence ✓
• 0.85 (85%)  = Most criteria met, very good
• 0.60 (60%)  = Some criteria met, needs work
• 0.30 (30%)  = Minimal progress, in early stages
• 0.00 (0%)   = Not started
```

---

## Agent Compatibility Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                    SUPPORTED AI AGENTS                           │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┬──────────┬──────────────┬─────────────────────┐
│ Agent/Platform  │ Protocol │ Format       │ DevFlow Support     │
├─────────────────┼──────────┼──────────────┼─────────────────────┤
│ Claude Desktop  │ stdio    │ Native MCP   │ ✅ Full (native)    │
│ Zed             │ stdio    │ Native MCP   │ ✅ Full (native)    │
│ Cursor          │ -        │ .cursorrules │ ✅ Via export       │
│ VSCode Copilot  │ -        │ AGENTS.md    │ ✅ Via export       │
│ Windsurf        │ stdio    │ Native MCP   │ ✅ Full (native)    │
│ Continue.dev    │ stdio    │ Native MCP   │ ✅ Full (native)    │
│ Custom MCP      │ stdio/   │ Native MCP   │ ✅ Full (native)    │
│                 │ HTTP+SSE │              │                     │
└─────────────────┴──────────┴──────────────┴─────────────────────┘

NATIVE MCP AGENTS:
• Full feature support (resources, tools, prompts)
• Auto-loading of unified context
• Real-time validation and feedback

EXPORT-BASED AGENTS:
• Rules exported to agent-specific format
• Manual sync required (run: rules:export)
• Limited to rules layer only
```

---

## Performance Targets

```
┌────────────────────────────────────────────────────────────┐
│                   PERFORMANCE GOALS                        │
└────────────────────────────────────────────────────────────┘

CONTEXT LOADING (Session Start)
├─ Unified context resource ─────────── < 100ms
├─ Rules summary ────────────────────── < 50ms
├─ Memory active context ────────────── < 50ms
├─ Plans active summary ─────────────── < 50ms
└─ Total session initialization ────── < 250ms

TOOL EXECUTION
├─ rules:validate (single file) ────── < 200ms
├─ memory:decision:log ─────────────── < 100ms
├─ doc:create ──────────────────────── < 150ms
├─ plan:task:update ────────────────── < 300ms (includes validation)
└─ sync:validate (all layers) ─────── < 1000ms

FILE OPERATIONS
├─ Read single file ────────────────── 2-5ms
├─ Write single file ───────────────── 10-20ms
├─ Parse .mdc frontmatter ──────────── 1-3ms
└─ JSON plan parse ─────────────────── 1-2ms

PHASE 2 (SQLite Indexing)
├─ Semantic search ─────────────────── < 10ms
├─ Full-text search ────────────────── < 5ms
└─ Index rebuild ───────────────────── < 1000ms
```

---

## Comparison: DevFlow vs. Existing Solutions

```
┌──────────────────────────────────────────────────────────────────┐
│              FEATURE COMPARISON MATRIX                           │
└──────────────────────────────────────────────────────────────────┘

FEATURE                   │ Cline │ SW Plan │ DevFlow │
                          │ Memory│   MCP   │   MCP   │
──────────────────────────┼───────┼─────────┼─────────┤
Memory System             │  ✅   │   ❌    │   ✅    │ 4-file structure
Task Planning             │  ❌   │   ✅    │   ✅    │ With milestones
Auto Task Validation      │  ❌   │   ❌    │   ✅    │ File/test/git
Documentation Mgmt        │  ❌   │   ❌    │   ✅    │ AI-optimized
Rules Engine              │  ❌   │   ❌    │   ✅    │ Cross-agent
Decision Logging          │  ✅   │   ❌    │   ✅    │ With rationale
Cross-Layer Linking       │  N/A  │   N/A   │   ✅    │ Bidirectional
Consistency Validation    │  N/A  │   ❌    │   ✅    │ Multi-layer
Complexity Scoring        │  N/A  │   ✅    │   ✅    │ 1-10 scale
Dependency Management     │  N/A  │   ✅    │   ✅    │ Full DAG
Git-Friendly Storage      │  ✅   │   ✅    │   ✅    │ Markdown/JSON
Agent Compatibility       │  ❌   │   ✅    │   ✅    │ Universal
──────────────────────────┴───────┴─────────┴─────────┘

KEY DIFFERENTIATOR:
DevFlow is the ONLY solution that combines:
• Memory persistence (like Cline)
• Task planning (like Software Planning MCP)
• Automatic validation (unique to DevFlow)
• Cross-layer integration (unique to DevFlow)
```

---

## Next Steps

### For New Users
1. Read [00-OVERVIEW.md](./00-OVERVIEW.md) - Understand the vision
2. Read [README.md](./README.md) - Quick start guide
3. Try example workflows in [09-EXAMPLES.md](./09-EXAMPLES.md)

### For Developers
1. Study [08-IMPLEMENTATION.md](./08-IMPLEMENTATION.md) - Technical details
2. Review [06-MCP-PRIMITIVES.md](./06-MCP-PRIMITIVES.md) - API reference
3. Check [07-AGENT-COMPATIBILITY.md](./07-AGENT-COMPATIBILITY.md) - Integration

### For Contributors
1. Review the roadmap in [00-OVERVIEW.md](./00-OVERVIEW.md)
2. Identify areas to contribute
3. Follow the modular architecture principles

---

**This visual guide provides a high-level overview. Dive into specific layer documentation for detailed specifications.**