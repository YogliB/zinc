# Layer 4: Planning & Validation

**Feature planning with task decomposition, dependency management, and automatic execution validation.**

## Overview

The Planning layer transforms feature planning from manual tracking into an intelligent system that not only organizes tasks but automatically validates their completion. Unlike existing planning tools that rely on manual status updates, DevFlow Planning monitors file changes, test results, and git commits to provide confidence scores for task completion.

## Design Principles

### 1. Automatic Validation
Tasks are validated by monitoring:
- File changes since task started
- Test execution and results
- Git commits referencing task IDs
- Linting and type-checking status

### 2. Dependency Management
Tasks declare dependencies and cannot be marked complete until dependencies are satisfied.

### 3. Complexity Scoring
Tasks rated 1-10 for effort estimation and velocity tracking.

### 4. Milestone Grouping
Tasks organized into deliverable milestones with progress tracking.

## File Structure

```
.devflow/
└── plans/
    ├── active/
    │   ├── feature-123.json       # OAuth authentication
    │   ├── feature-124.json       # User profile management
    │   └── feature-125.json       # API rate limiting
    ├── completed/
    │   ├── feature-100.json       # Project setup (archived)
    │   ├── feature-101.json       # Database layer (archived)
    │   └── ...
    └── templates/
        ├── small.json             # 1-3 tasks, < 1 week
        ├── medium.json            # 4-8 tasks, 1-2 weeks
        ├── large.json             # 9-15 tasks, 2-4 weeks
        └── xl.json                # 16+ tasks, 4+ weeks
```

## Plan Schema

### Plan Structure

```json
{
  "id": "feature-123",
  "name": "OAuth Authentication",
  "description": "Implement OAuth authentication with Google and GitHub providers",
  "status": "in_progress",
  "size": "medium",
  "created": "2024-03-01T10:00:00Z",
  "started": "2024-03-10T09:00:00Z",
  "targetCompletion": "2024-03-25T17:00:00Z",
  "actualCompletion": null,
  "milestones": [
    {
      "id": "milestone-1",
      "name": "Research & Design",
      "status": "completed",
      "tasks": ["task-456", "task-457"],
      "completedAt": "2024-03-12T16:00:00Z"
    },
    {
      "id": "milestone-2",
      "name": "Implementation",
      "status": "in_progress",
      "tasks": ["task-458", "task-459", "task-460"],
      "completedAt": null
    },
    {
      "id": "milestone-3",
      "name": "Testing & Deployment",
      "status": "not_started",
      "tasks": ["task-461", "task-462"],
      "completedAt": null
    }
  ],
  "tasks": [
    {
      "id": "task-456",
      "title": "Research OAuth providers and flows",
      "description": "Evaluate Google, GitHub, and Facebook OAuth implementations. Document recommended flow.",
      "status": "completed",
      "complexity": 3,
      "dependencies": [],
      "milestone": "milestone-1",
      "assignee": "yogev",
      "created": "2024-03-01T10:00:00Z",
      "started": "2024-03-10T09:00:00Z",
      "completed": "2024-03-11T15:30:00Z",
      "validation": {
        "method": "manual",
        "confidence": 1.0,
        "evidence": {
          "filesChanged": ["docs/research/oauth-providers.md"],
          "commits": ["a1b2c3d"],
          "notes": "Research document reviewed and approved"
        }
      }
    },
    {
      "id": "task-457",
      "title": "Design session architecture",
      "description": "Design how sessions will be stored, managed, and invalidated. Document in architecture docs.",
      "status": "completed",
      "complexity": 5,
      "dependencies": ["task-456"],
      "milestone": "milestone-1",
      "assignee": "yogev",
      "created": "2024-03-01T10:00:00Z",
      "started": "2024-03-11T16:00:00Z",
      "completed": "2024-03-12T16:00:00Z",
      "validation": {
        "method": "automatic",
        "confidence": 0.95,
        "evidence": {
          "filesChanged": [
            "docs/architecture/authentication.md",
            ".devflow/memory/decisionLog.md"
          ],
          "commits": ["d4e5f6g"],
          "decisionLogged": "decision-47",
          "testsAdded": false,
          "lintPassed": true
        }
      }
    },
    {
      "id": "task-458",
      "title": "Implement SessionManager class",
      "description": "Create SessionManager with Redis integration for session CRUD operations.",
      "status": "in_progress",
      "complexity": 7,
      "dependencies": ["task-457"],
      "milestone": "milestone-2",
      "assignee": "yogev",
      "created": "2024-03-01T10:00:00Z",
      "started": "2024-03-20T09:00:00Z",
      "completed": null,
      "validation": {
        "method": "automatic",
        "confidence": 0.6,
        "evidence": {
          "filesChanged": ["src/auth/session.ts"],
          "commits": [],
          "testsAdded": true,
          "testsPassed": false,
          "lintPassed": true,
          "typeCheckPassed": true,
          "blockers": ["Tests failing due to Redis mock issues"]
        }
      },
      "validationCriteria": {
        "requiredFiles": ["src/auth/session.ts", "src/auth/session.test.ts"],
        "requiredTests": ["session creation", "session retrieval", "session deletion", "session expiration"],
        "mustPassLint": true,
        "mustPassTypeCheck": true,
        "mustPassTests": true,
        "coverageThreshold": 0.8
      }
    }
  ],
  "metrics": {
    "totalTasks": 7,
    "completedTasks": 2,
    "inProgressTasks": 1,
    "blockedTasks": 0,
    "notStartedTasks": 4,
    "totalComplexity": 35,
    "completedComplexity": 8,
    "averageConfidence": 0.85,
    "estimatedDaysRemaining": 3.5,
    "velocityPoints": 2.3
  },
  "relatedResources": {
    "decisions": ["decision-47"],
    "rules": ["auth-token-handling"],
    "documentation": [
      "docs/architecture/authentication.md",
      "docs/api/authentication.md"
    ]
  }
}
```

