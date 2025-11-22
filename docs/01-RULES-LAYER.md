# Layer 1: Rules Engine

**Project-specific coding standards, conventions, and constraints enforced across any AI agent.**

## Overview

The Rules layer provides a universal system for defining, managing, and enforcing project-specific guidelines that AI agents must follow. Unlike scattered `.cursorrules` files or wiki pages, DevFlow Rules are structured, versioned, and automatically formatted for any AI platform.

## Design Principles

### 1. Declarative Configuration
Rules are written once in `.mdc` format and automatically converted to platform-specific formats (`.cursorrules`, `AGENTS.md`, etc.).

### 2. Activation Control
Three modes give fine-grained control:
- **`always`**: Auto-applied to every conversation
- **`manual`**: Applied on-demand via tool calls
- **`context`**: Applied when file patterns match current work

### 3. Priority System
When rules conflict, priority (1-10) determines precedence. Higher priority wins.

### 4. Git-Friendly
Markdown-based storage enables versioning, diffing, and team collaboration.

## File Format: `.mdc` (Markdown Component)

### Basic Structure

```markdown
---
id: typescript-standards
name: TypeScript Coding Standards
type: always
priority: 8
tags: [typescript, code-quality]
version: 1.2.0
globs: ["**/*.ts", "**/*.tsx"]
author: engineering-team
created: 2024-01-15
updated: 2024-03-20
---

# TypeScript Standards

## Type Safety
- Use explicit types for function parameters and return values
- Never use `any` - prefer `unknown` for truly dynamic types
- Enable `strict` mode in `tsconfig.json`

## Naming Conventions
- Functions: `camelCase` verbs (e.g., `getUserProfile`)
- Types/Interfaces: `PascalCase` nouns (e.g., `UserProfile`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)

## Error Handling
- Use Result types over throwing exceptions
- Exhaustive switch statements with `never` checks
- Log errors with context, not just messages

## References
- Decision: #23 (TypeScript adoption rationale)
- Docs: docs/architecture/typescript-guide.md
```

### Metadata Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | ✅ | string | Unique identifier (kebab-case) |
| `name` | ✅ | string | Human-readable name |
| `type` | ✅ | `always` \| `manual` \| `context` | Activation mode |
| `priority` | ✅ | 1-10 | Conflict resolution weight |
| `tags` | ❌ | string[] | Categorization labels |
| `version` | ❌ | semver | Rule version for tracking changes |
| `globs` | ❌ | string[] | File patterns (required for `context` type) |
| `author` | ❌ | string | Creator identifier |
| `created` | ❌ | ISO date | Creation timestamp |
| `updated` | ❌ | ISO date | Last modification timestamp |

### Content Guidelines

**Do:**
- Use clear, imperative language ("Use explicit types")
- Provide concrete examples
- Link to related decisions and documentation
- Explain *why* when non-obvious

**Don't:**
- Write essays - keep it scannable
- Duplicate documentation (link instead)
- Use vague language ("try to", "should consider")
- Include implementation details (belongs in docs)

## Storage Structure

```
.devflow/
└── rules/
    ├── global/
    │   ├── typescript-standards.mdc
    │   ├── git-commit-conventions.mdc
    │   └── security-guidelines.mdc
    ├── contextual/
    │   ├── api-route-patterns.mdc      # globs: ["src/api/**/*.ts"]
    │   ├── react-component-rules.mdc   # globs: ["src/components/**/*.tsx"]
    │   └── database-query-safety.mdc   # globs: ["src/db/**/*.ts"]
    └── manual/
        ├── performance-optimization.mdc
        └── accessibility-checklist.mdc
```

**Organization:**
- `global/`: Always-active rules (type: `always`)
- `contextual/`: Pattern-matched rules (type: `context`)
- `manual/`: On-demand rules (type: `manual`)

## MCP Primitives

### Resources

#### `devflow://context/rules`
**Auto-loaded at session start** - provides summary of active rules.

**Response Format:**
```json
{
  "uri": "devflow://context/rules",
  "mimeType": "text/markdown",
  "text": "# Active Project Rules\n\n## TypeScript Standards (priority: 8)\n- Explicit types required\n- No `any` usage\n\n## Git Conventions (priority: 7)\n- Conventional commits format\n- Reference issue numbers\n\n---\n3 always-active rules | 2 contextual rules ready | 4 manual rules available"
}
```

**Usage:**
Agents automatically receive this at conversation start. No explicit call needed.

#### `devflow://rules/{rule-id}`
**Individual rule retrieval** - full content of specific rule.

**Response Format:**
```json
{
  "uri": "devflow://rules/typescript-standards",
  "mimeType": "text/markdown",
  "text": "# TypeScript Standards\n\n## Type Safety\n..."
}
```

