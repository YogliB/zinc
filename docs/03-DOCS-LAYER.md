# Layer 3: Documentation Management

**AI-optimized project documentation with enforced structure, consistency validation, and cross-model compatibility.**

## Overview

The Documentation layer transforms project documentation from human-centric wikis into AI-friendly, structured knowledge bases. By enforcing templates, validating consistency, and optimizing for LLM comprehension, DevFlow Docs ensures AI agents can effectively understand and utilize project documentation.

## Design Principles

### 1. AI-First, Human-Friendly
Documentation optimized for LLM parsing while remaining readable for humans.

### 2. Template-Driven Structure
Three core templates (API, Architecture, Guide) ensure consistency and completeness.

### 3. Validation-Enforced Quality
Automated checks for heading hierarchy, code block labeling, terminology consistency, and cross-references.

### 4. Model-Specific Optimization
Generate documentation views optimized for different LLMs (Claude, GPT-4, Gemini).

## File Structure

```
docs/
├── api/                        # API reference documentation
│   ├── authentication.md
│   ├── users.md
│   └── sessions.md
├── architecture/               # System design and patterns
│   ├── overview.md
│   ├── authentication.md
│   ├── database.md
│   └── api-design.md
├── guides/                     # Step-by-step tutorials
│   ├── getting-started.md
│   ├── local-development.md
│   └── deployment.md
├── .templates/                 # Documentation templates
│   ├── api-template.md
│   ├── architecture-template.md
│   └── guide-template.md
└── .meta/                      # Metadata and validation rules
    ├── terminology.json        # Consistent term definitions
    ├── validation-rules.json   # Quality checks
    └── cross-references.json   # Link validation
```

## Template Specifications

### API Template

**Purpose:** Document functions, methods, endpoints, and their contracts.

**Structure:**
```markdown
---
type: api
category: [authentication, users, sessions, etc.]
stability: experimental | stable | deprecated
version: 1.0.0
related:
  architecture: [architecture/authentication.md]
  guides: [guides/oauth-setup.md]
updated: 2024-03-20
---

# API Name

**One-line description of what this API does.**

## Overview

Brief explanation of the API's purpose and when to use it.

## Endpoint/Function Signature

```typescript
function authenticateUser(
  credentials: UserCredentials,
  options?: AuthOptions
): Promise<AuthResult>
```

**Base URL:** `https://api.example.com/v1` (for REST APIs)
**Method:** `POST /auth/login` (for REST APIs)

## Parameters

### `credentials` (required)
**Type:** `UserCredentials`

User authentication credentials.

```typescript
interface UserCredentials {
  email: string;        // User email address
  password: string;     // User password (min 8 chars)
}
```

### `options` (optional)
**Type:** `AuthOptions`

Additional authentication options.

```typescript
interface AuthOptions {
  rememberMe?: boolean;     // Extend session duration (default: false)
  mfaToken?: string;        // Multi-factor auth token if enabled
}
```

## Return Value

**Type:** `Promise<AuthResult>`

```typescript
interface AuthResult {
  success: boolean;         // Whether authentication succeeded
  sessionId?: string;       // Session identifier (if success)
  user?: UserProfile;       // User information (if success)
  error?: AuthError;        // Error details (if failed)
}
```

## Errors

| Error Code | Reason | Resolution |
|------------|--------|------------|
| `INVALID_CREDENTIALS` | Email/password incorrect | Check credentials, attempt password reset |
| `ACCOUNT_LOCKED` | Too many failed attempts | Wait 15 minutes or contact support |
| `MFA_REQUIRED` | MFA token missing | Provide `mfaToken` in options |
| `RATE_LIMITED` | Too many requests | Wait and retry with exponential backoff |

## Examples

### Basic Authentication

```typescript
const result = await authenticateUser({
  email: 'user@example.com',
  password: 'securePassword123'
});

if (result.success) {
  console.log('Logged in:', result.user.name);
  console.log('Session:', result.sessionId);
} else {
  console.error('Auth failed:', result.error.code);
}
```