## Task Complexity Scale

| Level | Effort | Description | Examples |
|-------|--------|-------------|----------|
| 1 | 15-30min | Trivial change | Fix typo, update config value |
| 2 | 30min-1hr | Simple task | Add logging, simple validation |
| 3 | 1-2hrs | Small feature | Create simple component, add endpoint |
| 4 | 2-4hrs | Moderate task | Implement service class, add middleware |
| 5 | 4-8hrs | Standard feature | Full CRUD operations, complex component |
| 6 | 1 day | Large task | Integration with third-party service |
| 7 | 1-2 days | Complex feature | Authentication system, file upload |
| 8 | 2-3 days | Very complex | Search implementation, caching layer |
| 9 | 3-5 days | Major feature | Admin dashboard, reporting system |
| 10 | 5+ days | Epic-level | Complete subsystem, major refactor |

## MCP Primitives

### Resources

#### `devflow://plans/active`
**Auto-loaded at session start** - provides active plan summaries.

**Response Format:**
```json
{
  "uri": "devflow://plans/active",
  "mimeType": "text/markdown",
  "text": "# Active Plans\n\n## OAuth Authentication (feature-123)\n**Progress:** 2/7 tasks (29%)\n**Status:** In progress\n**Next:** Implement SessionManager class\n\n## User Profile Management (feature-124)\n**Progress:** 0/5 tasks (0%)\n**Status:** Not started\n**Blocked:** Waiting for OAuth completion"
}
```

#### `devflow://plans/{plan-id}`
**Individual plan retrieval** - full plan data.

**Response Format:**
```json
{
  "uri": "devflow://plans/feature-123",
  "mimeType": "application/json",
  "text": "{\"id\":\"feature-123\",\"name\":\"OAuth Authentication\",...}"
}
```

### Tools

#### `plan:create`
**Create new feature plan.**

**Parameters:**
```typescript
{
  name: string;                      // "OAuth Authentication"
  description: string;               // What this feature does
  size?: "small" | "medium" | "large" | "xl";
  targetCompletion?: string;         // ISO date
  milestones?: Array<{
    name: string;
    tasks: string[];                 // Task titles to create
  }>;
  relatedDecisions?: string[];       // Decision IDs
  relatedRules?: string[];           // Rule IDs
  relatedDocs?: string[];            // Doc paths
}
```

**Returns:**
```typescript
{
  success: true,
  planId: "feature-123",
  path: ".devflow/plans/active/feature-123.json",
  tasksCreated: 7,
  message: "Plan created with 3 milestones and 7 tasks"
}
```

