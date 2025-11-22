# Layer Integration & Unified Workflows

**How the four DevFlow layers work together to provide comprehensive project context.**

## Overview

While each DevFlow layer (Rules, Memory, Documentation, Planning) is independently functional, their true power emerges through integration. This document explains how layers communicate, share data, and create unified workflows that exceed the sum of their parts.

## Integration Architecture

### Bidirectional Linking

Each layer can reference resources from other layers:

```typescript
// Rules reference Memory decisions
{
  ruleId: "auth-token-handling",
  linkedDecisions: ["decision-47"]
}

// Memory decisions reference Rules
{
  decisionId: "decision-47",
  relatedRules: ["auth-token-handling"]
}

// Documentation references both
{
  docPath: "docs/architecture/authentication.md",
  enforced_by: ["auth-token-handling"],
  decisions: ["decision-47"]
}

// Planning references all three
{
  planId: "feature-123",
  relatedRules: ["auth-token-handling"],
  relatedDecisions: ["decision-47"],
  relatedDocs: ["docs/architecture/authentication.md"]
}
```

### Event-Driven Updates

When one layer changes, related layers are notified:

```typescript
// Memory decision logged
memory:decision:log({
  title: "Session-based Authentication",
  relatedRules: ["auth-token-handling"],
  relatedDocs: ["docs/architecture/authentication.md"]
})

// Triggers:
// 1. Rule system: Check if new rule should be created
// 2. Documentation: Suggest updating architecture doc
// 3. Planning: Link to related tasks if in active plan
```

### Consistency Validation

The `sync:validate` tool ensures cross-layer integrity:

```typescript
sync:validate() // Returns:
{
  valid: false,
  issues: [
    {
      type: "orphaned-rule",
      ruleId: "old-pattern",
      issue: "Rule references decision-99 which doesn't exist",
      suggestion: "Remove reference or create decision-99"
    },
    {
      type: "stale-documentation",
      docPath: "docs/api/authentication.md",
      issue: "Plan feature-123 modified related files but doc not updated in 30 days",
      suggestion: "Review and update documentation"
    },
    {
      type: "missing-rule",
      decisionId: "decision-47",
      issue: "Decision mandates session security but no rule enforces it",
      suggestion: "Create rule from decision or link existing rule"
    }
  ]
}
```

## Unified Context Loading

### Session Initialization

When an AI agent starts a conversation, it receives consolidated context from all layers:

```typescript
// Triggered automatically via MCP resources
devflow://context/unified

// Returns:
{
  "rules": {
    "active": [
      {
        "id": "typescript-standards",
        "priority": 8,
        "summary": "Explicit types, no `any`, strict mode"
      },
      {
        "id": "auth-token-handling",
        "priority": 10,
        "summary": "httpOnly cookies, secure flags, session-based"
      }
    ],
    "contextual": [
      {
        "id": "react-hooks-patterns",
        "globs": ["src/components/**/*.tsx"],
        "summary": "Use hooks correctly, memoize callbacks"
      }
    ],
    "manual": [
      {
        "id": "performance-optimization",
        "summary": "Available on-demand for performance work"
      }
    ]
  },
  "memory": {
    "currentFocus": "Implementing OAuth authentication (Task: session-middleware)",
    "blockers": [
      {
        "severity": "high",
        "title": "Redis connection configuration",
        "since": "2024-03-19"
      }
    ],
    "recentDecisions": [
      {
        "id": "decision-47",
        "title": "Session-based auth over JWT",
        "date": "2024-03-18",
        "impact": "high"
      },
      {
        "id": "decision-46",
        "title": "REST over GraphQL",
        "date": "2024-03-15",
        "impact": "high"
      }
    ],
    "recentChanges": [
      "Created SessionManager class (2024-03-20)",
      "Integrated Passport.js (2024-03-19)",
      "Decided on session architecture (2024-03-18)"
    ]
  },
  "documentation": {
    "relevantDocs": [
      {
        "path": "docs/architecture/authentication.md",
        "type": "architecture",
        "summary": "Session-based auth with Redis"
      },
      {
        "path": "docs/api/authentication.md",
        "type": "api",
        "summary": "authenticateUser function reference"
      },
      {
        "path": "docs/guides/local-development.md",
        "type": "guide",
        "summary": "Setting up dev environment"
      }
    ]
  },
  "planning": {
    "activePlans": [
      {
        "id": "feature-123",
        "name": "OAuth Authentication",
        "progress": "7/9 tasks (78%)",
        "status": "in_progress",
        "currentTask": {
          "id": "task-458",
          "title": "Implement SessionManager class",
          "complexity": 7,
          "status": "in_progress"
        },
        "nextTasks": [
          {
            "id": "task-459",
            "title": "Integrate Passport.js",
            "canStart": true
          },
          {
            "id": "task-461",
            "title": "Integration tests",
            "canStart": false,
            "blockedBy": ["task-458", "task-459"]
          }
        ]
      }
    ]
  },
  "summary": "Working on OAuth authentication (feature-123). Currently implementing SessionManager with Redis. Follow session-based auth rules. See decision-47 for rationale. Blocked on Redis setup but using in-memory workaround for now."
}
```

