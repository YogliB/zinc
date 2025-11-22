import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
	{
		name: 'devflow-mcp',
		version: '0.1.0',
	},
	{
		capabilities: {
			tools: {},
			resources: {},
			prompts: {},
		},
	},
);

async function main(): Promise<void> {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('DevFlow MCP Server running on stdio');
}

main().catch(console.error);