**Example:**
```typescript
await callTool("plan:create", {
  name: "OAuth Authentication",
  description: "Implement OAuth authentication with Google and GitHub providers",
  size: "medium",
  targetCompletion: "2024-03-25",
  milestones: [
    {
      name: "Research & Design",
      tasks: [
        "Research OAuth providers and flows",
        "Design session architecture"
      ]
    },
    {
      name: "Implementation",
      tasks: [
        "Implement SessionManager class",
        "Integrate Passport.js",
        "Add OAuth callback routes"
      ]
    },
    {
      name: "Testing & Deployment",
      tasks: [
        "Write integration tests",
        "Deploy to staging"
      ]
    }
  ],
  relatedDecisions: ["decision-47"],
  relatedDocs: ["docs/architecture/authentication.md"]
});
```

#### `plan:task:add`
**Add task to existing plan.**

**Parameters:**
```typescript
{
  planId: string;                    // "feature-123"
  title: string;                     // "Implement rate limiting"
  description?: string;
  complexity: 1-10;
  dependencies?: string[];           // Task IDs this depends on
  milestone?: string;                // Milestone ID
  assignee?: string;
  validationCriteria?: {
    requiredFiles?: string[];        // Files that must be created/modified
    requiredTests?: string[];        // Tests that must exist and pass
    mustPassLint?: boolean;
    mustPassTypeCheck?: boolean;
    mustPassTests?: boolean;
    coverageThreshold?: number;      // 0-1
  };
}
```

**Returns:**
```typescript
{
  success: true,
  taskId: "task-463",
  planId: "feature-123",
  message: "Task added to plan"
}
```

#### `plan:task:update`
**Update task status and metadata.**

**Parameters:**
```typescript
{
  planId: string;                    // "feature-123"
  taskId: string;                    // "task-458"
  status?: "not_started" | "in_progress" | "completed" | "blocked";
  assignee?: string;
  blocker?: string;                  // Why blocked
  notes?: string;
}
```

**Returns:**
```typescript
{
  success: true,
  taskId: "task-458",
  status: "completed",
  validation: {
    automatic: true,
    confidence: 0.95,
    passed: [
      "Required files present",
      "Tests added and passing",
      "Lint checks passed",
      "Type checks passed"
    ],
    warnings: [
      "Code coverage 75% (below 80% threshold)"
    ]
  },
  nextTasks: ["task-459", "task-460"],
  message: "Task marked completed with 95% confidence"
}
```

#### `plan:task:validate`
**Manually trigger task validation.**

**Parameters:**
```typescript
{
  planId: string;
  taskId: string;
  forceRevalidate?: boolean;         // Bypass cache
}
```

**Returns:**
```typescript
{
  taskId: "task-458",
  status: "in_progress",
  validation: {
    method: "automatic",
    confidence: 0.85,
    lastChecked: "2024-03-20T14:30:00Z",
    evidence: {
      filesChanged: [
        {
          path: "src/auth/session.ts",
          linesAdded: 145,
          linesRemoved: 12,
          lastModified: "2024-03-20T14:15:00Z"
        },
        {
          path: "src/auth/session.test.ts",
          linesAdded: 89,
          linesRemoved: 0,
          lastModified: "2024-03-20T14:20:00Z"
        }
      ],
      commits: [
        {
          sha: "a1b2c3d",
          message: "feat(auth): implement SessionManager #task-458",
          timestamp: "2024-03-20T14:25:00Z"
        }
      ],
      testsAdded: true,
      testsPassed: true,
      testResults: {
        total: 12,
        passed: 12,
        failed: 0,
        coverage: 0.87
      },
      lintPassed: true,
      typeCheckPassed: true
    },
    criteria: {
      requiredFiles: {
        expected: ["src/auth/session.ts", "src/auth/session.test.ts"],
        found: ["src/auth/session.ts", "src/auth/session.test.ts"],
        status: "✓"
      },
      requiredTests: {
        expected: ["session creation", "session retrieval", "session deletion", "session expiration"],
        found: ["session creation", "session retrieval", "session deletion", "session expiration", "session extension", "invalid session handling"],
        status: "✓"
      },
      linting: "✓",
      typeChecking: "✓",
      testPassing: "✓",
      coverage: "⚠ 87% (threshold: 80%)"
    },
    recommendation: "Task appears complete and meets all criteria. Consider marking as 'completed'."
  }
}
```