### Agent Prompt Construction

The unified context is formatted for AI consumption:

```markdown
# DevFlow Project Context

You are working on a project with comprehensive context management.

## Active Rules (2 always-active, 1 contextual)

### TypeScript Standards (priority: 8)
- Use explicit types for all function parameters and return values
- Never use `any` - prefer `unknown` for dynamic types
- Enable `strict` mode in tsconfig.json

### Authentication Token Handling (priority: 10) [SECURITY]
- Never store tokens in localStorage (XSS vulnerable)
- Use httpOnly cookies for session tokens
- Include secure, sameSite flags
- See Decision #47 for rationale

### React Hooks Patterns (contextual: src/components/**/*.tsx)
- Prefix custom hooks with `use`
- Return objects, not arrays
- Wrap callbacks in useCallback for children

## Current Context

**Working On:** OAuth Authentication Implementation (Plan: feature-123)
**Current Task:** Implement SessionManager class (task-458, complexity: 7)
**Files in Focus:** src/auth/session.ts, src/middleware/auth.ts

**Active Blockers:**
- Redis connection configuration (High severity, since 2024-03-19)
- Waiting on DevOps for Redis instance
- Workaround: Using in-memory store for local development

## Recent Decisions

### Decision #47: Session-based Authentication over JWT (2024-03-18)
**Impact:** High  
**Rationale:** Security requirement for instant token revocation. Team familiar with sessions.  
**Trade-offs:** Redis dependency vs. instant logout capability  
**Related:** Rule `auth-token-handling`, Doc `docs/architecture/authentication.md`

### Decision #46: REST API over GraphQL (2024-03-15)
**Impact:** High  
**Rationale:** Team experience, simpler tooling, straightforward caching  
**Related:** Doc `docs/api/rest-design.md`

## Recent Work (Last 7 Days)

- 2024-03-20: Created SessionManager class scaffolding
- 2024-03-19: Integrated Passport.js for OAuth flow
- 2024-03-18: Made architecture decision on session-based auth

## Key Documentation

- **Architecture:** [Authentication System](docs/architecture/authentication.md)
- **API Reference:** [Authentication API](docs/api/authentication.md)
- **Setup Guide:** [Local Development](docs/guides/local-development.md)

## Active Plan: OAuth Authentication

**Progress:** 7/9 tasks completed (78%)

**Completed:**
- ✅ Research OAuth providers
- ✅ Design session architecture
- ✅ Integrate Passport.js

**In Progress:**
- 🔄 Implement SessionManager class (current)

**Next Up:**
- ⏳ OAuth callback routes
- ⏳ Integration tests (blocked until SessionManager complete)

---

**Instructions:** Follow all active rules strictly. Reference decisions when making design choices. Update memory as work progresses. Mark tasks complete when validation passes.
```

## Common Workflows

### Workflow 1: Starting a New Feature

