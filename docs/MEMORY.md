# Memory System

**Session continuity, architectural decisions, and progress tracking that persists across conversations.**

## Overview

The Memory layer solves the fundamental problem of AI agents forgetting context between sessions. Inspired by Cline's memory bank architecture, DevFlow Memory provides a structured, git-friendly system for maintaining conversation continuity, logging decisions, and tracking progress over time.

## Design Principles

### 1. Human-Readable Storage

All memory stored as markdown files - readable in any editor, diffable in git, no proprietary formats.

### 2. Four-File Architecture

Separation of concerns across distinct files:

- **activeContext.md**: What's happening right now
- **progress.md**: What's been done, what's next
- **decisionLog.md**: Why things are the way they are
- **projectContext.md**: High-level project overview

### 3. Hybrid Performance

- **Phase 1**: Pure markdown (simple, git-friendly)
- **Phase 2**: SQLite indexing (semantic search, ~5ms queries)
- Markdown remains source of truth

### 4. Automatic Staleness Detection

Memory tracks timestamps and file hashes to detect outdated information.

## File Structure

```
.devflow/
└── memory/
    ├── activeContext.md      # Current focus, blockers, recent changes
    ├── progress.md           # Completed work, in-progress, next steps
    ├── decisionLog.md        # Architectural decisions with rationale
    ├── projectContext.md     # High-level overview and constraints
    └── .index/               # Optional SQLite indexes (Phase 2)
        └── memory.db
```

## File Specifications

### activeContext.md

**Purpose:** Current work focus, blockers, and recent changes (last 7 days).

**Structure:**

```markdown
# Active Context

**Last Updated:** 2024-03-20T14:30:00Z

## Current Focus

Working on OAuth authentication implementation

- Task: Implement session middleware (Plan: feature-123, Task: task-456)
- Branch: feature/oauth-session-handling
- Files: src/auth/session.ts, src/middleware/auth.ts

## Active Blockers

### Blocker: Redis connection configuration

**Severity:** High  
**Since:** 2024-03-19  
**Impact:** Cannot test session persistence  
**Waiting On:** DevOps team to provision Redis instance  
**Workaround:** Using in-memory store for local development

## Recent Changes (Last 7 Days)

### 2024-03-20: Session middleware scaffolding

- Created `src/auth/session.ts` with SessionManager class
- Added Redis client configuration
- Updated API routes to use session middleware
- **Related Decision:** #47 (Session-based auth)

### 2024-03-19: OAuth provider integration

- Integrated Passport.js for OAuth flow
- Configured Google and GitHub providers
- Added callback routes
- **Files Changed:** 8 files, +450 lines

### 2024-03-18: Authentication architecture decision

- Decided on session-based auth over JWT
- See Decision Log #47 for rationale
- Updated architecture docs

## Context Notes

- Testing strategy: Unit tests for session logic, integration tests for full OAuth flow
- Performance consideration: Session lookups must be < 50ms
- Security: All cookies must have httpOnly, secure, sameSite flags
```

**Update Triggers:**

- New task started
- Blocker encountered/resolved
- Significant file changes
- Daily summary (automatic)

**Retention:** Keep last 30 days, archive older entries to `progress.md`

### progress.md

**Purpose:** Long-term work history, milestones, and roadmap.

**Structure:**

```markdown
# Project Progress

**Project Started:** 2024-01-10  
**Last Updated:** 2024-03-20T14:30:00Z

## Current Milestone: User Authentication (75% complete)

**Target:** 2024-03-25  
**Plan:** feature-123

### Completed Tasks (7/9)

- ✅ Research authentication strategies (2024-02-15)
- ✅ Design session architecture (2024-02-20)
- ✅ Set up Passport.js integration (2024-03-10)
- ✅ Implement OAuth providers (2024-03-19)
- ✅ Create session middleware (2024-03-20)
- ✅ Add CSRF protection (2024-03-20)
- ✅ Write unit tests (2024-03-20)

### In Progress (1/9)

- 🔄 Integration testing (Started: 2024-03-20, Assigned: @yogev)

### Remaining (1/9)

- ⏳ Deploy to staging environment
- ⏳ Security audit

## Completed Milestones

### Milestone: Project Setup (100%, Completed: 2024-01-20)

- ✅ Initialize repository
- ✅ Configure TypeScript
- ✅ Set up testing framework
- ✅ CI/CD pipeline
- ✅ Development environment

### Milestone: Database Layer (100%, Completed: 2024-02-10)

- ✅ Database schema design
- ✅ Migration system
- ✅ ORM configuration
- ✅ Seed data scripts

## Upcoming Milestones

### Milestone: API Development (Not Started)

**Target:** 2024-04-15  
**Dependencies:** User Authentication  
**Tasks:**

- Design REST API structure
- Implement core endpoints
- API documentation
- Rate limiting

## Metrics

- **Total Tasks Completed:** 42
- **Average Task Duration:** 2.3 days
- **Velocity:** 12 tasks/sprint (2 weeks)
- **Blockers Resolved:** 8 (avg resolution time: 1.5 days)

## Archived Changes (Older than 30 days)

### 2024-02-28: Database connection pooling

[... archived content ...]

### 2024-02-15: Authentication research complete

[... archived content ...]
```

