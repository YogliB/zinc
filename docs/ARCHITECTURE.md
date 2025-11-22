# Architecture: DevFlow MCP

## Overview

DevFlow MCP is a Model Context Protocol (MCP) server built with TypeScript using the **fastmcp** framework. It provides a foundation for universal project context management, enabling AI assistants to understand and interact with development projects.

---

## Technology Stack

| Component                     | Version | Purpose                                           |
| ----------------------------- | ------- | ------------------------------------------------- |
| **fastmcp**                   | ^3.23.1 | MCP server framework with high-level abstractions |
| **@modelcontextprotocol/sdk** | ^1.0.4  | Official MCP protocol implementation              |
| **TypeScript**                | 5.7.2   | Type-safe language                                |
| **Bun**                       | 1.3.2   | Package manager and runtime                       |
| **Zod**                       | ^3.24.1 | Schema validation for tool arguments              |

---

## Core Architecture

### Server Initialization

The server uses the **fastmcp** framework for clean, simple initialization:

```typescript
import { FastMCP } from 'fastmcp';

const server = new FastMCP({
	name: 'devflow-mcp',
	version: '0.1.0',
});

async function main(): Promise<void> {
	await server.start({
		transportType: 'stdio',
	});
	console.error('DevFlow MCP Server running on stdio');
}

main().catch(console.error);
```

### Framework Pattern

**Pattern Type**: Class-based, method-driven

- `new FastMCP({name, version})` - Instantiate server
- `server.addTool({...})` - Register tools
- `server.addResource({...})` - Register resources
- `server.addPrompt({...})` - Register prompts
- `server.start({transportType})` - Start server

### Transport

**Current**: Stdio (standard input/output)

Supports:

- **stdio** - For local/CLI integration (currently used)
- **httpStream** - For HTTP-based remote access
- **sse** - For Server-Sent Events streaming

---

## Server Capabilities

### Current State

The server initializes with default capabilities:

```json
{
	"logging": {},
	"completions": {}
}
```

### Expandable Capabilities

#### Tools

Define executable functions available to MCP clients:

```typescript
server.addTool({
	name: 'lint-project',
	description: 'Run linting on project files',
	parameters: z.object({
		files: z.array(z.string()),
	}),
	execute: async (args) => {
		// Implementation
		return 'Linting results...';
	},
});
```

#### Resources

Expose filesystem-like resources:

```typescript
server.addResource({
	name: 'project-rules',
	uri: 'rules://project-rules.md',
	mimeType: 'text/markdown',
	contents: async () => {
		// Return resource content
		return 'Rules content...';
	},
});
```

#### Prompts

Provide reusable prompt templates:

```typescript
server.addPrompt({
	name: 'analyze-codebase',
	description: 'Prompt for analyzing codebase',
	arguments: [
		{
			name: 'focus-area',
			description: 'What to focus on',
		},
	],
	execute: async (args) => {
		// Return prompt content
		return 'Prompt template for analysis...';
	},
});
```

---

## Type Safety

### Schema Validation with Zod

Tool and resource arguments are validated using **Zod**, a TypeScript-first schema validation library:

```typescript
import { z } from 'zod';

const toolParams = z.object({
	projectPath: z.string().describe('Path to project'),
	depth: z.number().int().min(1).default(3),
	includeHidden: z.boolean().default(false),
});

server.addTool({
	name: 'analyze-structure',
	parameters: toolParams,
	execute: async (args) => {
		// args is fully typed
		// TypeScript knows: args.projectPath is string, args.depth is number
	},
});
```

### Type Definitions

- Compiled TypeScript produces type definitions (`dist/index.d.ts`)
- IDE support: auto-completion, hover documentation, type checking
- All framework types are properly exported
- Transitive dependencies typed via fastmcp

---

## Build Pipeline

### Build Process

```bash
bun run build        # Compile TypeScript -> dist/
bun run type-check   # Verify types without emitting
bun run test         # Run test suite
bun run lint         # Check code style and errors
bun run format       # Auto-format code
```

### Output Structure

```
dist/
├── index.js           # Compiled main server code (ESM)
├── index.d.ts         # TypeScript type definitions
├── index.js.map       # Source maps for debugging
└── index.d.ts.map     # Type definition maps
```

### Source Organization

```
src/
├── index.ts           # Main server entry point
└── index.test.ts      # Test suite
```

---

## Development Workflow

### Adding a New Tool