**Step 1: Create Plan**
```typescript
await callTool("plan:create", {
  name: "User Profile Management",
  description: "Allow users to view and edit their profiles",
  size: "medium",
  targetCompletion: "2024-04-15",
  milestones: [
    {
      name: "Design",
      tasks: [
        "Design profile data model",
        "Create API specification"
      ]
    },
    {
      name: "Implementation",
      tasks: [
        "Implement backend endpoints",
        "Create frontend components",
        "Add validation"
      ]
    },
    {
      name: "Testing",
      tasks: [
        "Write unit tests",
        "Write integration tests"
      ]
    }
  ]
});
```

**Step 2: Update Active Context**
```typescript
await callTool("memory:context:set", {
  focus: "Starting user profile management feature",
  task: {
    planId: "feature-124",
    taskId: "task-500",
    description: "Design profile data model"
  },
  notes: "Need to consider privacy settings and avatar storage"
});
```

**Step 3: Check Related Rules**
```typescript
await callTool("rules:list", {
  tags: ["data-model", "privacy"],
  active: true
});

// If no relevant rules exist, consider creating one
```

**Step 4: Review Related Documentation**
```typescript
await callTool("doc:search", {
  query: "user data model",
  type: "architecture"
});
```

**Step 5: Work on Task**
```typescript
// Agent works on the task, creating files, writing code
// DevFlow monitors file changes, test execution, commits
```

**Step 6: Complete Task**
```typescript
await callTool("plan:task:update", {
  planId: "feature-124",
  taskId: "task-500",
  status: "completed"
});

// Automatically:
// - Validates file changes
// - Checks rule compliance
// - Updates memory progress
// - Suggests documentation updates
```

### Workflow 2: Making an Architectural Decision

**Step 1: Identify Decision Point**
```typescript
// Agent recognizes a choice needs to be made
// Example: "Should we use Redis or Memcached for caching?"
```

**Step 2: Research Options**
```typescript
// Check existing documentation
await callTool("doc:search", {
  query: "caching strategy",
  type: "architecture"
});

// Check if similar decision was made before
await callTool("memory:recall", {
  query: "cache Redis Memcached",
  sources: ["decisions"]
});
```

**Step 3: Log Decision**
```typescript
await callTool("memory:decision:log", {
  title: "Redis for Caching Over Memcached",
  context: "Need distributed caching for session data and API responses",
  decision: "Use Redis as primary caching layer",
  rationale: "Redis already deployed for sessions. Supports more data structures. Team familiar.",
  alternatives: [
    {
      name: "Memcached",
      pros: ["Simpler", "Slightly faster for simple key-value"],
      cons: ["Another dependency", "Limited data structures", "No persistence"],
      whyRejected: "Redis already in use, no benefit to adding Memcached"
    }
  ],
  consequences: {
    positive: [
      "Single caching solution",
      "Rich data structures available",
      "Persistence if needed"
    ],
    negative: [
      "Slightly higher memory usage"
    ]
  },
  impact: "medium",
  tags: ["caching", "infrastructure"],
  relatedDocs: ["docs/architecture/caching.md"]
});
```

**Step 4: Create Rule (if needed)**
```typescript
await callTool("rules:create", {
  name: "Caching Implementation",
  type: "always",
  priority: 7,
  content: `# Caching Implementation

## Cache Storage
- Use Redis for all caching (sessions, API responses, computed data)
- Never introduce additional caching solutions without architectural review

## Cache Keys
- Use namespaced keys: \`cache:[domain]:[identifier]\`
- Example: \`cache:users:profile:123\`

## TTL Strategy
- Set TTL on all cache entries
- Default: 1 hour (3600 seconds)
- Adjust based on data volatility`,
  linkedDecisions: ["decision-48"],
  tags: ["caching", "redis"]
});
```

**Step 5: Update Documentation**
```typescript
await callTool("doc:create", {
  type: "architecture",
  title: "Caching Strategy",
  category: "infrastructure",
  metadata: {
    related: {
      decisions: ["decision-48"],
      rules: ["caching-implementation"]
    }
  }
});