**Update Triggers:**

- Task status changes (started, completed, blocked)
- Milestone reached
- Sprint/iteration boundaries
- Weekly summary

**Retention:** Permanent, but compress old entries (> 90 days) to summaries

### decisionLog.md

**Purpose:** Architectural decisions with rationale, alternatives considered, and outcomes.

**Structure:**

```markdown
# Decision Log

**Last Updated:** 2024-03-20T14:30:00Z

## Decision #47: Session-based Authentication over JWT

**Date:** 2024-03-18  
**Status:** Accepted  
**Impact:** High  
**Tags:** [authentication, security, architecture]

### Context

Need to implement user authentication for the application. Two main approaches considered: JWT (stateless) vs. Session (stateful).

### Decision

Use session-based authentication with Redis as session store.

### Rationale

1. **Security Requirements:** Application handles sensitive financial data requiring:
    - Instant token revocation (logout, compromise)
    - Session invalidation across all devices
    - Session duration limits

2. **Team Familiarity:** Team has 3+ years experience with session-based auth, only 6 months with JWT

3. **Infrastructure:** Already using Redis for caching, minimal additional cost

4. **Simplicity:** Avoid JWT pitfalls (token refresh complexity, size overhead in requests)

### Alternatives Considered

#### Alternative 1: JWT with Refresh Tokens

**Pros:**

- Stateless, easier horizontal scaling
- No database lookup per request
- Better for microservices

**Cons:**

- Cannot instantly revoke tokens (must wait for expiration)
- Requires refresh token rotation logic
- Larger request size (JWT in every header)
- More complex to implement correctly

**Why Rejected:** Security requirement for instant revocation is non-negotiable

#### Alternative 2: JWT with Redis Blacklist

**Pros:**

- Combines JWT benefits with revocation capability

**Cons:**

- Defeats stateless purpose (still need Redis lookup)
- More complex than pure sessions
- Larger request payloads

**Why Rejected:** Complexity without clear benefits over sessions

### Consequences

**Positive:**

- Simple logout implementation (delete session)
- Easy session duration enforcement
- Can track active sessions per user
- Smaller request payloads

**Negative:**

- Redis dependency for authentication
- Slightly higher latency (session lookup)
- More complex horizontal scaling (sticky sessions or shared Redis)

**Neutral:**

- Need session cleanup job (remove expired sessions)

### Implementation Notes

- Use `express-session` with `connect-redis`
- Session TTL: 1 hour (extend on activity)
- Cookie settings: `httpOnly`, `secure`, `sameSite: strict`
- Store minimal data in session (user ID only)

### Related

- **Rules:** [auth-token-handling](../.devflow/rules/auth-token-handling.mdc)
- **Documentation:** [docs/architecture/authentication.md](../../docs/architecture/authentication.md)
- **Plan:** feature-123 (OAuth Authentication)
- **Supersedes:** N/A
- **Superseded By:** N/A

### Outcomes (Added: 2024-03-25)

- Implementation completed successfully
- Average session lookup: 12ms (well below 50ms target)
- Zero security incidents related to auth in first month
- Team velocity improved (simpler mental model)

---

## Decision #46: REST API over GraphQL

**Date:** 2024-03-15  
**Status:** Accepted  
**Impact:** High  
**Tags:** [api, architecture]

### Context

Need to design API for frontend consumption. Debating between REST and GraphQL.

### Decision

Use REST with OpenAPI documentation.

### Rationale

1. **Team Experience:** All backend developers familiar with REST, only 1 knows GraphQL
2. **Tooling:** Excellent REST tooling (Postman, Swagger, curl)
3. **Caching:** Simpler HTTP caching strategies
4. **Simplicity:** Straightforward endpoint design, easy to reason about

### Alternatives Considered

#### Alternative 1: GraphQL

**Pros:**

- Single endpoint, flexible queries
- Reduces over-fetching
- Strong typing with schema

**Cons:**

- Steeper learning curve for team
- More complex caching
- Potential N+1 query issues
- Harder to monitor/debug

**Why Rejected:** Team familiarity and simplicity outweigh GraphQL benefits for our use case

### Consequences

- Must design endpoints carefully to avoid over-fetching
- Will implement field filtering via query params (`?fields=id,name`)
- Need strong API versioning strategy

### Related

- **Documentation:** [docs/api/rest-design.md](../../docs/api/rest-design.md)
- **Rules:** [api-conventions](../.devflow/rules/api-conventions.mdc)

---

## Decision #45: PostgreSQL over MongoDB

**Date:** 2024-02-01  
**Status:** Accepted  
**Impact:** Critical  
**Tags:** [database, infrastructure]

[... additional decisions ...]
```

