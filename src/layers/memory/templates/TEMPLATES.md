# Memory Bank Templates

This directory contains template files for initializing a DevFlow memory bank. Each template provides a structured starting point for maintaining session continuity and project context.

## Overview

The memory bank consists of four core files that work together to maintain comprehensive project context:

1. **projectContext.md** - High-level project overview and scope
2. **activeContext.md** - Current work focus and immediate concerns
3. **progress.md** - Historical milestones and metrics
4. **decisionLog.md** - Architectural decisions and rationale

## File Descriptions

### projectContext.md

**Purpose:** Foundation document providing high-level project understanding.

**When to read:** At project start or when joining a new project.

**Key sections:**

- Project Overview: What the project is and why it exists
- Scope: What's in and out of scope
- Constraints: Technical and business limitations
- Technology Stack: Language, frameworks, databases
- Current Status: Project phase and health
- Future Vision: Where the project is headed

**Update frequency:** Quarterly or when scope changes significantly

**Use cases:**

- New team members getting oriented
- Understanding project boundaries and constraints
- Reviewing long-term goals

### activeContext.md

**Purpose:** Snapshot of current work, blockers, and recent activity.

**When to read:** Every work session start; the primary context window.

**Key sections:**

- Current Focus: What's being worked on right now
- Active Blockers: Problems blocking progress with severity and workarounds
- Recent Changes: Last 7 days of work with dates
- Context Notes: Important patterns, performance considerations, security notes
- Next Steps: Immediate priorities

**Update frequency:** Daily or multiple times per day

**Retention policy:** Keep last 7 days; archive older entries to progress.md

**Use cases:**

- Resuming work after a break
- Understanding current blockers and workarounds
- Coordinating with teammates on immediate priorities
- Documenting why decisions were made in recent work

### progress.md

**Purpose:** Long-term project history, milestones, and metrics.

**When to read:** When understanding project evolution or planning next milestones.

**Key sections:**

- Current Milestone: Status and task breakdown
- Completed Milestones: Historical achievements with learnings
- Upcoming Milestones: Future planned work
- Metrics: Velocity, task duration, blocker resolution time
- Known Issues: Bugs and problems with severity
- Lessons Learned: Patterns and insights discovered
- Archived Changes: Work older than 30 days (compressed)

**Update frequency:** Weekly or at milestone boundaries

**Retention policy:** Permanent; compress entries older than 90 days

**Use cases:**

- Tracking overall project health and velocity
- Understanding what worked well and what didn't
- Planning future milestones based on historical patterns
- Identifying recurring issues or bottlenecks
- Onboarding new team members to project history

### decisionLog.md

**Purpose:** Record architectural and technical decisions with full context.

**When to read:** When understanding why something was built a certain way.

**Key sections per decision:**

- Context: Situation leading to the decision
- Decision: What was decided, stated clearly
- Rationale: Why this choice was made
- Alternatives Considered: Other options and why they weren't chosen
- Consequences: Expected benefits, drawbacks, and follow-up actions
- Related Decisions: Links to dependent decisions

**Update frequency:** As decisions are made (not on a schedule)

**Use cases:**

- Understanding design choices and their tradeoffs
- Avoiding re-litigating old decisions
- Identifying when decisions need to be revisited
- Training new team members on architectural philosophy
- Documenting decision reversal when assumptions change

## Template Variables

All templates use placeholder variables in `[brackets]`. Replace them with actual values:

- `[DATE]` - Current date (format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
- `[Name]` - Descriptive name or title
- `[High/Medium/Low]` - Choose one based on context
- `[Task]` - Specific task or item
- `[Reason/Description]` - Explanatory text

## Frontmatter Fields

Each memory file uses YAML frontmatter to track metadata:

**Common fields:**

- `category` - File type (active-work, tracking, decisions, project-info)
- `created` - File creation timestamp
- `updated` - Last modification timestamp

**Optional fields:**

- `tags` - Array of tags for categorization
- `status` - Current status if applicable
- `impact` - Impact level for decisions

**Example frontmatter:**

```yaml
---
category: active-work
updated: 2024-03-20T14:30:00Z
tags: [auth, critical]
---
```

## Usage Examples

### Initializing a New Project

1. Use `memory-init` tool to create all four files with templates
2. Fill in projectContext.md first (foundation)
3. Create initial activeContext.md entry
4. Set up progress.md with first milestone
5. Begin decisionLog.md as decisions arise

### Updating Memory During Development

**Daily update:**

- Update activeContext.md with what you're working on
- Note any blockers encountered
- Record recent changes

**Weekly update:**

- Review activeContext.md and archive old entries to progress.md
- Update progress.md with milestone status
- Add lessons learned section

**When making architectural decisions:**

- Add entry to decisionLog.md
- Document context, rationale, and alternatives
- Link from activeContext.md if relevant

### Resuming Work After Break

1. Read activeContext.md for immediate context
2. Check progress.md for project status
3. Review decisionLog.md if context unclear
4. Reference projectContext.md if scope questions arise

## Best Practices

### Write for clarity and future readers

- Use specific, searchable language
- Include dates and context
- Avoid insider jargon without explanation
- Link between files when relevant

### Keep activeContext current

- Update at end of work session
- Archive to progress.md after 7 days
- Reference decisions by ID
- Note external dependencies

### Document decisions thoroughly

- Record decisions as they're made, not retroactively
- Include what was considered but not chosen
- Explain why chosen option was better
- Note any assumptions that could change

### Maintain metrics and learnings

- Track what went well and what didn't
- Record velocity and task duration
- Document patterns discovered
- Note recurring issues for future reference

## Template Structure Relationships

```
projectContext.md (Foundation - read first)
       ↓
activeContext.md (Current work - read daily)
       ↓
progress.md (Archive past work - read weekly)

decisionLog.md (Referenced from active/progress contexts)
```

**Reading order for new context:**

1. projectContext.md - Understand project scope and constraints
2. activeContext.md - See what's currently happening
3. progress.md - Understand project history and velocity
4. decisionLog.md - Clarify any "why" questions

**Editing order when updating:**

1. activeContext.md - Record current work and decisions
2. decisionLog.md - Document any architectural decisions
3. progress.md - Archive and update metrics weekly
4. projectContext.md - Update when scope or constraints change
