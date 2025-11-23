# Storage Layer Architecture

## Overview

The storage layer provides a type-safe, repository-based abstraction for file I/O operations in DevFlow MCP. It enforces validation at every layer and prevents common security issues like path traversal attacks.

## Core Components

### 1. StorageEngine

The `StorageEngine` class handles low-level file operations with built-in security checks.

**Key Features:**

- Path validation to prevent directory traversal
- Atomic file operations (read, write, delete)
- Directory listing with recursive option
- UTF-8 text file handling
- Graceful error handling with custom error types

**Usage Example:**

```typescript
import { StorageEngine } from '@/core/storage';

const engine = new StorageEngine({
	rootPath: process.cwd(),
	debug: false,
});

// Write a file
await engine.writeFile('path/to/file.txt', 'content');

// Read a file
const content = await engine.readFile('path/to/file.txt');

// List files
const files = await engine.listFiles('.', { recursive: true });

// Check existence
const exists = await engine.exists('path/to/file.txt');

// Delete a file
await engine.delete('path/to/file.txt');
```

### 2. File Format Handlers

#### Markdown Parser

Handles Markdown files with YAML frontmatter using `gray-matter`.

```typescript
import { parseMarkdown, stringifyMarkdown } from '@/core/storage';

// Parse
const { frontmatter, content } = parseMarkdown(markdownText);

// Stringify
const markdown = stringifyMarkdown({ frontmatter, content });
```

#### JSON Parser

Handles JSON serialization with pretty-printing.

```typescript
import { parseJSON, stringifyJSON } from '@/core/storage';

// Parse
const data = parseJSON(jsonText);

// Stringify (pretty-printed with 2-space indent)
const json = stringifyJSON(data);
```

### 3. Zod Schemas

Type-safe validation schemas for each file type.

**Available Schemas:**

- `MemoryFileSchema` - Memory bank files
- `RulesFileSchema` - Rules and agents files
- `DocsFileSchema` - Documentation files
- `PlansFileSchema` - Planning files

**Example:**

```typescript
import { MemoryFileSchema } from '@/core/schemas';

const data = MemoryFileSchema.parse({
	frontmatter: { title: 'My Memory', tags: ['important'] },
	content: 'Content here',
});
```

### 4. Repository Classes

High-level abstractions for working with specific file types.

#### MemoryRepository

Manages memory bank files in `memory-bank/` directory.

```typescript
import { MemoryRepository } from '@/layers/memory/repository';

const repo = new MemoryRepository({ storageEngine });

// Save a memory
await repo.saveMemory('my-memory', {
	frontmatter: { title: 'My Note' },
	content: 'Content',
});

// Get a memory
const memory = await repo.getMemory('my-memory');

// List all memories
const memories = await repo.listMemories();

// Delete a memory
await repo.deleteMemory('my-memory');
```

#### RulesRepository

Manages rules and agent files.

```typescript
import { RulesRepository } from '@/layers/rules/repository';

const repo = new RulesRepository({ storageEngine });

// Get rules
const rules = await repo.getRules();

// Save rules
await repo.saveRules({ frontmatter: {}, content: '# Rules' });
```

#### DocsRepository

Manages documentation files.

```typescript
import { DocsRepository } from '@/layers/docs/repository';

const repo = new DocsRepository({ storageEngine });

// Get a doc
const doc = await repo.getDoc('ARCHITECTURE');

// Save a doc
await repo.saveDoc('ARCHITECTURE', { frontmatter: {}, content: '...' });

// List docs
const docs = await repo.listDocs();
```

#### PlansRepository

Manages plan files in `docs/plans/` directory.

```typescript
import { PlansRepository } from '@/layers/planning/repository';

const repo = new PlansRepository({ storageEngine });

// Get a plan
const plan = await repo.getPlan('project-x');

// Save a plan
await repo.savePlan('project-x', { frontmatter: {}, content: '...' });

// Update plan status
await repo.updatePlanFrontmatter('project-x', { status: 'in-progress' });

// List all plans
const plans = await repo.listPlans();
```

## Error Handling