// Then fill in the architecture doc with details
```

**Step 6: Link to Current Plan (if applicable)**
```typescript
// If this decision was made during feature work
await callTool("plan:task:update", {
  planId: "feature-124",
  taskId: "task-501",
  notes: "Made caching decision (decision-48). Using Redis for all caching."
});
```

### Workflow 3: Code Review / Quality Check

**Step 1: Validate Against Rules**
```typescript
await callTool("rules:validate", {
  filePath: "src/api/users.ts"
});

// Returns:
{
  valid: false,
  violations: [
    {
      ruleId: "typescript-standards",
      severity: "error",
      line: 42,
      message: "Explicit return type required",
      suggestion: "Add ': Promise<UserProfile>'"
    }
  ]
}
```

**Step 2: Check Test Coverage**
```typescript
await callTool("plan:task:validate", {
  planId: "feature-124",
  taskId: "task-502"
});

// Returns:
{
  validation: {
    testsPassed: true,
    testResults: {
      coverage: 0.75
    }
  },
  warnings: [
    "Code coverage 75% (below 80% threshold)"
  ]
}
```

**Step 3: Verify Documentation Updated**
```typescript
// Check if modified files have corresponding docs
await callTool("doc:consistency:check", {
  paths: ["src/api/users.ts"]
});

// Returns:
{
  issues: [
    {
      type: "stale-documentation",
      file: "src/api/users.ts",
      doc: "docs/api/users.md",
      issue: "File modified but doc not updated in 45 days"
    }
  ]
}
```

**Step 4: Update Documentation**
```typescript
await callTool("doc:update", {
  path: "docs/api/users.md",
  section: {
    heading: "Update Profile Endpoint",
    content: "New endpoint documentation..."
  }
});
```

**Step 5: Log Change in Memory**
```typescript
await callTool("memory:change:log", {
  summary: "Added user profile update endpoint",
  filesChanged: ["src/api/users.ts"],
  relatedPlan: "feature-124"
});
```

### Workflow 4: Debugging / Issue Resolution

**Step 1: Add Blocker**
```typescript
await callTool("memory:blocker:add", {
  title: "Redis connection timeout in production",
  severity: "critical",
  impact: "All authenticated requests failing",
  waitingOn: "DevOps team investigation"
});
```

**Step 2: Research Previous Solutions**
```typescript
// Search memory for similar issues
await callTool("memory:recall", {
  query: "Redis connection timeout",
  sources: ["active", "progress", "decisions"]
});

// Search documentation
await callTool("doc:search", {
  query: "Redis connection troubleshooting"
});
```

**Step 3: Update Current Task**
```typescript
await callTool("plan:task:update", {
  planId: "feature-123",
  taskId: "task-461",
  status: "blocked",
  blocker: "Production Redis connection issues preventing deployment"
});
```

**Step 4: Document Solution (when resolved)**
```typescript
// Resolve blocker
await callTool("memory:blocker:resolve", {
  blockerId: "blocker-15",
  resolution: "DevOps increased Redis connection pool size from 10 to 50. Timeout increased from 5s to 30s."
});

// Update documentation
await callTool("doc:update", {
  path: "docs/guides/deployment.md",
  section: {
    heading: "Redis Configuration",
    content: `## Production Redis Settings

**Connection Pool Size:** 50 connections
**Timeout:** 30 seconds
**Retry Strategy:** Exponential backoff (1s, 2s, 4s, 8s, 15s)

These settings handle production load of 1000 req/sec.`
  }
});

// Unblock task
await callTool("plan:task:update", {
  planId: "feature-123",
  taskId: "task-461",
  status: "in_progress"
});
```

### Workflow 5: Onboarding New Team Member

**Step 1: Initialize DevFlow**
```typescript
// New developer clones repo
// DevFlow auto-loads context on first conversation

// Agent receives unified context (see "Session Initialization" above)
```

**Step 2: Provide Onboarding Prompt**
```typescript
// Using prompt primitive
await callPrompt("onboarding_summary");

