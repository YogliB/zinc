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