#### `plan:milestone:create`
**Add milestone to plan.**

**Parameters:**
```typescript
{
  planId: string;
  name: string;                      // "Beta Release"
  tasks?: string[];                  // Task IDs to include
  targetDate?: string;               // ISO date
}
```

#### `plan:milestone:update`
**Update milestone status.**

**Parameters:**
```typescript
{
  planId: string;
  milestoneId: string;
  status?: "not_started" | "in_progress" | "completed";
  targetDate?: string;
}
```

#### `plan:export`
**Export plan to various formats.**

**Parameters:**
```typescript
{
  planId: string;
  format: "json" | "markdown" | "csv" | "github-issues";
  outputPath?: string;
}
```

**Returns (markdown example):**
```typescript
{
  success: true,
  format: "markdown",
  content: `# OAuth Authentication

**Status:** In Progress (2/7 tasks completed)

## Milestone: Research & Design ✓
- [x] Research OAuth providers and flows
- [x] Design session architecture

## Milestone: Implementation (In Progress)
- [x] Implement SessionManager class
- [ ] Integrate Passport.js
- [ ] Add OAuth callback routes

## Milestone: Testing & Deployment
- [ ] Write integration tests
- [ ] Deploy to staging`
}
```

#### `plan:metrics`
**Get plan metrics and progress analytics.**

**Parameters:**
```typescript
{
  planId?: string;                   // Specific plan (default: all active)
  includeVelocity?: boolean;
  includeForecasts?: boolean;
}
```

**Returns:**
```typescript
{
  plan: "feature-123",
  progress: {
    totalTasks: 7,
    completed: 2,
    inProgress: 1,
    blocked: 0,
    notStarted: 4,
    percentComplete: 29
  },
  complexity: {
    total: 35,
    completed: 8,
    remaining: 27,
    percentComplete: 23
  },
  velocity: {
    pointsPerDay: 2.3,
    tasksPerDay: 0.5,
    averageTaskComplexity: 5.0
  },
  forecasts: {
    estimatedCompletion: "2024-03-24",
    confidence: 0.75,
    daysRemaining: 3.5,
    onTrack: true
  },
  quality: {
    averageValidationConfidence: 0.85,
    testCoverage: 0.82,
    tasksWithAutomatedValidation: 5
  }
}
```

#### `plan:dependencies`
**Visualize task dependencies.**

**Parameters:**
```typescript
{
  planId: string;
  format?: "graph" | "list" | "mermaid";
}
```

**Returns (mermaid format):**
```typescript
{
  format: "mermaid",
  diagram: `graph TD
    task-456[Research OAuth] --> task-457[Design Architecture]
    task-457 --> task-458[Implement SessionManager]
    task-457 --> task-459[Integrate Passport.js]
    task-458 --> task-461[Integration Tests]
    task-459 --> task-461
    task-460[OAuth Callbacks] --> task-461
    task-461 --> task-462[Deploy to Staging]`
}
```

### Prompts

#### `plan_feature`
**Guided feature planning.**

**Parameters:**
```typescript
{
  featureName?: string;
  size?: "small" | "medium" | "large" | "xl";
}
```

**Generated Prompt:**
```markdown
Let's plan the [featureName] feature.

I'll help you break this down into tasks:

**Feature Size:** [size]
- Small: 1-3 tasks, < 1 week
- Medium: 4-8 tasks, 1-2 weeks
- Large: 9-15 tasks, 2-4 weeks
- XL: 16+ tasks, 4+ weeks

**Planning Process:**
1. What are the major milestones?
2. What tasks are needed for each milestone?
3. What are the task dependencies?
4. How complex is each task (1-10)?
5. What validation criteria should we use?

Let's start: What are the main milestones for this feature?
```

#### `task_breakdown`
**Decompose complex task.**

**Parameters:**
```typescript
{
  taskDescription: string;
  maxComplexity?: number;            // Break tasks above this level
}
```

**Generated Prompt:**
```markdown
This task seems complex. Let's break it down into smaller, manageable tasks.

**Original Task:** [taskDescription]

**Breakdown Strategy:**
1. Identify distinct sub-tasks
2. Ensure each is < [maxComplexity] complexity
3. Define dependencies between sub-tasks
4. Set validation criteria for each

**Suggested Breakdown:**
[AI generates task breakdown based on description]

Does this breakdown make sense? Any adjustments needed?
```