### With Remember Me

```typescript
const result = await authenticateUser(
  {
    email: 'user@example.com',
    password: 'securePassword123'
  },
  { rememberMe: true }
);
```

### With MFA

```typescript
const result = await authenticateUser(
  {
    email: 'user@example.com',
    password: 'securePassword123'
  },
  { mfaToken: '123456' }
);
```

## Implementation Notes

- Sessions expire after 1 hour of inactivity
- Cookies are httpOnly, secure, sameSite=strict
- Failed attempts are rate-limited (5 attempts per 15 minutes)
- MFA uses TOTP (Time-based One-Time Password)

## Related

- **Architecture:** [Authentication System](../architecture/authentication.md)
- **Guide:** [Setting Up OAuth](../guides/oauth-setup.md)
- **Rule:** [auth-token-handling](../../.devflow/rules/auth-token-handling.mdc)
- **Decision:** [#47: Session-based Auth](../../.devflow/memory/decisionLog.md#decision-47)

## Changelog

### 1.0.0 (2024-03-20)
- Initial API implementation
- Added MFA support
- Implemented rate limiting
```

### Architecture Template

**Purpose:** Document system design, patterns, and architectural decisions.

**Structure:**
```markdown
---
type: architecture
category: [backend, frontend, infrastructure, etc.]
status: proposed | accepted | deprecated
related:
  decisions: [decision-47, decision-46]
  api: [api/authentication.md]
  guides: [guides/local-development.md]
updated: 2024-03-20
---

# Architecture Topic

**One-line summary of the architectural area.**

## Problem Statement

What problem does this architecture solve? What requirements drove this design?

Example:
> The application requires user authentication with the ability to instantly revoke access when security incidents occur or users logout.

## Solution Overview

High-level description of the architectural approach.

Example:
> We implement session-based authentication using Redis as a centralized session store, enabling instant revocation and stateful session management.

## Architecture Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│  API Server  │────────▶│    Redis    │
│  (Browser)  │         │ (Express.js) │         │  (Sessions) │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │                        │
       │   1. POST /login       │                        │
       ├───────────────────────▶│                        │
       │                        │   2. Create session    │
       │                        ├───────────────────────▶│
       │                        │   3. Store user data   │
       │                        │◀───────────────────────┤
       │   4. Set-Cookie        │                        │
       │◀───────────────────────┤                        │
```

## Components

### API Server
**Technology:** Express.js + TypeScript  
**Responsibility:** Handle authentication requests, validate credentials, manage sessions

Key modules:
- `src/auth/session.ts` - Session management logic
- `src/middleware/auth.ts` - Authentication middleware
- `src/routes/auth.ts` - Authentication endpoints

### Session Store
**Technology:** Redis  
**Responsibility:** Persist session data, enable instant revocation

Configuration:
- Host: `REDIS_HOST` environment variable
- Port: `6379` (default)
- TTL: 1 hour (3600 seconds)
- Connection pooling: Max 10 connections

### Session Structure
```typescript
interface Session {
  userId: string;           // User identifier
  createdAt: string;        // ISO timestamp
  expiresAt: string;        // ISO timestamp
  lastActivity: string;     // ISO timestamp
  metadata: {
    userAgent: string;      // Client user agent
    ip: string;             // Client IP address
  };
}
```

## Data Flow

### Authentication Flow

1. **Client Request**
   - User submits email/password via POST `/auth/login`
   - Request includes credentials in body

2. **Credential Validation**
   - API server queries database for user
   - Compares password hash using bcrypt
   - Validates account status (not locked/disabled)

3. **Session Creation**
   - Generate unique session ID (UUID v4)
   - Store session in Redis with TTL
   - Set httpOnly cookie with session ID

4. **Response**
   - Return user profile (without sensitive data)
   - Client stores cookie automatically

### Authenticated Request Flow

1. **Client Request**
   - Browser automatically sends session cookie
   - Middleware intercepts request

2. **Session Validation**
   - Extract session ID from cookie
   - Query Redis for session data
   - Verify session not expired

3. **Request Processing**
   - Attach user context to request object
   - Proceed to route handler

4. **Session Extension**
   - Update `lastActivity` timestamp
   - Reset TTL to 1 hour

### Logout Flow

1. **Client Request**
   - User triggers logout (POST `/auth/logout`)

2. **Session Revocation**
   - Delete session from Redis
   - Clear cookie on client

3. **Immediate Effect**
   - Subsequent requests fail authentication
   - User must re-login

## Design Decisions

### Why Sessions Over JWT?

**Decision:** Use stateful sessions instead of stateless JWT tokens

**Rationale:**
1. **Instant Revocation:** Sessions can be deleted immediately (security requirement)
2. **Team Familiarity:** 3+ years experience with sessions vs 6 months with JWT
3. **Simplicity:** Avoid JWT refresh token complexity
4. **Infrastructure:** Redis already deployed for caching

**Trade-offs:**
- ✅ Instant logout/revocation
- ✅ Smaller request payloads (cookie vs JWT)
- ✅ Simple implementation
- ❌ Requires Redis dependency
- ❌ Slightly higher latency (session lookup)
- ❌ More complex horizontal scaling

See: [Decision #47](../../.devflow/memory/decisionLog.md#decision-47)

### Why Redis Over In-Memory Sessions?

**Decision:** Use Redis instead of in-memory session store

**Rationale:**
1. **Persistence:** Sessions survive server restarts
2. **Scalability:** Multiple server instances share sessions
3. **Performance:** Redis lookups ~1-2ms, acceptable overhead

**Trade-offs:**
- ✅ High availability
- ✅ Multi-instance support
- ❌ External dependency (Redis)
- ❌ Network latency (vs in-memory)

## Security Considerations

### Session Security

**Session ID Generation:**
- Use cryptographically secure random UUIDs
- 128-bit entropy minimum
- Never expose in URLs or logs

**Cookie Settings:**
```typescript
{
  httpOnly: true,        // Prevent XSS access
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  maxAge: 3600000        // 1 hour in milliseconds
}
```

**Session Fixation Prevention:**
- Regenerate session ID after login
- Invalidate old session completely

### Rate Limiting

- **Login attempts:** 5 per 15 minutes per IP
- **Session creation:** 10 per hour per user
- **Failed auth:** Exponential backoff (1s, 2s, 4s, 8s, 15s)

### Monitoring

**Key Metrics:**
- Active sessions count
- Session creation rate
- Failed authentication attempts
- Average session duration

**Alerts:**
- Failed auth rate > 100/minute (potential attack)
- Active sessions > 10,000 (capacity planning)
- Redis connection failures

## Performance

**Benchmarks:**
- Session lookup: 12ms average (50ms P99)
- Session creation: 18ms average
- Session deletion: 8ms average

**Optimizations:**
- Redis connection pooling (max 10 connections)
- Session data minimization (store user ID only, fetch profile on-demand)
- Lazy session extension (only update lastActivity every 5 minutes)

## Scalability

**Current Capacity:**
- Max concurrent sessions: 50,000
- Max requests/second: 1,000 (single server)

**Scaling Strategy:**
- Horizontal: Add API servers behind load balancer
- Load balancer: Round-robin (Redis shared state)
- Redis: Single instance (sufficient for 50k sessions)
- Future: Redis Cluster if > 100k sessions

## Testing Strategy

**Unit Tests:**
- Session creation/retrieval/deletion
- Cookie parsing and validation
- Expiration logic

**Integration Tests:**
- Full authentication flow (login → request → logout)
- Session persistence across server restarts
- Concurrent session handling

**Security Tests:**
- Session fixation attempts
- CSRF attack simulation
- XSS cookie access attempts

## Deployment

**Environment Variables:**
```bash
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=<secret>
SESSION_SECRET=<random-256-bit-key>
SESSION_TTL=3600
```

**Dependencies:**
- Redis 6.0+ (required)
- Node.js 20+ (required)

**Health Checks:**
- Redis connection: `redis.ping()`
- Session store: Create/read/delete test session

## Related

- **API:** [Authentication API](../api/authentication.md)
- **Guide:** [Local Development Setup](../guides/local-development.md)
- **Rule:** [auth-token-handling](../../.devflow/rules/auth-token-handling.mdc)
- **Decision:** [#47](../../.devflow/memory/decisionLog.md#decision-47)

## Changelog

### 1.0.0 (2024-03-20)
- Initial architecture design
- Session-based authentication implemented
- Redis integration complete
```

### Guide Template

**Purpose:** Step-by-step tutorials and how-to documentation.

**Structure:**
```markdown
---
type: guide
difficulty: beginner | intermediate | advanced
estimated_time: 15 minutes
prerequisites:
  - Node.js 20+ installed
  - Git configured
  - Access to repository
related:
  architecture: [architecture/overview.md]
  api: [api/authentication.md]
updated: 2024-03-20
---

# Guide Title

**One-line description of what you'll learn.**

Example: Learn how to set up the development environment and run the application locally.

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 20+ installed (`node --version` to check)
- ✅ Git configured with SSH keys
- ✅ Access to the repository
- ✅ (Optional) Docker for running Redis locally

## What You'll Build/Learn

By the end of this guide, you will:

1. Clone and set up the project locally
2. Configure environment variables
3. Start the development server
4. Verify the setup works correctly

**Estimated Time:** 15 minutes

## Step 1: Clone the Repository

Clone the project from GitHub:

```bash
git clone git@github.com:example/project.git
cd project
```

**Verify:**
```bash
ls -la
# You should see: package.json, src/, docs/, etc.
```

## Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

This will install:
- Express.js (API server)
- TypeScript (type safety)
- Redis client (session storage)
- Testing libraries (Jest, Playwright)

**Expected Output:**
```
added 247 packages in 12s
```

**Troubleshooting:**
- If you see `EACCES` errors, avoid using `sudo`. Fix npm permissions instead.
- If installation fails, delete `node_modules/` and `package-lock.json`, then retry.

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devflow

# Redis (Session Storage)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Session Security
SESSION_SECRET=your-random-256-bit-secret-here

# Application
NODE_ENV=development
PORT=3000
```

**Generate Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste into `SESSION_SECRET`.

## Step 4: Start Redis (Development)

### Option A: Using Docker (Recommended)

```bash
docker run -d \
  --name devflow-redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Verify:**
```bash
docker ps | grep devflow-redis
# Should show container running
```

### Option B: Using Local Redis

If you have Redis installed locally:

```bash
redis-server --daemonize yes
```

**Verify:**
```bash
redis-cli ping
# Should respond: PONG
```

## Step 5: Run Database Migrations

Set up the database schema:

```bash
npm run db:migrate
```

**Expected Output:**
```
✓ Running migrations...
✓ Applied: 001_create_users_table
✓ Applied: 002_create_sessions_table
✓ Database is up to date
```

**Seed Sample Data (Optional):**
```bash
npm run db:seed
```

## Step 6: Start Development Server

Start the application in development mode:

```bash
npm run dev
```

**Expected Output:**
```
[DevFlow] Starting development server...
[DevFlow] TypeScript compilation: ✓
[DevFlow] Redis connection: ✓
[DevFlow] Database connection: ✓
[DevFlow] Server running at http://localhost:3000
[DevFlow] Press Ctrl+C to stop
```

The server will automatically reload when you modify files.

## Step 7: Verify Setup

Test that everything works:

### Check Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-20T14:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Test Authentication Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "email": "demo@example.com",
    "name": "Demo User"
  },
  "sessionId": "abc123..."
}
```

## Next Steps

Now that your development environment is set up:

1. **Explore the Code:** Start with `src/index.ts` for the entry point
2. **Read Architecture Docs:** [Architecture Overview](../architecture/overview.md)
3. **Try Making Changes:** Edit `src/routes/auth.ts` and see hot-reload in action
4. **Run Tests:** `npm test` to run the test suite
5. **Build Features:** Follow the [Planning Guide](../guides/feature-planning.md)

## Common Issues

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Redis Connection Failed

**Error:** `Error: Redis connection to localhost:6379 failed`

**Solutions:**
1. Check Redis is running: `redis-cli ping`
2. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`
3. If using Docker, ensure container is running: `docker ps`

### Database Migration Failed

**Error:** `Error: connect ECONNREFUSED`

**Solutions:**
1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Check database exists: `psql -l | grep devflow`
4. Create database if missing: `createdb devflow`

### TypeScript Compilation Errors

**Error:** Various TypeScript errors on startup

**Solutions:**
1. Delete `node_modules/` and reinstall: `npm install`
2. Clear TypeScript cache: `rm -rf dist/`
3. Verify TypeScript version: `npx tsc --version` (should be 5.3+)

## Related Resources

- **Architecture:** [System Overview](../architecture/overview.md)
- **API Reference:** [Authentication API](../api/authentication.md)
- **Advanced Guide:** [Deployment Guide](../guides/deployment.md)

## Feedback

Found an issue with this guide? [Open an issue](https://github.com/example/project/issues) or submit a pull request.

**Last Updated:** 2024-03-20  
**Tested On:** macOS 14, Ubuntu 22.04, Windows 11
```

## MCP Primitives

### Resources

#### `devflow://docs/*`
**Individual documentation files.**

**Example:**
```json
{
  "uri": "devflow://docs/api/authentication.md",
  "mimeType": "text/markdown",
  "text": "# Authentication API\n\n..."
}
```

#### `devflow://docs/index`
**Documentation index with all files.**

**Response Format:**
```json
{
  "uri": "devflow://docs/index",
  "mimeType": "application/json",
  "text": "{\"api\":[\"authentication.md\",\"users.md\"],\"architecture\":[\"overview.md\"]}"
}
```

### Tools

#### `doc:create`
**Create new documentation file from template.**

**Parameters:**
```typescript
{
  type: "api" | "architecture" | "guide";
  title: string;                    // "Authentication API"
  category: string;                 // "authentication"
  path?: string;                    // Custom path (default: auto-generated)
  content?: string;                 // Pre-filled content
  metadata?: {
    stability?: "experimental" | "stable" | "deprecated";
    difficulty?: "beginner" | "intermediate" | "advanced";
    related?: {
      architecture?: string[];
      api?: string[];
      guides?: string[];
      decisions?: string[];
      rules?: string[];
    };
  };
}
```

**Returns:**
```typescript
{
  success: true,
  path: "docs/api/authentication.md",
  template: "api-template",
  message: "Documentation created. Fill in the template sections."
}
```

**Example:**
```typescript
await callTool("doc:create", {
  type: "api",
  title: "Authentication API",
  category: "authentication",
  metadata: {
    stability: "stable",
    related: {
      architecture: ["architecture/authentication.md"],
      decisions: ["decision-47"]
    }
  }
});
```

#### `doc:update`
**Update existing documentation.**

**Parameters:**
```typescript
{
  path: string;                     // "docs/api/authentication.md"
  content?: string;                 // Full replacement
  metadata?: Record<string, any>;   // Update frontmatter
  section?: {
    heading: string;                // "Examples"
    content: string;                // New content for that section
  };
}
```

#### `doc:validate`
**Validate documentation quality.**

**Parameters:**
```typescript
{
  path?: string;                    // Specific file (default: all)
  checks?: string[];                // Specific checks (default: all)
}
```

**Returns:**
```typescript
{
  valid: false,
  violations: [
    {
      path: "docs/api/authentication.md",
      rule: "heading-hierarchy",
      severity: "error",
      line: 42,
      message: "Heading level skipped (h2 → h4)",
      suggestion: "Use h3 instead of h4"
    },
    {
      path: "docs/api/authentication.md",
      rule: "code-block-labels",
      severity: "warning",
      line: 78,
      message: "Code block missing language label",
      suggestion: "Add language after opening backticks: ```typescript"
    },
    {
      path: "docs/architecture/overview.md",
      rule: "broken-link",
      severity: "error",
      line: 15,
      message: "Link target does not exist: ../api/nonexistent.md"
    }
  ],
  summary: {
    total: 3,
    errors: 2,
    warnings: 1,
    filesChecked: 2
  }
}
```

**Validation Rules:**
- **heading-hierarchy**: No skipped heading levels (h1 → h2 → h3)
- **code-block-labels**: All code blocks have language labels
- **terminology-consistency**: Use approved terms from terminology.json
- **cross-references**: All links point to existing files
- **required-sections**: Templates have all required sections
- **frontmatter-schema**: Metadata matches template schema

#### `doc:consistency:check`
**Check terminology and phrasing consistency.**

**Parameters:**
```typescript
{
  paths?: string[];                 // Specific files (default: all)
  terminology?: boolean;            // Check term consistency
  phrasing?: boolean;               // Check similar concepts worded differently
}
```

**Returns:**
```typescript
{
  issues: [
    {
      type: "terminology",
      term: "login",
      preferred: "authentication",
      occurrences: [
        { file: "docs/api/users.md", line: 23 },
        { file: "docs/guides/getting-started.md", line: 45 }
      ],
      suggestion: "Use 'authentication' instead of 'login' for consistency"
    },
    {
      type: "phrasing",
      concept: "session duration",
      variants: [
        { phrase: "session expires after 1 hour", file: "docs/api/auth.md" },
        { phrase: "sessions last 60 minutes", file: "docs/architecture/auth.md" }
      ],
      suggestion: "Standardize to one phrasing"
    }
  ]
}
```

#### `doc:optimize:llm`
**Optimize documentation for specific LLM.**

**Parameters:**
```typescript
{
  path: string;                     // File to optimize
  model: "claude" | "gpt4" | "gemini" | "universal";
  outputPath?: string;              // Where to save optimized version
}
```

**Returns:**
```typescript
{
  success: true,
  optimizations: [
    "Shortened paragraphs for Claude's preference",
    "Added more code examples (GPT-4 learns better with examples)",
    "Restructured headings for better token efficiency"
  ],
  originalSize: "12,450 chars",
  optimizedSize: "10,200 chars",
  path: "docs/.optimized/claude/api/authentication.md"
}
```

**Optimization Strategies:**

**Claude:**
- Clear, hierarchical headings
- Concise paragraphs (2-3 sentences)
- Bullet points over prose
- Code examples with clear labels

**GPT-4:**
- More code examples (learns by example)
- Explicit step numbering
- Detailed error handling
- Pattern explanations

**Gemini:**
- Structured data (tables, lists)
- Visual descriptions (diagram descriptions)
- Comparative examples (before/after)
- Explicit relationships

#### `doc:search`
**Search documentation content.**

**Parameters:**
```typescript
{
  query: string;                    // "authentication flow"
  type?: "api" | "architecture" | "guide";
  category?: string;
  limit?: number;
}
```

**Returns:**
```typescript
{
  results: [
    {
      path: "docs/architecture/authentication.md",
      title: "Authentication Architecture",
      type: "architecture",
      relevance: 0.95,
      snippet: "...authentication flow starts when the client submits credentials...",
      section: "Data Flow > Authentication Flow"
    },
    {
      path: "docs/api/authentication.md",
      title: "Authentication API",
      type: "api",
      relevance: 0.87,
      snippet: "...authenticateUser function handles the authentication flow...",
      section: "Examples"
    }
  ]
}
```

#### `doc:link:add`
**Add cross-reference to documentation.**

**Parameters:**
```typescript
{
  from: string;                     // Source file
  to: string;                       // Target file
  context: string;                  // Where to add link
  linkText?: string;                // Custom link text
}
```

**Example:**
```typescript
await callTool("doc:link:add", {
  from: "docs/api/authentication.md",
  to: "docs/architecture/authentication.md",
  context: "Related",
  linkText: "Authentication System Architecture"
});
```

#### `doc:terminology:define`
**Add term to approved terminology.**

**Parameters:**
```typescript
{
  term: string;                     // "authentication"
  definition: string;
  aliases?: string[];               // ["auth", "login"]
  preferredUsage: string;           // When to use this term
  avoid?: string[];                 // Terms to avoid
}
```

### Prompts

#### `create_documentation`
**Guided documentation creation.**

**Parameters:**
```typescript
{
  type: "api" | "architecture" | "guide";
  context?: string;                 // What should be documented
}
```

**Generated Prompt:**
```markdown
Let's create comprehensive [type] documentation.