**Update Triggers:**

- Major architectural choice made
- Technology selection
- Design pattern adopted
- Process change

**Retention:** Permanent - decisions are historical record

**Metadata Fields:**

- **Status:** Proposed | Accepted | Rejected | Deprecated | Superseded
- **Impact:** Low | Medium | High | Critical
- **Tags:** Categorization for filtering

### projectContext.md

**Purpose:** High-level project overview, constraints, and team information.

**Structure:**

```markdown
# Project Context

**Project Name:** DevFlow MCP Server  
**Created:** 2024-01-10  
**Last Updated:** 2024-03-20T14:30:00Z

## Project Overview

DevFlow is a comprehensive MCP server providing four independent but complementary layers (Rules, Memory, Documentation, Planning) for complete project context management across any AI agent or platform.

**Problem Solved:**
AI agents lose context between sessions, leading to repeated explanations, inconsistent code, and forgotten decisions.

**Solution:**
Persistent, structured, git-friendly context storage with automatic loading via MCP primitives.

## Goals

### Primary Goals

1. Enable AI agents to maintain context across sessions
2. Provide universal compatibility (Claude, Cursor, Zed, VSCode)
3. Enforce project standards automatically
4. Track decisions and progress over time

### Success Metrics

- Zero context loss between sessions (100% decision recall)
- < 100ms context loading time
- 90%+ developer satisfaction with agent continuity
- 50%+ reduction in repeated explanations

## Constraints

### Technical Constraints

- Must use MCP SDK (TypeScript)
- Stdio transport for local tools
- Markdown storage for git compatibility
- No external dependencies for core functionality (SQLite optional)

### Team Constraints

- Solo developer (initially)
- 20 hours/week available
- 8-week delivery timeline
- Limited budget (open source project)

### Business Constraints

- MIT license (maximize adoption)
- Must work offline (no required cloud services)
- No vendor lock-in

## Technology Stack

**Core:**

- TypeScript 5.3+
- MCP SDK (@modelcontextprotocol/sdk)
- Node.js 20+

**Storage:**

- Markdown files (primary)
- SQLite (optional, Phase 2)

**Testing:**

- Jest (unit tests)
- Playwright (integration tests for agent compatibility)

**Future UI:**

- Tauri (native performance)
- Svelte (lightweight, reactive)

## Team

### Current Team

- **Yogev** - Lead Developer, Architect
    - Focus: Core MCP server, Rules layer, Memory layer
    - Availability: 20 hrs/week

### Future Team (Post-Launch)

- Open source contributors
- Community maintainers

## Project Structure
```

dev-toolkit-mcp/
├── src/
│ ├── rules/ # Rules engine
│ ├── memory/ # Memory system
│ ├── docs/ # Documentation management
│ ├── planning/ # Planning and validation
│ ├── core/ # Shared MCP infrastructure
│ └── index.ts # Entry point
├── .devflow/ # Self-hosting (dogfooding)
│ ├── rules/
│ ├── memory/
│ └── plans/
├── docs/ # Project documentation
└── tests/ # Test suites