### Tools

#### `rules:create`
**Create a new rule from scratch or conversation.**

**Parameters:**
```typescript
{
  name: string;              // "React Component Guidelines"
  type: "always" | "manual" | "context";
  priority: 1-10;
  content: string;           // Markdown body
  globs?: string[];          // Required for context type
  tags?: string[];           // ["react", "components"]
  linkedDecisions?: string[];// ["decision-42"]
  linkedDocs?: string[];     // ["docs/architecture/react.md"]
}
```

**Returns:**
```typescript
{
  success: true,
  ruleId: "react-component-guidelines",
  path: ".devflow/rules/contextual/react-component-guidelines.mdc",
  message: "Rule created and will activate for files matching: src/components/**/*.tsx"
}
```

**Example:**
```typescript
await callTool("rules:create", {
  name: "Database Query Safety",
  type: "context",
  priority: 9,
  globs: ["src/db/**/*.ts", "src/api/models/**/*.ts"],
  content: `# Database Query Safety

## SQL Injection Prevention
- Use parameterized queries exclusively
- Never concatenate user input into SQL strings
- Validate and sanitize all inputs

## Performance
- Add EXPLAIN ANALYZE to complex queries
- Index foreign keys and frequently filtered columns
- Limit result sets in application code, not database`,
  tags: ["database", "security"],
  linkedDecisions: ["decision-15"]
});
```

#### `rules:update`
**Modify existing rule.**

**Parameters:**
```typescript
{
  ruleId: string;           // "typescript-standards"
  updates: {
    name?: string;
    type?: "always" | "manual" | "context";
    priority?: 1-10;
    content?: string;       // Full replacement
    globs?: string[];
    tags?: string[];
    linkedDecisions?: string[];
    linkedDocs?: string[];
  };
  versionBump?: "major" | "minor" | "patch"; // Auto-increment version
}
```

**Returns:**
```typescript
{
  success: true,
  ruleId: "typescript-standards",
  oldVersion: "1.2.0",
  newVersion: "1.3.0",
  message: "Rule updated successfully"
}
```

#### `rules:delete`
**Remove a rule.**

**Parameters:**
```typescript
{
  ruleId: string;
  confirm: true;  // Safety check
}
```

**Returns:**
```typescript
{
  success: true,
  message: "Rule 'legacy-patterns' deleted"
}
```

#### `rules:validate`
**Check code against active rules.**

**Parameters:**
```typescript
{
  filePath?: string;        // Validate specific file
  content?: string;         // Validate code snippet
  ruleIds?: string[];       // Limit to specific rules
}
```

**Returns:**
```typescript
{
  valid: false,
  violations: [
    {
      ruleId: "typescript-standards",
      ruleName: "TypeScript Coding Standards",
      severity: "error",
      line: 42,
      message: "Explicit return type required for function 'processUser'",
      suggestion: "Add ': Promise<UserProfile>' after parameter list"
    },
    {
      ruleId: "naming-conventions",
      severity: "warning",
      line: 15,
      message: "Function name should be camelCase verb",
      suggestion: "Rename 'ProcessData' to 'processData'"
    }
  ],
  summary: "2 violations found (1 error, 1 warning)"
}
```

#### `rules:activate`
**Manually activate a manual-type rule.**

**Parameters:**
```typescript
{
  ruleId: string;           // "performance-optimization"
  scope: "conversation" | "permanent";
}
```

**Returns:**
```typescript
{
  success: true,
  message: "Rule 'performance-optimization' activated for this conversation",
  rulesNowActive: 4
}
```

#### `rules:deactivate`
**Deactivate an always-active or manually-activated rule.**

**Parameters:**
```typescript
{
  ruleId: string;
  scope: "conversation" | "permanent";
}
```

#### `rules:list`
**Query available rules.**

**Parameters:**
```typescript
{
  type?: "always" | "manual" | "context";
  tags?: string[];          // Filter by tags
  active?: boolean;         // Show only currently active
  search?: string;          // Text search in name/content
}
```

**Returns:**
```typescript
{
  rules: [
    {
      id: "typescript-standards",
      name: "TypeScript Coding Standards",
      type: "always",
      priority: 8,
      active: true,
      tags: ["typescript", "code-quality"],
      version: "1.2.0"
    },
    // ... more rules
  ],
  total: 12,
  active: 3
}
```

#### `rules:import`
**Import rules from external formats.**

**Parameters:**
```typescript
{
  source: "cursorrules" | "agents-md" | "mdc";
  content: string;          // File content
  options?: {
    overwrite?: boolean;    // Replace existing rules
    prefix?: string;        // Add prefix to imported rule IDs
  };
}
```