I'll guide you through the template sections:

**For API Documentation:**
1. What does this API do? (one-line summary)
2. Function/endpoint signature
3. Parameters and types
4. Return values and errors
5. Usage examples
6. Related architecture/guides

**For Architecture Documentation:**
1. What problem does this solve?
2. How does the solution work?
3. What are the key components?
4. What design decisions were made?
5. What are the trade-offs?

**For Guide Documentation:**
1. What will users learn?
2. What are the prerequisites?
3. What are the step-by-step instructions?
4. How do users verify success?
5. What are common issues?

Let's start with the summary. What does this document?
```

## Validation Rules

### Heading Hierarchy

**Rule:** No skipped heading levels.

**Valid:**
```markdown
# Title
## Section
### Subsection
```

**Invalid:**
```markdown
# Title
### Subsection  ❌ Skipped h2
```

### Code Block Labels

**Rule:** All code blocks must have language labels.

**Valid:**
```markdown
```typescript
const x = 10;
```
```

**Invalid:**
```markdown
```
const x = 10;  ❌ No language label
```
```

### Terminology Consistency

**Rule:** Use approved terms from `terminology.json`.

**Example Terminology File:**
```json
{
  "authentication": {
    "preferred": "authentication",
    "aliases": ["auth"],
    "avoid": ["login", "sign-in"],
    "usage": "Use when referring to the process of verifying user identity"
  },
  "session": {
    "preferred": "session",
    "aliases": [],
    "avoid": ["session token", "auth token"],
    "usage": "Use for stateful authentication mechanism"
  }
}
```

### Cross-References

**Rule:** All documentation links must point to existing files.

**Valid:**
```markdown
See [Architecture](../architecture/authentication.md)
```

**Invalid:**
```markdown
See [Architecture](../architecture/nonexistent.md)  ❌ File doesn't exist
```

## Cross-Layer Integration

### Documentation → Rules

```typescript
// Rule references documentation
{
  ruleId: "auth-token-handling",
  linkedDocs: ["docs/architecture/authentication.md"]
}