```

## Development Phases

### Phase 1: Foundation (Weeks 1-2) - IN PROGRESS
- File storage infrastructure ✅
- Core MCP primitives (tools, resources) 🔄
- Basic CRUD for all layers
- Auto-loading resources

### Phase 2: Integration (Weeks 3-4)
- Cross-layer linking system
- Unified context resource
- Consistency validation
- Agent format detection

### Phase 3: Intelligence (Weeks 5-6)
- Automatic task validation
- SQLite semantic search
- LLM-specific doc optimization
- Rule conflict detection

### Phase 4: Polish (Weeks 7-8)
- Management UI (Tauri + Svelte)
- Visual editors and dashboards
- Analytics and metrics
- Performance optimization

## Risks and Mitigations

### Risk: Agent compatibility issues
**Likelihood:** Medium
**Impact:** High
**Mitigation:** Test with multiple agents early (Claude Desktop, Cursor, Zed)

### Risk: Performance degradation with large projects
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:** Implement SQLite indexing (Phase 2), lazy loading, caching

### Risk: Complex cross-layer dependencies
**Likelihood:** Low
**Impact:** Medium
**Mitigation:** Strict modularity, each layer functional independently

## Communication

**Primary Channel:** GitHub Issues and Discussions
**Documentation:** In-repo markdown docs
**Status Updates:** Weekly progress commits

## Related Resources

- **Repository:** https://github.com/yogevbd/dev-toolkit-mcp
- **MCP Docs:** https://modelcontextprotocol.io
- **Inspiration:** Cline Memory Bank, Software Planning MCP
```

**Update Triggers:**

- Project scope changes
- Team changes
- Technology decisions
- Phase transitions

**Retention:** Permanent, updated incrementally

## MCP Primitives

### Resources

#### `devflow://context/memory`

**Auto-loaded at session start** - provides active context summary.

**Response Format:**

```json
{
	"uri": "devflow://context/memory",
	"mimeType": "text/markdown",
	"text": "# Active Context\n\n**Current Focus:** OAuth authentication (Task: session-middleware)\n**Blockers:** Waiting on Redis setup (High severity)\n\n**Recent Decisions:**\n- #47: Session-based auth (2024-03-18)\n- #46: REST over GraphQL (2024-03-15)\n\n**Progress:** 7/9 tasks complete in current milestone"
}
```

#### `devflow://memory/active`

**Full activeContext.md** content.

#### `devflow://memory/progress`

**Full progress.md** content.

#### `devflow://memory/decisions`

**Full decisionLog.md** content.

#### `devflow://memory/project`

**Full projectContext.md** content.

#### `devflow://memory/decision/{id}`

**Individual decision** retrieval.

**Parameters:**

- `id`: Decision number (e.g., "47")

**Response Format:**

```json
{
	"uri": "devflow://memory/decision/47",
	"mimeType": "text/markdown",
	"text": "## Decision #47: Session-based Authentication\n\n**Status:** Accepted\n..."
}
```

### Tools

#### `memory:context:set`

**Update current focus and active context.**

**Parameters:**

```typescript
{
  focus?: string;               // Current work description
  task?: {
    planId: string;             // "feature-123"
    taskId: string;             // "task-456"
    description: string;
  };
  files?: string[];             // Files currently being modified
  notes?: string;               // Additional context
}
```

**Returns:**

```typescript
{
  success: true,
  updated: "activeContext.md",
  timestamp: "2024-03-20T14:30:00Z"
}
```

**Example:**

```typescript
await callTool('memory:context:set', {
	focus: 'Implementing session middleware for OAuth authentication',
	task: {
		planId: 'feature-123',
		taskId: 'task-456',
		description: 'Create SessionManager class with Redis integration',
	},
	files: ['src/auth/session.ts', 'src/middleware/auth.ts'],
	notes: 'Using express-session with connect-redis adapter',
});
```

#### `memory:blocker:add`

**Log a blocker in active context.**

**Parameters:**

```typescript
{
  title: string;                // "Redis connection configuration"
  severity: "low" | "medium" | "high" | "critical";
  impact: string;               // Description of impact
  waitingOn?: string;           // Who/what is blocking
  workaround?: string;          // Temporary solution
}
```

**Returns:**

```typescript
{
  success: true,
  blockerId: "blocker-12",
  addedTo: "activeContext.md"
}
```

#### `memory:blocker:resolve`

**Mark blocker as resolved.**

**Parameters:**