// Returns:
{
  prompt: `# Welcome to the Project!

## Project Overview
[From projectContext.md]

## Current Status
[From progress.md - recent milestones and active work]

## Key Rules to Follow
[From rules layer - always-active rules]

## Recent Important Decisions
[From decisionLog.md - last 5 high-impact decisions]

## Essential Documentation
- Getting Started: docs/guides/getting-started.md
- Architecture Overview: docs/architecture/overview.md
- Development Setup: docs/guides/local-development.md

## Current Focus
[From activeContext.md - what the team is working on now]

Let me know if you need clarification on any of these areas!`
}
```

**Step 3: Answer Questions Using Context**
```typescript
// New developer: "Why are we using sessions instead of JWT?"

// Agent searches memory
await callTool("memory:recall", {
  query: "sessions JWT authentication decision",
  sources: ["decisions"]
});

// Finds decision-47, provides detailed answer with rationale
```

**Step 4: Assign First Task**
```typescript
// Find good starter task
await callTool("plan:metrics", {
  includeVelocity: true
});

// Identify low-complexity task with clear criteria
await callTool("plan:task:update", {
  planId: "feature-124",
  taskId: "task-505",
  assignee: "newdev"
});
```

## Consistency Validation

### Cross-Reference Checking

```typescript
// Run full consistency check
await callTool("sync:validate");

// Returns comprehensive report:
{
  rules: {
    total: 12,
    orphanedDecisions: [
      {
        ruleId: "old-pattern",
        linkedDecision: "decision-99",
        issue: "Decision doesn't exist"
      }
    ],
    missingDocs: [
      {
        ruleId: "api-conventions",
        linkedDoc: "docs/api/conventions.md",
        issue: "Documentation file not found"
      }
    ]
  },
  memory: {
    decisions: 47,
    orphanedRules: [
      {
        decisionId: "decision-23",
        relatedRule: "deprecated-rule",
        issue: "Rule no longer exists"
      }
    ],
    staleDocs: [
      {
        decisionId: "decision-47",
        doc: "docs/architecture/authentication.md",
        lastUpdated: "2024-02-01",
        issue: "Doc not updated in 60+ days after decision"
      }
    ]
  },
  documentation: {
    total: 28,
    brokenLinks: [
      {
        file: "docs/api/users.md",
        line: 45,
        link: "../architecture/nonexistent.md",
        issue: "Target file doesn't exist"
      }
    ],
    inconsistentTerms: [
      {
        term: "login",
        preferred: "authentication",
        occurrences: 12
      }
    ]
  },
  planning: {
    activePlans: 3,
    orphanedDecisions: [
      {
        planId: "feature-123",
        decisionId: "decision-99",
        issue: "Referenced decision doesn't exist"
      }
    ],
    staleDocs: [
      {
        planId: "feature-123",
        taskId: "task-458",
        doc: "docs/api/authentication.md",
        issue: "Task modified related files, doc may be stale"
      }
    ]
  },
  summary: {
    totalIssues: 8,
    critical: 2,
    warnings: 6,
    suggestions: "Run 'sync:fix' to attempt automatic fixes"
  }
}
```

### Automatic Fixes

```typescript
// Attempt to fix consistency issues
await callTool("sync:fix", {
  autoFix: true,
  confirm: true
});

// Performs:
// 1. Remove orphaned references
// 2. Update broken links (if new location detectable)
// 3. Suggest documentation updates
// 4. Create missing cross-references

// Returns:
{
  fixed: [
    "Removed orphaned decision reference from rule 'old-pattern'",
    "Updated link in docs/api/users.md (file moved)",
    "Added cross-reference from decision-47 to rule 'auth-token-handling'"
  ],
  manualActionRequired: [
    {
      issue: "docs/architecture/authentication.md is stale",
      suggestion: "Review and update based on decision-47",
      file: "docs/architecture/authentication.md"
    }
  ]
}
```

## Performance Considerations

### Lazy Loading

```typescript
// Only load what's needed when needed