// Documentation lists enforcing rules
---
enforced_by: [auth-token-handling, session-security]
---
```

### Documentation → Memory

```typescript
// Decision updates documentation
memory:decision:log({
  title: "Session-based Auth",
  relatedDocs: ["docs/architecture/authentication.md"]
})

// Triggers suggestion to update docs
// "Decision #47 impacts docs/architecture/authentication.md"
// "Consider updating 'Design Decisions' section"
```

### Documentation → Planning

```typescript
// Tasks reference documentation
plan:task:create({
  title: "Implement authentication",
  documentation: ["docs/architecture/authentication.md", "docs/api/authentication.md"]
})

// Task completion checks doc freshness
// "Task modified src/auth/session.ts"
// "Documentation docs/api/authentication.md may need updates"
```

## LLM Optimization Strategies

### Claude Optimization

**Preferences:**
- Clear hierarchy (H1 > H2 > H3)
- Short paragraphs (2-3 sentences)
- Bullet points > long prose
- Code examples with clear purpose

**Example Transformation:**

**Before:**
```markdown
The authentication system uses sessions which are stored in Redis and this provides several benefits including instant revocation capability and stateful session management which is important for our security requirements.
```

**After (Claude-optimized):**
```markdown
The authentication system uses session-based auth:
- Sessions stored in Redis
- Instant revocation capability
- Stateful management for security
```

### GPT-4 Optimization

**Preferences:**
- More code examples
- Explicit step numbering
- Detailed error scenarios
- Before/after patterns

**Example:**

```markdown
## Authentication Flow