```typescript
{
	blockerId: string; // "blocker-12"
	resolution: string; // How it was resolved
}
```

**Returns:**

```typescript
{
  success: true,
  resolved: "blocker-12",
  duration: "2 days",
  archivedTo: "progress.md"
}
```

#### `memory:change:log`

**Log a significant change to active context.**

**Parameters:**

```typescript
{
  summary: string;              // "Implemented session middleware"
  details?: string;             // Extended description
  filesChanged?: string[];      // Modified files
  relatedDecision?: string;     // "decision-47"
  relatedPlan?: string;         // "feature-123"
}
```

**Returns:**

```typescript
{
  success: true,
  addedTo: "activeContext.md",
  willArchiveOn: "2024-04-20"   // 30 days from now
}
```

#### `memory:decision:log`

**Create new architectural decision.**

**Parameters:**

```typescript
{
  title: string;                    // "Session-based Authentication over JWT"
  context: string;                  // Why decision was needed
  decision: string;                 // What was decided
  rationale: string;                // Why this choice
  alternatives: Array<{
    name: string;
    pros: string[];
    cons: string[];
    whyRejected: string;
  }>;
  consequences: {
    positive: string[];
    negative: string[];
    neutral?: string[];
  };
  impact: "low" | "medium" | "high" | "critical";
  tags: string[];                   // ["authentication", "security"]
  relatedRules?: string[];          // Rule IDs
  relatedDocs?: string[];           // Doc paths
  relatedPlans?: string[];          // Plan IDs
  implementationNotes?: string;
}
```

**Returns:**

```typescript
{
  success: true,
  decisionId: "decision-47",
  addedTo: "decisionLog.md",
  linkedResources: {
    rules: ["auth-token-handling"],
    docs: ["docs/architecture/authentication.md"],
    plans: ["feature-123"]
  }
}
```

**Example:**

```typescript
await callTool('memory:decision:log', {
	title: 'Session-based Authentication over JWT',
	context:
		'Need user authentication. Must support instant token revocation for security.',
	decision: 'Use session-based authentication with Redis as session store',
	rationale:
		'Security requirements demand instant revocation. Team familiar with sessions.',
	alternatives: [
		{
			name: 'JWT with Refresh Tokens',
			pros: ['Stateless', 'Easier scaling', 'No DB lookup per request'],
			cons: [
				'Cannot instantly revoke',
				'Complex refresh logic',
				'Larger requests',
			],
			whyRejected:
				'Instant revocation is non-negotiable security requirement',
		},
	],
	consequences: {
		positive: [
			'Simple logout (delete session)',
			'Easy session duration enforcement',
			'Smaller request payloads',
		],
		negative: [
			'Redis dependency',
			'Slightly higher latency',
			'More complex scaling',
		],
	},
	impact: 'high',
	tags: ['authentication', 'security', 'architecture'],
	relatedRules: ['auth-token-handling'],
	relatedDocs: ['docs/architecture/authentication.md'],
});
```

#### `memory:decision:update`

**Update existing decision (add outcomes, change status).**

**Parameters:**

```typescript
{
  decisionId: string;           // "decision-47"
  status?: "proposed" | "accepted" | "rejected" | "deprecated" | "superseded";
  outcomes?: string;            // Results after implementation
  supersededBy?: string;        // "decision-52"
}
```

#### `memory:progress:task`

**Update task progress.**

**Parameters:**

```typescript
{
  taskId: string;               // "task-456"
  status: "not_started" | "in_progress" | "completed" | "blocked";
  milestone?: string;           // Milestone name
  notes?: string;
}
```

**Returns:**

```typescript
{
  success: true,
  updated: "progress.md",
  milestoneProgress: "7/9 tasks (78%)"
}
```

#### `memory:progress:milestone`

**Create or update milestone.**

**Parameters:**

```typescript
{
  name: string;                 // "User Authentication"
  target?: string;              // ISO date "2024-03-25"
  planId?: string;              // Link to planning layer
  status?: "not_started" | "in_progress" | "completed";
  tasks?: Array<{
    id: string;
    description: string;
    status: string;
    completed?: string;         // ISO date
  }>;
}
```

#### `memory:recall`

**Semantic search across all memory (Phase 2).**

**Parameters:**

```typescript
{
  query: string;                // "authentication decisions"
  sources?: ("active" | "progress" | "decisions" | "project")[];
  limit?: number;               // Max results (default: 10)
  minRelevance?: number;        // 0-1 score threshold
}
```