## Automatic Validation Engine

### Validation Methods

#### File Change Detection

**Monitors:**
- Files created/modified since task started
- Line changes (additions/deletions)
- Last modification timestamps

**Implementation:**
```typescript
interface FileChange {
  path: string;
  status: 'created' | 'modified' | 'deleted';
  linesAdded: number;
  linesRemoved: number;
  lastModified: string;
  hashBefore?: string;
  hashAfter: string;
}

function detectFileChanges(task: Task): FileChange[] {
  const taskStartTime = new Date(task.started);
  const gitLog = execSync(
    `git log --since="${taskStartTime.toISOString()}" --name-status --pretty=format:"%H|%ai"`
  );
  
  // Parse git log and compute file changes
  // Return list of changed files with metadata
}
```

#### Test Execution

**Monitors:**
- Test files created/modified
- Test execution results (pass/fail)
- Code coverage metrics

**Implementation:**
```typescript
interface TestResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
  duration: number;
  timestamp: string;
  failures?: Array<{
    test: string;
    error: string;
  }>;
}

async function runTests(task: Task): Promise<TestResults> {
  const result = await execAsync('npm test -- --coverage --json');
  const parsed = JSON.parse(result.stdout);
  
  return {
    total: parsed.numTotalTests,
    passed: parsed.numPassedTests,
    failed: parsed.numFailedTests,
    skipped: parsed.numSkippedTests,
    coverage: parsed.coverageMap.total.lines.pct / 100,
    duration: parsed.testResults.reduce((sum, t) => sum + t.perfStats.runtime, 0),
    timestamp: new Date().toISOString()
  };
}
```

#### Git Commit Analysis

**Monitors:**
- Commits since task started
- Commit messages referencing task ID
- Files changed in commits

**Implementation:**
```typescript
interface CommitInfo {
  sha: string;
  message: string;
  timestamp: string;
  author: string;
  filesChanged: string[];
  referencesTask: boolean;
}

function analyzeCommits(task: Task): CommitInfo[] {
  const taskStartTime = new Date(task.started);
  const commits = execSync(
    `git log --since="${taskStartTime.toISOString()}" --pretty=format:"%H|%s|%ai|%an" --name-only`
  );
  
  return commits
    .toString()
    .split('\n\n')
    .map(parseCommit)
    .filter(c => c.referencesTask || c.filesChanged.some(f => 
      task.validationCriteria?.requiredFiles?.includes(f)
    ));
}
```

#### Static Analysis

**Monitors:**
- Linting results (ESLint, TSLint, etc.)
- Type checking results (TypeScript)
- Code quality metrics

**Implementation:**
```typescript
interface StaticAnalysisResults {
  lint: {
    passed: boolean;
    errors: number;
    warnings: number;
    issues?: Array<{
      file: string;
      line: number;
      rule: string;
      message: string;
    }>;
  };
  typeCheck: {
    passed: boolean;
    errors: number;
    issues?: Array<{
      file: string;
      line: number;
      message: string;
    }>;
  };
}

async function runStaticAnalysis(task: Task): Promise<StaticAnalysisResults> {
  const lintResult = await execAsync('npm run lint -- --format json');
  const typeCheckResult = await execAsync('npm run type-check');
  
  return {
    lint: parseLintOutput(lintResult.stdout),
    typeCheck: parseTypeCheckOutput(typeCheckResult.stdout)
  };
}
```

### Confidence Scoring

