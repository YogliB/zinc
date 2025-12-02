# Usage Guide

**Practical examples and workflows for using DevFlow MCP tools.**

---

## Quick Start

### Setup

1. **Install DevFlow:**

```bash
npm install -g devflow-mcp
```

2. **Configure your AI agent** (see [Setup Guide](./SETUP.md) for details):

**Cursor** - Add to `mcp.json`:

```json
{
	"mcpServers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve", "--stdio"]
		}
	}
}
```

**Claude Desktop** - Add to `mcp.json`:

```json
{
	"mcpServers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve"]
		}
	}
}
```

**Zed** - Add to `settings.json`:

```json
{
	"context_servers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve", "--stdio"]
		}
	}
}
```

3. **Start using tools** - All tools are available via MCP protocol.

---

## Performance Notes

DevFlow uses **lazy loading** for optimal performance:

- **Server initialization**: ~50-200ms (65-270x faster than eager loading)
- **First file analysis**: ~200-500ms (file loaded on-demand)
- **Subsequent analyses**: <1ms (fully cached)

**First-Call Behavior**: The first time you analyze a file, it will be parsed and loaded into memory. This takes ~200-500ms for typical files. Subsequent analyses of the same file are nearly instant due to caching.

**Optional Preloading**: For instant first-call performance, enable background file preloading:

```bash
export DEVFLOW_PRELOAD_FILES=true
export DEVFLOW_PRELOAD_PATTERNS="src/**/*.ts,lib/**/*.tsx"
```