**Returns:**
```typescript
{
  success: true,
  imported: 5,
  skipped: 2,
  conflicts: ["typescript-standards"],
  message: "Imported 5 rules, skipped 2 duplicates"
}
```

#### `rules:export`
**Export rules to external formats.**

**Parameters:**
```typescript
{
  target: "cursorrules" | "agents-md" | "markdown";
  ruleIds?: string[];       // Specific rules (default: all active)
  outputPath?: string;      // Where to write (default: stdout)
}
```

**Returns:**
```typescript
{
  success: true,
  format: "cursorrules",
  path: ".cursorrules",
  rulesExported: 3,
  content: "# TypeScript Standards\n\nUse explicit types..."
}
```

### Prompts

#### `init_session`
**Conversation initialization with rule loading.**

**Parameters:**
```typescript
{
  contextPath?: string;     // Current working directory
  includeManual?: string[]; // Manual rules to pre-activate
}
```

**Generated Prompt:**
```markdown
You are working on a project with the following active rules:

## TypeScript Standards (priority: 8)
- Use explicit types for all function signatures
- Never use `any` - prefer `unknown`
- Enable `strict` mode

## Git Commit Conventions (priority: 7)
- Follow conventional commits format
- Reference issue numbers in body

## API Route Patterns (priority: 6) [CONTEXTUAL: src/api/**/*.ts]
- Use tRPC for type-safe endpoints
- Validate inputs with Zod schemas

---

Additional manual rules available:
- performance-optimization (activate with rules:activate)
- accessibility-checklist (activate with rules:activate)

Follow these rules strictly in all code you write or suggest.
```

#### `create_rule_from_conversation`
**Extract rule from current discussion.**

**Parameters:**
```typescript
{
  conversationSummary: string; // Context of what was discussed
  suggestedName?: string;
  suggestedType?: "always" | "manual" | "context";
}
```

**Generated Prompt:**
```markdown
Based on our conversation about [summary], let's create a reusable rule.

Suggested structure:
- Name: [suggestedName or "extracted from discussion"]
- Type: [suggestedType or "always"]
- Priority: [inferred from importance]

Please provide:
1. Concise rule title
2. Key guidelines (bullet points)
3. Examples if helpful
4. Related decisions or docs to link

I'll format this as a .mdc rule for future use.
```

## Agent-Specific Formatting

### Cursor (`.cursorrules`)

**Input (.mdc):**
```markdown
---
id: typescript-standards
type: always
priority: 8
---

# TypeScript Standards

## Type Safety
- Use explicit types
- No `any`
```

**Output (`.cursorrules`):**
```
# TypeScript Standards

## Type Safety
- Use explicit types
- No `any`
```

*Note: Cursor doesn't support metadata, so it's stripped. Priority determines order.*

### GitHub Copilot (`AGENTS.md`)

**Input (.mdc):**
```markdown
---
id: api-conventions
type: always
---

# API Conventions

- RESTful endpoints
- OpenAPI documentation
```

**Output (`AGENTS.md`):**
```markdown
# API Conventions

- RESTful endpoints
- OpenAPI documentation

---
*Generated by DevFlow Rules Engine*
```

### Claude Desktop / Zed (Native MCP)

**Input (.mdc):**
Full metadata + content via `devflow://context/rules` resource.

**Output:**
Structured markdown with all metadata preserved in conversation context.

## Cross-Layer Integration

### Rules → Memory
```typescript
// Rule references a decision
{
  linkedDecisions: ["decision-47"]
}

// Memory decision logs why rule exists
{
  id: "decision-47",
  title: "Adopted TypeScript strict mode",
  rationale: "...",
  relatedRules: ["typescript-standards"]
}
```

### Rules → Documentation
```typescript
// Rule links to detailed guide
{
  linkedDocs: ["docs/architecture/typescript-guide.md"]
}

// Documentation references which rules apply
---
enforced_by: [typescript-standards, naming-conventions]
---
```

### Rules → Planning
```typescript
// Task validation checks rules
plan:task:update({
  taskId: "task-123",
  status: "done"
})

// Automatically runs rules:validate on changed files
// Blocks completion if violations found
```

## Conflict Resolution

### Priority System

When rules conflict (e.g., two naming conventions):
```markdown
# Rule A (priority: 8)
- Functions: camelCase

# Rule B (priority: 6)
- Functions: snake_case
```

**Result:** Rule A wins. Agent uses camelCase.

### Scope Narrowing

Context rules override global rules for matched files:
```markdown
# Global (priority: 7, type: always)
- Error handling: throw exceptions

# API Routes (priority: 8, type: context, globs: ["src/api/**"])
- Error handling: return Result types
```

**Result:** API files use Result types, others throw exceptions.

### Explicit Deactivation

```typescript
rules:deactivate({
  ruleId: "legacy-exception-handling",
  scope: "permanent"
})
```