**Formula:**
```typescript
function calculateConfidence(task: Task, evidence: ValidationEvidence): number {
  let score = 0.0;
  const weights = {
    requiredFiles: 0.20,
    requiredTests: 0.25,
    testsPassing: 0.25,
    lintPassing: 0.10,
    typeCheckPassing: 0.10,
    gitCommit: 0.10
  };
  
  // Required files present
  if (evidence.filesChanged.length > 0) {
    const requiredFiles = task.validationCriteria?.requiredFiles || [];
    const foundFiles = evidence.filesChanged.map(f => f.path);
    const matchRate = requiredFiles.filter(f => foundFiles.includes(f)).length / requiredFiles.length;
    score += weights.requiredFiles * matchRate;
  }
  
  // Required tests exist
  if (evidence.testsAdded) {
    const requiredTests = task.validationCriteria?.requiredTests || [];
    const foundTests = evidence.testResults?.tests || [];
    const matchRate = requiredTests.filter(t => 
      foundTests.some(ft => ft.includes(t))
    ).length / requiredTests.length;
    score += weights.requiredTests * matchRate;
  }
  
  // Tests passing
  if (evidence.testsPassed) {
    score += weights.testsPassing;
  } else if (evidence.testResults) {
    score += weights.testsPassing * (evidence.testResults.passed / evidence.testResults.total);
  }
  
  // Linting
  if (evidence.lintPassed) {
    score += weights.lintPassing;
  }
  
  // Type checking
  if (evidence.typeCheckPassed) {
    score += weights.typeCheckPassing;
  }
  
  // Git commit
  if (evidence.commits.some(c => c.referencesTask)) {
    score += weights.gitCommit;
  }
  
  return Math.min(1.0, score);
}
```

**Confidence Levels:**
- **0.0 - 0.3:** Not started or minimal progress
- **0.3 - 0.6:** In progress, some evidence of work
- **0.6 - 0.8:** Nearly complete, minor issues remain
- **0.8 - 0.95:** Complete with high confidence
- **0.95 - 1.0:** Complete with all criteria met

## Cross-Layer Integration

### Planning → Rules

```typescript
// Task completion validates against rules
plan:task:update({
  taskId: "task-458",
  status: "completed"
})

// Automatically runs:
rules:validate({
  filePath: "src/auth/session.ts"
})

// If violations found, reduces confidence score
// and adds warnings to validation evidence
```

### Planning → Memory

```typescript
// Task completion updates memory
plan:task:update({
  taskId: "task-458",
  status: "completed"
})

// Automatically updates:
memory:progress:task({
  taskId: "task-458",
  status: "completed",
  milestone: "Implementation"
})

// And logs to activeContext:
memory:change:log({
  summary: "Completed SessionManager implementation",
  relatedPlan: "feature-123"
})
```

### Planning → Documentation

```typescript
// Plan references documentation
{
  planId: "feature-123",
  relatedDocs: ["docs/architecture/authentication.md"]
}

// Task completion checks doc freshness
// If task modified files related to docs, suggests update:
{
  taskId: "task-458",
  validation: {
    warnings: [
      "File src/auth/session.ts modified",
      "Documentation docs/api/authentication.md may need updates"
    ]
  }
}
```

### Unified Workflow

**Example: Completing a Task**

```typescript
// 1. User marks task complete
await callTool("plan:task:update", {
  planId: "feature-123",
  taskId: "task-458",
  status: "completed"
});

// 2. Automatic validation triggered
const validation = await validateTask(task);

// 3. Rules validation
const ruleViolations = await callTool("rules:validate", {
  filePath: "src/auth/session.ts"
});

// 4. Update memory
await callTool("memory:progress:task", {
  taskId: "task-458",
  status: "completed",
  notes: `Validation confidence: ${validation.confidence}`
});

// 5. Check documentation freshness
const docChecks = checkDocumentationImpact(task);

// 6. Return comprehensive result
return {
  success: true,
  validation,
  ruleViolations,
  memoryUpdated: true,
  documentationWarnings: docChecks.warnings,
  nextTasks: getUnblockedTasks(plan)
};
```

## Plan Templates

### Small Feature Template

```json
{
  "size": "small",
  "estimatedDuration": "2-5 days",
  "taskCount": "1-3",
  "milestones": [
    {
      "name": "Implementation",
      "tasks": []
    },
    {
      "name": "Testing",
      "tasks": []
    }
  ],
  "defaultComplexity": 3
}
```

### Medium Feature Template

```json
{
  "size": "medium",
  "estimatedDuration": "1-2 weeks",
  "taskCount": "4-8",
  "milestones": [
    {
      "name": "Research & Design",
      "tasks": []
    },
    {
      "name": "Implementation",
      "tasks": []
    },
    {
      "name": "Testing & Deployment",
      "tasks": []
    }
  ],
  "defaultComplexity": 5
}
```

### Large Feature Template