See [Setup Guide](./SETUP.md#environment-variables) for more details.

---

## Available Tools

DevFlow provides seven categories of MCP tools:

### 1. Project Tools

**`getProjectOnboarding`** - Extract project metadata

Extracts project information from `package.json`, `README.md`, and `tsconfig.json`:

```json
{
	"tool": "getProjectOnboarding"
}
```

**Returns:**

- Project type (TypeScript, JavaScript, etc.)
- Build and test commands
- Main dependencies
- Scripts
- Description

**Use case:** Quick project overview when starting work on a new codebase.

---

### 2. Architecture Tools

**`getArchitecture`** - Get architectural overview

Analyzes project structure, symbols, patterns, and relationships:

```json
{
	"tool": "getArchitecture",
	"input": {
		"scope": "src/core"
	}
}
```

**Parameters:**

- `scope` (optional) - Directory to analyze (defaults to entire project)

**Returns:**

- File count and structure
- Symbol statistics
- Pattern detection
- Relationship overview

**Use case:** Understanding project architecture and structure.

---

### 3. Symbol Tools

**`findSymbol`** - Find symbols by name

Search for classes, functions, interfaces, etc.:

```json
{
	"tool": "findSymbol",
	"input": {
		"name": "StorageEngine",
		"type": "class"
	}
}
```

**Parameters:**

- `name` - Symbol name to search for
- `type` (optional) - Filter by symbol type (class, function, interface, etc.)

**Returns:**

- Matching symbols with file paths and line numbers

**Use case:** Locating specific code entities across the codebase.

**`findReferences`** - Find where a symbol is used

Find all references to a symbol:

```json
{
	"tool": "findReferences",
	"input": {
		"symbol": "createStorageEngine",
		"file": "src/core/storage/engine.ts"
	}
}
```

**Parameters:**

- `symbol` - Symbol name
- `file` - File containing the symbol

**Returns:**

- List of files and locations where the symbol is referenced

**Use case:** Understanding symbol usage and impact of changes.

---

### 4. Pattern Tools

**`detectPatterns`** - Detect design patterns

Identify design patterns in code:

```json
{
	"tool": "detectPatterns",
	"input": {
		"scope": "src/core"
	}
}
```

**Parameters:**

- `scope` (optional) - Directory to analyze

**Returns:**

- Detected patterns (Singleton, Factory, Observer, etc.)
- Pattern locations

**Use case:** Understanding code organization and design decisions.

**`detectAntiPatterns`** - Detect code smells

Find potential code quality issues:

```json
{
	"tool": "detectAntiPatterns",
	"input": {
		"scope": "src"
	}
}
```

**Returns:**

- Anti-patterns detected
- Descriptions and locations

**Use case:** Code quality assessment and refactoring guidance.

---

### 5. Graph Tools

**`getDependencyGraph`** - Build dependency graph

Generate dependency relationships between files:

```json
{
	"tool": "getDependencyGraph",
	"input": {
		"scope": "src/core"
	}
}
```

**Parameters:**

- `scope` (optional) - Directory to analyze

**Returns:**

- Nodes (files/modules)
- Edges (dependencies)
- Graph structure

**Use case:** Visualizing code dependencies and relationships.

---

### 6. Git Tools

**`getRecentDecisions`** - Extract decisions from commits

Find architectural decisions in git history:

```json
{
	"tool": "getRecentDecisions",
	"input": {
		"since": "1 week ago",
		"workspace": "src/core"
	}
}
```

**Parameters:**

- `since` - Time period (e.g., "1 week ago", "2024-01-01")
- `workspace` (optional) - Directory to filter commits

**Returns:**

- Commit messages
- Authors and dates
- Changed files

**Use case:** Understanding recent changes and decisions.

**`analyzeChangeVelocity`** - Analyze file change frequency

Track how often files are modified:

```json
{
	"tool": "analyzeChangeVelocity",
	"input": {
		"path": "src/core/storage/engine.ts",
		"since": "1 month ago"
	}
}
```

**Parameters:**

- `path` - File or directory path
- `since` - Time period to analyze

**Returns:**

- Commit count
- Last modified date
- Authors who modified the file

**Use case:** Identifying frequently changed files and potential stability issues.

---

### 7. Context Tools

**`getContextForFile`** - Get comprehensive file context

Analyze a file and get symbols, relationships, and patterns:

```json
{
	"tool": "getContextForFile",
	"input": {
		"file": "src/core/storage/engine.ts"
	}
}
```

**Parameters:**

- `file` - Path to the file

**Returns:**

- Symbols in the file
- Relationships to other files
- Patterns detected

**Use case:** Deep understanding of a specific file's role and connections.

**`summarizeFile`** - Generate file summary

Get a high-level summary of a file:

```json
{
	"tool": "summarizeFile",
	"input": {
		"path": "src/core/storage/engine.ts",
		"depth": 2
	}
}
```

**Parameters:**

- `path` - File path
- `depth` (optional) - Analysis depth (1=shallow, 2=medium, 3=deep)

**Returns:**

- File purpose
- Main exports
- Key symbols
- Summary

**Use case:** Quick file overview without full analysis.

---

## Common Workflows

### Workflow 1: Understanding a New Codebase

**Goal:** Get familiar with project structure and key components.

**Steps:**

1. **Get project overview:**

```json
{ "tool": "getProjectOnboarding" }
```

2. **Understand architecture:**

```json
{ "tool": "getArchitecture" }
```

3. **Find main entry points:**

```json
{
	"tool": "findSymbol",
	"input": { "name": "main", "type": "function" }
}
```

4. **Explore core modules:**

```json
{
	"tool": "getArchitecture",
	"input": { "scope": "src/core" }
}
```

---

### Workflow 2: Refactoring Preparation

**Goal:** Understand dependencies before refactoring.

**Steps:**

1. **Find symbol references:**

```json
{
	"tool": "findReferences",
	"input": {
		"symbol": "oldFunction",
		"file": "src/utils.ts"
	}
}
```

2. **Get dependency graph:**

```json
{
	"tool": "getDependencyGraph",
	"input": { "scope": "src/utils" }
}
```

3. **Check for anti-patterns:**

```json
{
	"tool": "detectAntiPatterns",
	"input": { "scope": "src/utils" }
}
```

---

### Workflow 3: Code Review Assistance

**Goal:** Understand changes and their impact.

**Steps:**

1. **Get file context:**

```json
{
	"tool": "getContextForFile",
	"input": { "file": "src/modified-file.ts" }
}
```

2. **Find references:**

```json
{
	"tool": "findReferences",
	"input": {
		"symbol": "ModifiedClass",
		"file": "src/modified-file.ts"
	}
}
```

3. **Check change velocity:**

```json
{
	"tool": "analyzeChangeVelocity",
	"input": {
		"path": "src/modified-file.ts",
		"since": "1 month ago"
	}
}
```

---

### Workflow 4: Architecture Documentation

**Goal:** Generate architecture documentation.

**Steps:**

1. **Get full architecture:**

```json
{ "tool": "getArchitecture" }
```

2. **Detect patterns:**

```json
{ "tool": "detectPatterns" }
```

3. **Build dependency graph:**

```json
{ "tool": "getDependencyGraph" }
```

4. **Get recent decisions:**

```json
{
	"tool": "getRecentDecisions",
	"input": { "since": "3 months ago" }
}
```

---

## Integration Examples

### Cursor Integration

In Cursor Composer or Chat, use tools directly:

```
Find all references to StorageEngine
```

Cursor will use `findReferences` tool automatically.

### Claude Desktop Integration

Use natural language to invoke tools:

```
What's the architecture of this project?
```

Claude will call `getArchitecture` tool.

### Zed Integration

Zed supports tools via Assistant:

```
@devflow getProjectOnboarding
```

Or use natural language:

```
Analyze the dependency graph for src/core
```

---

## Troubleshooting

### Tool Not Found

**Issue:** Tool doesn't appear in available tools list.

**Solutions:**

1. Verify `mcp.json` or `settings.json` configuration
2. Restart your AI agent application
3. Check that DevFlow server is running: `devflow serve --stdio`
4. Check logs for MCP server errors

### File Not Found Errors

**Issue:** Tools return "file not found" errors.

**Solutions:**

1. Ensure you're in the project root directory
2. Use relative paths from project root
3. Check file exists: `ls -la path/to/file`
4. Verify project root detection is working

### Slow Performance

**Issue:** Tools take too long to execute.

**Solutions:**

1. Use `scope` parameter to limit analysis area
2. For large projects, analyze specific directories
3. Check file watcher and cache are working
4. Consider analyzing smaller scopes incrementally

### Analysis Errors

**Issue:** Tools return errors or incomplete results.

**Solutions:**

1. Check file is in a supported language (TypeScript/JavaScript)
2. Verify file syntax is valid
3. Check project has required dependencies installed
4. Review error messages in tool output

---

## Best Practices

### 1. Use Scoped Analysis

For large projects, analyze specific directories:

```json
{
	"tool": "getArchitecture",
	"input": { "scope": "src/core" }
}
```

### 2. Combine Tools for Deep Understanding

Use multiple tools together:

1. `getArchitecture` for overview
2. `findSymbol` to locate specific code
3. `getContextForFile` for detailed analysis
4. `findReferences` to understand usage

### 3. Leverage Git Tools for Context

Understand recent changes:

```json
{
	"tool": "getRecentDecisions",
	"input": { "since": "1 week ago" }
}
```

### 4. Use Patterns for Code Quality

Regularly check for anti-patterns:

```json
{
	"tool": "detectAntiPatterns",
	"input": { "scope": "src" }
}
```

---

## Advanced Usage

### Custom Analysis Workflows

Combine multiple tools for custom analysis:

1. **Find all singletons:**
    - Use `detectPatterns` to find Singleton pattern
    - Use `getContextForFile` for each match
    - Use `findReferences` to understand usage

2. **Track file stability:**
    - Use `analyzeChangeVelocity` for key files
    - Combine with `getRecentDecisions` for context
    - Identify unstable areas

3. **Document architecture:**
    - Use `getArchitecture` for structure
    - Use `detectPatterns` for design patterns
    - Use `getDependencyGraph` for relationships

---

## Related Documentation

- [Setup Guide](./SETUP.md) - Installation and configuration
- [Architecture](./ARCHITECTURE.md) - Technical architecture details
- [Testing Guide](./TESTING.md) - Testing strategies
- [Security Policy](./SECURITY.md) - Security best practices

---

**Need help?** Check the [Documentation Index](./README.md) or open an issue on GitHub.