**Returns:**

```typescript
{
  results: [
    {
      source: "decisionLog.md",
      section: "Decision #47",
      relevance: 0.92,
      snippet: "Use session-based authentication with Redis...",
      link: "devflow://memory/decision/47"
    },
    {
      source: "activeContext.md",
      section: "Current Focus",
      relevance: 0.85,
      snippet: "Working on OAuth authentication implementation...",
      link: "devflow://memory/active#current-focus"
    }
  ],
  total: 2,
  queryTime: "4ms"
}
```

**Note:** Phase 2 feature - requires SQLite indexing. Phase 1 uses basic text search.

#### `memory:export`

**Export memory to various formats.**

**Parameters:**

```typescript
{
  format: "markdown" | "json" | "html";
  sources?: ("active" | "progress" | "decisions" | "project")[];
  outputPath?: string;          // Where to write
}
```

### Prompts

#### `init_memory`

**Initialize memory structure for new project.**

**Parameters:**

```typescript
{
  projectName: string;
  projectDescription: string;
  goals?: string[];
  constraints?: string[];
}
```

**Generated Prompt:**

```markdown
I'll help you initialize DevFlow Memory for [projectName].

Please provide:

1. **Project Overview** - What problem does this solve?
2. **Primary Goals** - What defines success?
3. **Technical Constraints** - Technology requirements, limitations
4. **Team Context** - Who's working on this, availability

I'll create:

- projectContext.md with this information
- activeContext.md for tracking current work
- progress.md for milestone tracking
- decisionLog.md for architectural decisions

Let's build a comprehensive memory foundation for your project.
```

#### `decision_template`

**Guided decision logging.**

**Parameters:**

```typescript
{
  decisionContext?: string;     // Pre-filled context
}
```

**Generated Prompt:**

```markdown
Let's document this architectural decision properly.

I'll guide you through:

1. **Decision Title** - What are we deciding?
2. **Context** - Why is this decision needed?
3. **Options Considered** - What alternatives did we evaluate?
4. **Choice** - What did we decide?
5. **Rationale** - Why this option?
6. **Trade-offs** - What are the consequences?

This will be logged in decisionLog.md and linked to relevant rules/docs/plans.
```

#### `weekly_summary`

**Generate weekly progress summary.**

**Parameters:**

```typescript
{
	weekStart: string; // ISO date
	weekEnd: string; // ISO date
}
```

**Generated Prompt:**

```markdown
Generating weekly summary for [weekStart] to [weekEnd].

**Progress:**

- Tasks completed: [X]
- Decisions made: [Y]
- Blockers resolved: [Z]

**Key Achievements:**
[List from progress.md changes]

**Active Blockers:**
[List from activeContext.md]

**Next Week Focus:**
[Inferred from active tasks and milestones]

This summary will be archived in progress.md.
```

## Cross-Layer Integration

### Memory → Rules

```typescript
// Decision explains why rule exists
{
  decisionId: "decision-47",
  relatedRules: ["auth-token-handling"]
}

// Rule references decision
{
  ruleId: "auth-token-handling",
  linkedDecisions: ["decision-47"]
}
```

### Memory → Documentation

```typescript
// Decision updates documentation
memory: decision: log({
	title: 'REST over GraphQL',
	relatedDocs: ['docs/architecture/api-design.md'],
});

// Triggers doc update suggestion
// "Decision #46 references docs/architecture/api-design.md"
// "Consider updating section 3.2 with this decision"
```

### Memory → Planning

```typescript
// Progress syncs with planning
memory: progress: task({
	taskId: 'task-456',
	status: 'completed',
});

// Automatically updates planning layer
// Triggers milestone progress recalculation
// Checks if next task can start (dependencies)
```

### Automatic Context Loading

```typescript
// At session start, agent receives:
{
  activeContext: "Working on OAuth auth, blocked on Redis",
  recentDecisions: ["#47: Sessions over JWT", "#46: REST over GraphQL"],
  currentMilestone: "User Authentication (78% complete)",
  nextTasks: ["Integration testing", "Deploy to staging"]
}
```

## Performance Strategy

### Phase 1: Pure Markdown

**Implementation:**

- Direct file reads/writes
- Simple text search (grep-like)
- No indexing overhead

**Performance:**