### Custom Error Types

```typescript
import {
	StorageError,
	PathValidationError,
	FileNotFoundError,
	WriteError,
	ValidationError,
} from '@/core/storage';
```

**Error Hierarchy:**

- `StorageError` - Base class for all storage errors
- `PathValidationError` - Path traversal or invalid path detected
- `FileNotFoundError` - File does not exist
- `WriteError` - Failed to write file
- `ValidationError` - Schema validation failed

**Example Error Handling:**

```typescript
try {
	const memory = await repo.getMemory('nonexistent');
} catch (error) {
	if (error instanceof FileNotFoundError) {
		console.log('Memory not found');
	} else if (error instanceof ValidationError) {
		console.log('Invalid memory format');
	}
}
```

## Security

### Path Validation

The `StorageEngine` validates all paths to prevent security issues:

- ✅ Prevents path traversal (`../` attacks)
- ✅ Prevents absolute paths
- ✅ Ensures all paths stay within the root directory
- ✅ Normalizes paths for consistent handling

**Example - Blocked Operations:**

```typescript
// All of these throw PathValidationError
await engine.readFile('../etc/passwd');
await engine.readFile('/etc/passwd');
await engine.writeFile('../../secret.txt', 'data');
```

## File Format Specifications

### Memory Files

Location: `memory-bank/<name>.md`

**Frontmatter Fields:**

- `title` (string, optional) - Memory title
- `created` (string | Date, optional) - Creation timestamp
- `updated` (string | Date, optional) - Last update timestamp
- `tags` (array of strings, optional) - Categorization tags
- `category` (string, optional) - Category name

### Rules Files

Location: `zed-rules/AGENTS.md`

**Frontmatter Fields:**

- `title` (string, optional) - Rules document title
- `version` (string, optional) - Rules version
- `updated` (string | Date, optional) - Last update timestamp

### Docs Files

Location: `docs/**/*.md`

**Frontmatter Fields:**

- `title` (string, optional) - Document title
- `description` (string, optional) - Brief description
- `author` (string, optional) - Document author
- `created` (string | Date, optional) - Creation timestamp
- `updated` (string | Date, optional) - Last update timestamp
- `tags` (array of strings, optional) - Categorization tags

### Plans Files

Location: `docs/plans/<name>.md`

**Frontmatter Fields:**

- `title` (string, optional) - Plan title
- `status` (enum, optional) - `'draft'`, `'in-progress'`, `'completed'`, `'archived'`
- `priority` (enum, optional) - `'low'`, `'medium'`, `'high'`
- `created` (string | Date, optional) - Creation timestamp
- `updated` (string | Date, optional) - Last update timestamp
- `tags` (array of strings, optional) - Categorization tags

## Design Decisions

### Why Repository Pattern?

The repository pattern provides:

- **Separation of Concerns** - Business logic separated from storage implementation
- **Testability** - Easy to mock storage layer
- **Consistency** - All repositories follow same interface
- **Flexibility** - Easy to swap storage backends in future

### Why Zod Schemas?

- **Type Safety** - Compile-time + runtime validation
- **Clear Contracts** - Explicit field definitions
- **User-Friendly Errors** - Detailed validation error messages
- **Type Inference** - Automatic TypeScript type generation

### Why gray-matter?

- **Battle-Tested** - Used in many production projects
- **Flexible** - Handles edge cases well
- **YAML Support** - Full YAML parser included
- **Performance** - Optimized for speed

## Testing

All components have comprehensive test coverage:

- **StorageEngine** - Path validation, file operations, error handling
- **Markdown Parser** - Frontmatter parsing, round-trip consistency
- **Repositories** - CRUD operations, validation, error handling

Run tests:

```bash
bun test
```

Run with coverage:

```bash
bun test --coverage
```

## Future Enhancements

- **Caching Layer** - In-memory caching for frequently accessed files
- **Watch Mode** - File watcher integration for live updates
- **Transactions** - Multi-file atomic operations
- **Migrations** - Schema evolution and data migration tools
- **Compression** - Optional file compression for storage efficiency