**Step 1:** Client sends credentials
```typescript
POST /auth/login
{ "email": "user@example.com", "password": "secret" }
```

**Step 2:** Server validates credentials
```typescript
const user = await db.findByEmail(credentials.email);
if (!user || !await bcrypt.compare(credentials.password, user.passwordHash)) {
  throw new AuthError('INVALID_CREDENTIALS');
}
```

**Step 3:** Create session
```typescript
const sessionId = uuid.v4();
await redis.set(`session:${sessionId}`, { userId: user.id }, { EX: 3600 });
```
```

### Gemini Optimization

**Preferences:**
- Structured data (tables)
- Visual descriptions
- Comparative examples
- Explicit relationships

**Example:**

```markdown
## Authentication Methods Comparison

| Method | Security | Performance | Complexity | Best For |
|--------|----------|-------------|------------|----------|
| Sessions | High | Medium | Low | Traditional web apps |
| JWT | Medium | High | Medium | Microservices |
| OAuth | High | Medium | High | Third-party integration |

**Visual Flow:**
```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────▶│ Server  │────▶│  Redis  │
└─────────┘     └─────────┘     └─────────┘
    │                │                │
    │ Credentials    │                │
    ├───────────────▶│                │
    │                │ Validate       │
    │                ├───────────────▶│
    │                │ Create Session │
    │                │◀───────────────┤
    │   Cookie       │                │
    │◀───────────────┤                │
```
```

## Best Practices

### Documentation Writing

**Do:**
- Start with one-line summaries
- Use concrete examples
- Link to related resources
- Keep sections focused
- Update when code changes

**Don't:**
- Write walls of text
- Assume prior knowledge
- Duplicate information (link instead)
- Use vague language ("might", "usually")
- Let docs get stale

### Template Usage

**Choose API Template When:**
- Documenting functions, methods, endpoints
- Specifying contracts and types
- Providing usage examples

**Choose Architecture Template When:**
- Explaining system design
- Documenting patterns
- Describing component interactions

**Choose Guide Template When:**
- Creating tutorials
- Writing how-to instructions
- Onboarding new developers

### Maintenance

**Update Documentation When:**
- Code behavior changes
- New features added
- APIs deprecated
- Architecture evolves
- Decisions made

**Review Schedule:**
- Weekly: Check broken links
- Monthly: Validate terminology consistency
- Quarterly: Full documentation audit
- After major releases: Update all affected docs

## Troubleshooting

### Validation Failures

```bash
# Check all documentation
devflow doc:validate

# Fix heading hierarchy
# Manually adjust heading levels to not skip

# Fix code block labels
# Add language after opening backticks
```

### Broken Links

```bash
# Find all broken links
devflow doc:validate --checks=cross-references

# Update links to new file locations
# Or use doc:link:add to create proper references
```

### Terminology Inconsistency

```bash
# Check terminology
devflow doc:consistency:check --terminology

# Define preferred terms
devflow doc:terminology:define --term "authentication" --avoid "login"

# Update files to use preferred terms
```

---

**Next:** [04-PLANNING-LAYER.md](./04-PLANNING-LAYER.md) - Task planning with automatic validation