```json
{
  "size": "large",
  "estimatedDuration": "2-4 weeks",
  "taskCount": "9-15",
  "milestones": [
    {
      "name": "Discovery & Planning",
      "tasks": []
    },
    {
      "name": "Architecture & Design",
      "tasks": []
    },
    {
      "name": "Core Implementation",
      "tasks": []
    },
    {
      "name": "Integration",
      "tasks": []
    },
    {
      "name": "Testing & Polish",
      "tasks": []
    },
    {
      "name": "Deployment",
      "tasks": []
    }
  ],
  "defaultComplexity": 6
}
```

### XL Feature Template

```json
{
  "size": "xl",
  "estimatedDuration": "4+ weeks",
  "taskCount": "16+",
  "milestones": [
    {
      "name": "Requirements & Research",
      "tasks": []
    },
    {
      "name": "System Design",
      "tasks": []
    },
    {
      "name": "Phase 1 Implementation",
      "tasks": []
    },
    {
      "name": "Phase 2 Implementation",
      "tasks": []
    },
    {
      "name": "Integration & Testing",
      "tasks": []
    },
    {
      "name": "Beta Deployment",
      "tasks": []
    },
    {
      "name": "Refinement",
      "tasks": []
    },
    {
      "name": "Production Deployment",
      "tasks": []
    }
  ],
  "defaultComplexity": 7,
  "requiresMultiplePhases": true
}
```

## Best Practices

### Task Granularity

**Too Large (Complexity 9-10):**
```typescript
{
  title: "Implement complete authentication system",
  complexity: 10
}
// Problem: Too broad, hard to validate, long to complete
```

**Just Right (Complexity 4-7):**
```typescript
{
  title: "Implement SessionManager class",
  complexity: 7,
  description: "Create SessionManager with CRUD operations for Redis-backed sessions"
}
// Good: Specific, measurable, reasonable scope
```

**Too Small (Complexity 1-2):**
```typescript
{
  title: "Add import statement",
  complexity: 1
}
// Problem: Too granular, creates noise
```

### Validation Criteria

**Good:**
```typescript
{
  validationCriteria: {
    requiredFiles: [
      "src/auth/session.ts",
      "src/auth/session.test.ts"
    ],
    requiredTests: [
      "session creation",
      "session retrieval",
      "session deletion",
      "session expiration"
    ],
    mustPassLint: true,
    mustPassTypeCheck: true,
    mustPassTests: true,
    coverageThreshold: 0.8
  }
}
```

**Too Vague:**
```typescript
{
  validationCriteria: {
    requiredFiles: ["something in src/"]
  }
}
```

### Dependency Management

**Good:**
```typescript
{
  tasks: [
    { id: "task-1", title: "Design API", dependencies: [] },
    { id: "task-2", title: "Implement API", dependencies: ["task-1"] },
    { id: "task-3", title: "Test API", dependencies: ["task-2"] }
  ]
}
// Clear linear dependency chain
```

**Problematic:**
```typescript
{
  tasks: [
    { id: "task-1", dependencies: ["task-2"] },
    { id: "task-2", dependencies: ["task-1"] }
  ]
}
// Circular dependency - impossible to complete
```

## Troubleshooting

### Low Confidence Scores

**Issue:** Task marked complete but confidence is < 0.6

**Diagnosis:**
```bash
devflow plan:task:validate --plan feature-123 --task task-458
```

**Common Causes:**
- Required files not created
- Tests not added or failing
- No git commits referencing task
- Lint/type-check failures

**Resolution:**
- Review validation criteria
- Ensure all required files exist
- Fix failing tests
- Commit changes with task reference (`#task-458`)

### Blocked Tasks

**Issue:** Task cannot be started due to dependencies

**Diagnosis:**
```bash
devflow plan:dependencies --plan feature-123 --format list
```

**Resolution:**
- Complete dependency tasks first
- Or remove dependency if incorrect
- Or split task to reduce dependencies

### Stale Plans

**Issue:** Plan target date passed, many tasks incomplete

**Diagnosis:**
```bash
devflow plan:metrics --plan feature-123 --include-forecasts
```

**Resolution:**
- Re-estimate task complexity
- Adjust target completion date
- Break down complex tasks
- Add resources (if team project)

---

**Next:** [05-INTEGRATION.md](./05-INTEGRATION.md) - Cross-layer workflows and unified context