## Performance Considerations

### Lazy Loading
- Only `always` rules loaded at session start
- `context` rules loaded when file patterns match
- `manual` rules loaded on explicit activation

### Caching
- Parsed rules cached in memory
- File watch triggers cache invalidation
- Validation results cached per file hash

### Indexing (Future)
- SQLite index for full-text search
- Tag-based querying
- Cross-reference resolution

## Best Practices

### Rule Granularity
**Too Broad:**
```markdown
# Coding Standards
- Write good code
- Follow best practices
```

**Just Right:**
```markdown
# TypeScript Function Signatures
- Explicit parameter types
- Explicit return types
- Use generics for reusable logic
```

### Versioning
- **Patch (1.2.0 → 1.2.1):** Typo fixes, clarifications
- **Minor (1.2.0 → 1.3.0):** New guidelines added
- **Major (1.2.0 → 2.0.0):** Breaking changes to standards

### Team Collaboration
```bash
# Developer workflow
git pull origin main
devflow rules:list --active  # See current rules
# ... work on feature ...
devflow rules:validate src/  # Check compliance
git commit -m "feat: implement OAuth (follows rule #23)"
```

## Migration Guide

### From `.cursorrules`
```bash
devflow rules:import --source cursorrules --content "$(cat .cursorrules)"
# Creates .devflow/rules/ structure
# Preserves content, adds default metadata
```

### From `AGENTS.md`
```bash
devflow rules:import --source agents-md --content "$(cat AGENTS.md)"
```

### From Wiki/Confluence
Manual process:
1. Copy content sections to .mdc files
2. Add metadata (id, type, priority)
3. Commit to `.devflow/rules/`

## Examples

### Example 1: Security Rule

```markdown
---
id: auth-token-handling
name: Authentication Token Security
type: always
priority: 10
tags: [security, authentication]
globs: ["src/auth/**/*.ts", "src/api/**/*.ts"]
linkedDecisions: ["decision-31"]
linkedDocs: ["docs/security/token-management.md"]
---

# Authentication Token Security

## Storage
- Never store tokens in localStorage (XSS vulnerable)
- Use httpOnly cookies for session tokens
- Use secure, sameSite flags

## Transmission
- Only send tokens over HTTPS
- Include CSRF tokens for state-changing operations
- Expire tokens after 1 hour, refresh after 15 minutes

## Validation
- Verify token signature on every request
- Check expiration timestamps
- Validate token audience matches current service
```

### Example 2: Contextual UI Rule

```markdown
---
id: react-hooks-patterns
name: React Hooks Best Practices
type: context
priority: 7
globs: ["src/components/**/*.tsx", "src/hooks/**/*.ts"]
tags: [react, hooks, frontend]
---

# React Hooks Best Practices

## Custom Hooks
- Prefix with `use` (e.g., `useUserProfile`)
- Return objects, not arrays (better refactoring)
- Document dependencies clearly

## useEffect
- One effect per concern
- Return cleanup functions
- List all dependencies (ESLint will help)

## Performance
- Wrap callbacks in useCallback when passed to children
- Memoize expensive computations with useMemo
- Use React.memo for pure components
```

### Example 3: Manual Performance Rule

```markdown
---
id: performance-optimization-checklist
name: Performance Optimization Checklist
type: manual
priority: 6
tags: [performance, optimization]
---

# Performance Optimization Checklist

Activate this rule when working on performance improvements.

## Measurement First
- Profile before optimizing (Chrome DevTools, Lighthouse)
- Set performance budgets (LCP < 2.5s, FID < 100ms)
- Use real user data, not synthetic

## Common Wins
- Code splitting at route boundaries
- Lazy load images (loading="lazy")
- Minimize bundle size (analyze-webpack-bundle)
- Use CDN for static assets

## Database
- Add indexes for frequently queried columns
- Use connection pooling
- Cache query results (Redis)
- Paginate large result sets
```

## Troubleshooting

### Rules Not Loading
```bash
# Check rule syntax
devflow rules:validate --check-syntax

# Verify file location
ls -la .devflow/rules/

# Check MCP connection
devflow status
```

### Conflicts Between Rules
```bash
# List all active rules with priorities
devflow rules:list --active --sort-by priority

# Deactivate conflicting rule temporarily
devflow rules:deactivate --rule-id old-naming-convention
```

### Agent Not Respecting Rules
1. Verify resource auto-loading: Check agent supports `devflow://context/rules`
2. Explicitly call `init_session` prompt if needed
3. Export to agent-specific format (`.cursorrules`, `AGENTS.md`)

---

**Next:** [02-MEMORY-LAYER.md](./02-MEMORY-LAYER.md) - Session continuity and decision tracking