// Session start: Load summaries only
devflow://context/unified → Summaries from all layers (fast)

// When agent needs details: Load specific resource
devflow://memory/decision/47 → Full decision content
devflow://docs/api/authentication.md → Full doc content
devflow://plans/feature-123 → Full plan with tasks
```

### Caching Strategy

```typescript
// Cache frequently accessed resources
const cache = new Map();

// Cache unified context for 5 minutes
cache.set('unified-context', context, { ttl: 300000 });

// Cache individual resources until file changes
watchFiles([
  '.devflow/rules/**/*.mdc',
  '.devflow/memory/*.md',
  'docs/**/*.md',
  '.devflow/plans/**/*.json'
], (changedFile) => {
  cache.invalidate(changedFile);
});
```

### Incremental Updates

```typescript
// Don't rebuild entire context on every change

// File change detected
onFileChange('.devflow/memory/activeContext.md', async () => {
  // Only update memory portion of unified context
  const memoryContext = await loadMemoryContext();
  unifiedContext.memory = memoryContext;
  
  // Notify subscribers
  emit('context-updated', { layer: 'memory' });
});
```

## Best Practices

### 1. Maintain Bidirectional Links

**Always link in both directions:**
```typescript
// When creating a rule from a decision
rules:create({
  linkedDecisions: ["decision-47"]
});

// Also update the decision
memory:decision:update({
  decisionId: "decision-47",
  relatedRules: ["auth-token-handling"]
});
```

### 2. Use Consistent IDs

**Follow ID conventions:**
- Rules: `kebab-case` (e.g., `auth-token-handling`)
- Decisions: `decision-{number}` (e.g., `decision-47`)
- Plans: `feature-{number}` (e.g., `feature-123`)
- Tasks: `task-{number}` (e.g., `task-458`)
- Milestones: `milestone-{number}` (e.g., `milestone-2`)

### 3. Regular Consistency Checks

**Schedule validation:**
```bash
# Daily cron job
0 9 * * * devflow sync:validate --report

# Pre-commit hook
#!/bin/bash
devflow sync:validate --fail-on-errors
```

### 4. Update All Affected Layers

**When making changes, update all relevant layers:**
```typescript
// Architectural decision made
1. memory:decision:log(...)
2. rules:create(...) // If enforcement needed
3. doc:create(...) // Document the architecture
4. plan:task:update(...) // Update related tasks
```

### 5. Use Templates for Consistency

**Leverage templates for common workflows:**
```typescript
// Feature planning template
await callPrompt("plan_feature", {
  featureName: "User Profile Management",
  size: "medium"
});

// Decision logging template
await callPrompt("decision_template", {
  decisionContext: "Need to choose caching solution"
});
```

## Troubleshooting Integration Issues

### Issue: Broken Cross-References

**Symptom:** Links between layers not working

**Diagnosis:**
```bash
devflow sync:validate --verbose
```

**Fix:**
```bash
devflow sync:fix --auto-fix
```

### Issue: Stale Context

**Symptom:** Agent doesn't see recent changes

**Diagnosis:**
```bash
# Check if files changed recently
ls -lt .devflow/memory/
ls -lt .devflow/rules/
ls -lt .devflow/plans/active/

# Check cache status
devflow cache:status
```

**Fix:**
```bash
# Clear cache
devflow cache:clear

# Rebuild context
devflow context:rebuild
```

### Issue: Conflicting Information

**Symptom:** Rule says one thing, decision says another

**Diagnosis:**
```bash
devflow sync:validate --check-conflicts
```

**Fix:**
```typescript
// Update rule to match decision
rules:update({
  ruleId: "auth-patterns",
  content: "Updated content matching decision-47"
});

// Or update decision to clarify
memory:decision:update({
  decisionId: "decision-47",
  implementationNotes: "See rule 'auth-patterns' for enforcement details"
});
```

---

**Next:** [06-MCP-PRIMITIVES.md](./06-MCP-PRIMITIVES.md) - Complete reference of tools, resources, and prompts