1. **Define Zod schema** for parameters
2. **Call server.addTool()** with name, description, parameters, and execute function
3. **Implement execute()** to handle tool logic
4. **Add tests** for new tool
5. **Run `bun run build && bun run test`** to verify

Example:

```typescript
server.addTool({
	name: 'fetch-file-content',
	description: 'Read content of a file',
	parameters: z.object({
		path: z.string(),
	}),
	execute: async (args) => {
		const content = await readFile(args.path);
		return content;
	},
});
```

### Adding a New Resource

Similar pattern: define URI, MIME type, and contents function.

### Adding a New Prompt

Define prompt name, description, arguments, and execute function.

---

## MCP Protocol Compliance

### JSON-RPC 2.0

All communication follows JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": { ... }
}
```

### Initialization Handshake

1. Client sends `initialize` request with capabilities
2. Server responds with `serverInfo`, `protocolVersion`, and capabilities
3. Server is ready to handle tool/resource/prompt requests

### Request/Response Correlation

- Each request has an `id`
- Each response includes the same `id`
- Enables multiplexing and async handling

---

## Testing Strategy

### Test Framework

- **Vitest** - Fast, Vite-native test runner
- **Node environment** - Tests run in Node.js
- **Globals enabled** - describe/it/expect available without imports

### Test Structure

```typescript
describe('DevFlow MCP', () => {
	it('should initialize successfully', () => {
		// Test implementation
	});
});
```

### Running Tests

```bash
bun run test              # Run all tests
bun run test:ui          # Interactive UI
bun run test:coverage    # Coverage report
```

---

## Code Quality

### Linting

**ESLint** with TypeScript support:

- Recommended configurations
- SonarJS for code smells
- Prettier for formatting

```bash
bun run lint      # Check
bun run lint:fix  # Auto-fix
bun run format    # Prettier format
```

### Type Safety

```bash
bun run type-check    # Verify types (no emit)
bun run build         # Build with type checking
```

---

## Migration from Raw SDK

### Previous Approach (Raw SDK)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({...}, {capabilities: {...}});
const transport = new StdioServerTransport();
await server.connect(transport);
```

### New Approach (fastmcp)

```typescript
import { FastMCP } from 'fastmcp';

const server = new FastMCP({ name, version });
await server.start({ transportType: 'stdio' });
```

### Benefits

| Aspect           | Raw SDK | fastmcp             |
| ---------------- | ------- | ------------------- |
| Boilerplate      | High    | Low (39% reduction) |
| Pattern guidance | Manual  | Framework-provided  |
| Tool definition  | Manual  | Method-based        |
| Type safety      | Basic   | Enhanced            |
| Maintainability  | Complex | Simple              |

---

## Deployment Considerations

### Stdio Transport

Current default - suitable for:

- Local CLI tools
- Development
- Direct process communication
- MCP Inspector/Cursor integration

### HTTP/SSE Transport (Future)

For remote access:

- HTTP streaming for efficient transport
- Server-Sent Events for client notifications
- Health check endpoints
- Load balancer compatibility

### Stateless Mode

For serverless/cloud deployment:

- No session state maintenance
- Each request independent
- Better horizontal scaling

---

## Future Extensibility

### Planned Additions

1. **Project Context Tools** - File tree analysis, rule inspection
2. **Resource Handlers** - Dynamic rule/doc access
3. **Prompt Templates** - AI-friendly context formatting
4. **Memory Management** - Persistent state handling
5. **Integration Hooks** - External system connections

### Architecture Patterns

- **Single Responsibility**: Each tool has one purpose
- **Composability**: Tools can combine results
- **Async-first**: All operations support async
- **Type-safe**: Zod validates all inputs
- **Testable**: No side effects by default

---

## Troubleshooting

### Build Issues

- **Type errors**: Check `bun run type-check` output
- **Import errors**: Verify `node_modules` has fastmcp
- **Runtime errors**: Check console output and source maps

### Runtime Issues

- **Protocol errors**: Verify JSON-RPC 2.0 format
- **Timeout**: Increase ping interval or check transport
- **No response**: Verify server is running (`bun run dev`)

### Testing

- **Test failures**: Run `bun run test` with verbose output
- **Type mismatches**: Ensure Zod schemas match test data

---

## References

- **FastMCP**: https://github.com/punkpeye/fastmcp
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **Zod Documentation**: https://zod.dev/
- **TypeScript**: https://www.typescriptlang.org/

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Framework**: fastmcp ^3.23.1