- Read: ~2-5ms per file
- Write: ~10-20ms per file
- Search: ~50-200ms (depends on file size)

**Trade-offs:**

- Simple, zero dependencies
- Readable, diffable, git-friendly
- Slower search for large projects

### Phase 2: SQLite Indexing

**Implementation:**

```sql
CREATE TABLE memory_entries (
  id TEXT PRIMARY KEY,
  source TEXT,              -- "activeContext", "decisions", etc.
  section TEXT,             -- Heading within file
  content TEXT,
  embedding BLOB,           -- Vector embedding for semantic search
  metadata JSON,            -- Tags, dates, links
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE VIRTUAL TABLE memory_fts USING fts5(
  content,
  tokenize = 'porter unicode61'
);
```

**Performance:**

- Read: ~1-2ms (cached)
- Write: ~5-10ms (markdown + SQLite)
- Search: ~3-5ms (indexed)
- Semantic search: ~8-15ms (with embeddings)

**Trade-offs:**

- Faster queries
- Semantic search capability
- Additional dependency (SQLite)
- Markdown still source of truth

### Hybrid Approach

**Best of Both Worlds:**

1. Markdown files are primary storage (human-readable, git-friendly)
2. SQLite is secondary index (performance, search)
3. On write: Update markdown, then update SQLite
4. On read: Query SQLite if available, fallback to markdown
5. Rebuild index command if SQLite out of sync

## Staleness Detection

### File Hashing

```typescript
// Track file state in activeContext.md metadata
{
  "trackedFiles": {
    "src/auth/session.ts": {
      "hash": "a1b2c3d4",
      "lastSeen": "2024-03-20T14:30:00Z",
      "contextRelevant": true
    }
  }
}

// On next session, check if hash changed
// If changed: "src/auth/session.ts modified since last session"
```

### Timestamp-Based

```typescript
// Automatic archival
if (changeAge > 30 days) {
  moveToArchive(activeContext, progress);
}

// Staleness warnings
if (decisionAge > 365 days && status === "accepted") {
  suggestReview(decision);
}
```

## Best Practices

### Decision Logging

**Good:**

```markdown
## Decision #47: Session-based Auth over JWT

**Context:** Need authentication with instant revocation capability

**Decision:** Use sessions with Redis

**Rationale:**

- Security requirement: instant token revocation
- Team familiarity (3+ years with sessions)
- Infrastructure: Redis already in use
```

**Bad:**

```markdown
## Decision #47: Use sessions

We decided to use sessions because they're better.
```

### Active Context Updates

**Good:**

```typescript
memory: context: set({
	focus: 'Implementing session middleware',
	task: { planId: 'feature-123', taskId: 'task-456' },
	files: ['src/auth/session.ts'],
	notes: 'Using express-session, need to handle Redis connection failures',
});
```

**Bad:**

```typescript
memory: context: set({
	focus: 'Working on stuff',
});
```

### Progress Tracking

**Good:**

- Update tasks immediately when status changes
- Link tasks to milestones
- Include completion dates
- Note blockers and their resolution

**Bad:**

- Batch updates once per week
- Vague task descriptions
- No milestone grouping
- Missing completion metadata

## Migration from Cline

If you're using Cline's memory bank:

```bash
# Export Cline memory
# (Manually copy from Cline's .clinerules or memory location)

# Import to DevFlow
devflow memory:import --source cline --content "$(cat cline-memory.md)"

# Maps:
# - activeContext.md → activeContext.md (direct)
# - progress.md → progress.md (direct)
# - decisionLog.md → Not in Cline (start fresh)
# - projectContext.md → Extract from Cline's project brief
```

## Troubleshooting

### Memory Not Loading

```bash
# Verify file structure
ls -la .devflow/memory/

# Check file permissions
chmod 644 .devflow/memory/*.md

# Validate markdown syntax
devflow memory:validate
```

### Slow Search (Phase 1)

```bash
# Reduce search scope
memory:recall({
  query: "authentication",
  sources: ["decisions"],  # Instead of all sources
  limit: 5
})

# Or upgrade to Phase 2 (SQLite)
devflow memory:index --build
```

### SQLite Index Out of Sync (Phase 2)

```bash
# Rebuild from markdown source of truth
devflow memory:index --rebuild

# Should complete in < 1 second for typical projects
```

---

**Next:** [Documentation Layer](./DOCS.md) - AI-optimized documentation management
