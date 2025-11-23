import { FastMCP } from 'fastmcp';

const server = new FastMCP({
	name: 'devflow-mcp',
	version: '0.1.0',
});

await server.start({
	transportType: 'stdio',
});
console.error('DevFlow MCP Server running on stdio');
